class VoiceTranslatorContent {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.settings = {};
        this.subtitleContainer = null;
        this.showSubtitle = true;
        this.listeningIndicator = null;
        this.errorCount = 0;
        this.keepaliveInterval = null;
        this.interimTranslationTimeout = null;
        this.currentTranslationAbortController = null;
        
        // Cache for interim translations to avoid duplicate API calls
        this.lastInterimText = null;
        this.lastInterimTranslation = null;
        
        this.setupMessageListeners();
        this.createSubtitleContainer();
        this.createListeningIndicator();
    }

    setupMessageListeners() {
        console.log('🎤 Setting up message listeners...');
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('🎤 Content script received message:', message);
            console.log('🎤 Sender info:', sender);
            
            switch (message.action) {
                case 'startSpeechRecognition':
                    console.log('🎤 Starting speech recognition with settings:', message.settings);
                    this.startSpeechRecognition(message.settings);
                    break;
                case 'stopSpeechRecognition':
                    console.log('🎤 Stopping speech recognition');
                    this.stopSpeechRecognition();
                    break;
                case 'showTranslation':
                    console.log('🎤 Showing translation:', message.data || message);
                    this.showTranslation(message.data || message);
                    break;
                case 'toggleSubtitle':
                    console.log('🎤 Toggling subtitle:', message.show);
                    this.toggleSubtitle(message.show);
                    break;
                default:
                    console.log('🎤 Unknown message action:', message.action);
                    break;
            }
        });
        console.log('🎤 Message listeners set up successfully');
    }

    createSubtitleContainer() {
        console.log('🎤 Creating subtitle container...');
        // Avoid duplicate creation
        if (this.subtitleContainer) {
            console.log('🎤 Subtitle container already exists');
            return;
        }

        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.id = 'voice-translator-subtitle';
        this.subtitleContainer.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 999999 !important;
            max-width: 80% !important;
            min-width: 320px !important;
            width: auto !important;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(40, 40, 40, 0.95)) !important;
            color: white !important;
            padding: 20px 24px !important;
            border-radius: 16px !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(20px) !important;
            border: 2px solid rgba(255, 255, 255, 0.15) !important;
            display: none !important;
            animation: slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            pointer-events: auto !important;
            box-sizing: border-box !important;
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 12px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeButton.addEventListener('click', () => {
            this.hideSubtitle();
        });

        this.subtitleContainer.appendChild(closeButton);
        document.body.appendChild(this.subtitleContainer);
        console.log('🎤 Subtitle container added to body');

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
            
            @keyframes pulse {
                0% { 
                    opacity: 0.6; 
                    transform: translateX(-50%) translateY(0) scale(0.98); 
                }
                50% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0) scale(1.02); 
                }
                100% { 
                    opacity: 0.6; 
                    transform: translateX(-50%) translateY(0) scale(0.98); 
                }
            }
            
            .voice-translator-hide {
                animation: slideUp 0.3s ease-out forwards !important;
            }
            
            .voice-translator-pulse {
                animation: pulse 1.5s ease-in-out infinite !important;
            }
        `;
        document.head.appendChild(style);
    }

    createListeningIndicator() {
        // Create a minimal listening indicator
        this.listeningIndicator = document.createElement('div');
        this.listeningIndicator.id = 'voice-translator-listening';
        this.listeningIndicator.style.cssText = `
            position: fixed !important;
            top: 30px !important;
            right: 30px !important;
            width: 12px !important;
            height: 12px !important;
            background: #4CAF50 !important;
            border-radius: 50% !important;
            z-index: 999999 !important;
            display: none !important;
            animation: pulse 1s ease-in-out infinite !important;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5) !important;
        `;
        document.body.appendChild(this.listeningIndicator);
    }

    async startSpeechRecognition(settings) {
        console.log('🎤 Starting speech recognition with settings:', settings);
        this.settings = settings;
        
        // Stop any existing recognition first
        if (this.recognition) {
            console.log('🎤 Stopping existing recognition...');
            this.isListening = false;
            this.recognition.stop();
            this.recognition = null;
        }
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Browser does not support speech recognition');
            this.showStatus('❌ Browser does not support speech recognition');
            return;
        }
        
        // First test microphone permissions
        try {
            console.log('🎤 Testing microphone permissions...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('🎤 Microphone permissions obtained successfully');
            stream.getTracks().forEach(track => track.stop());
            // Don't show status - just start silently for faster experience
        } catch (error) {
            console.error('🎤 Microphone permission error:', error);
            this.showStatus('❌ Microphone permission denied: ' + error.message);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = settings.sourceLanguage;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
            // Show minimal listening indicator
            if (this.listeningIndicator) {
                this.listeningIndicator.style.display = 'block';
            }
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                const finalText = finalTranscript.trim();
                
                // Cancel any pending interim translation
                if (this.interimTranslationTimeout) {
                    clearTimeout(this.interimTranslationTimeout);
                    this.interimTranslationTimeout = null;
                }
                
                // Check if we already have a translation for this exact text
                if (this.lastInterimText === finalText && this.lastInterimTranslation) {
                    console.log('🎤 Using cached interim translation for final result:', finalText);
                    this.showTranslation(this.lastInterimTranslation);
                    // Reset interim cache
                    this.lastInterimText = null;
                    this.lastInterimTranslation = null;
                } else {
                    console.log('🎤 Requesting final translation for:', finalText);
                    this.requestTranslation(finalText);
                }
            }

            // Predictive translation: translate interim results if they're long enough
            if (interimTranscript && interimTranscript.trim().length > 8) {
                const interimText = interimTranscript.trim();
                
                // Cancel previous interim translation
                if (this.interimTranslationTimeout) {
                    clearTimeout(this.interimTranslationTimeout);
                }
                
                // Debounce interim translation to avoid too many API calls
                this.interimTranslationTimeout = setTimeout(() => {
                    console.log('🎤 Starting predictive translation for:', interimText);
                    this.requestTranslation(interimText, true); // true = interim
                }, 800); // Wait 800ms for more speech
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            
            // Track error count to prevent infinite error loops
            this.errorCount = (this.errorCount || 0) + 1;
            
            if (event.error === 'not-allowed') {
                console.log('🎤 Microphone permission denied - stopping service');
                this.showStatus('❌ Microphone permission denied');
                this.stopSpeechRecognition();
                return;
            } 
            
            if (event.error === 'aborted') {
                console.log('🎤 Speech recognition was aborted, this is normal during restart');
                this.errorCount = Math.max(0, this.errorCount - 1); // Don't count aborted as real error
                return;
            }
            
            if (event.error === 'no-speech') {
                console.log('🎤 No speech detected, continuing to listen...');
                this.errorCount = Math.max(0, this.errorCount - 1); // Don't count no-speech as real error
                return;
            }
            
            // For other errors, only restart if we haven't had too many errors recently
            if (this.errorCount <= 3) {
                console.log('🎤 Handling error:', event.error, '- will continue listening');
                // Don't show error status to user for minor errors
                
                // Reset error count after successful period
                setTimeout(() => {
                    this.errorCount = Math.max(0, (this.errorCount || 1) - 1);
                }, 30000); // Reset one error every 30 seconds
                
            } else {
                console.error('🎤 Too many errors, but keeping service alive with keepalive mode');
                this.showStatus(`⚠️ Speech recognition unstable, switching to backup mode`);
                this.startKeepaliveMode();
            }
        };

        this.recognition.onend = () => {
            console.log('🎤 Speech recognition ended, isListening:', this.isListening);
            if (this.isListening) {
                // Auto restart speech recognition with retry mechanism
                this.restartSpeechRecognition();
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            this.showStatus('❌ Failed to start speech recognition');
        }
    }

    stopSpeechRecognition() {
        console.log('🎤 Stopping speech recognition and cleaning up...');
        this.isListening = false;
        
        // Clear all timers and intervals
        if (this.keepaliveInterval) {
            clearInterval(this.keepaliveInterval);
            this.keepaliveInterval = null;
            console.log('🎤 Keepalive interval cleared');
        }
        
        if (this.interimTranslationTimeout) {
            clearTimeout(this.interimTranslationTimeout);
            this.interimTranslationTimeout = null;
            console.log('🎤 Interim translation timeout cleared');
        }
        
        if (this.currentTranslationAbortController) {
            this.currentTranslationAbortController.abort();
            this.currentTranslationAbortController = null;
            console.log('🎤 Translation request aborted');
        }
        
        // Stop recognition
        if (this.recognition) {
            try {
            this.recognition.stop();
                console.log('🎤 Speech recognition stopped');
            } catch (error) {
                console.log('🎤 Error stopping recognition (normal):', error);
            }
            this.recognition = null;
        }
        
        // Reset error count
        this.errorCount = 0;
        
        // Clear interim translation cache
        this.lastInterimText = null;
        this.lastInterimTranslation = null;
        
        // Hide listening indicator
        if (this.listeningIndicator) {
            this.listeningIndicator.style.display = 'none';
        }
        
        this.hideSubtitle();
        console.log('🎤 All cleanup completed');
    }

    restartSpeechRecognition(retryCount = 0) {
        console.log('🎤 Attempting to restart speech recognition, attempt:', retryCount + 1);
        
        if (!this.isListening) {
            console.log('🎤 No longer listening, canceling restart');
            return;
        }
        
        // Maximum 5 retry attempts, then use keepalive mode
        if (retryCount >= 5) {
            console.log('🎤 Max restart attempts reached, switching to keepalive mode');
            this.startKeepaliveMode();
            return;
        }
        
        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 3000); // Gentler backoff, max 3s
        console.log('🎤 Restart delay:', delay + 'ms');
        
        setTimeout(() => {
            if (!this.isListening) {
                console.log('🎤 Listening stopped during restart delay');
                return;
            }
            
            try {
                // Always recreate recognition instance for clean restart
                console.log('🎤 Recreating recognition instance for clean restart...');
                this.recognition = null; // Clear existing instance
                this.startSpeechRecognition(this.settings);
                console.log('🎤 Speech recognition restarted successfully');
                
            } catch (error) {
                console.error('🎤 Restart attempt', retryCount + 1, 'failed:', error);
                // Only retry if still listening
                if (this.isListening) {
                    this.restartSpeechRecognition(retryCount + 1);
                }
            }
        }, delay);
    }

    startKeepaliveMode() {
        console.log('🎤 Starting keepalive mode - will attempt restart every 10 seconds');
        
        if (this.keepaliveInterval) {
            clearInterval(this.keepaliveInterval);
        }
        
        this.keepaliveInterval = setInterval(() => {
            if (!this.isListening) {
                console.log('🎤 Keepalive: No longer listening, stopping keepalive');
                clearInterval(this.keepaliveInterval);
                this.keepaliveInterval = null;
                return;
            }
            
            // Check if recognition is actually running
            if (!this.recognition) {
                console.log('🎤 Keepalive: Recognition not running, attempting restart...');
                try {
                    this.startSpeechRecognition(this.settings);
                } catch (error) {
                    console.error('🎤 Keepalive restart failed:', error);
                }
            } else {
                console.log('🎤 Keepalive: Recognition still active');
            }
        }, 10000); // Check every 10 seconds
    }



    async requestTranslation(text, isInterim = false) {
        try {
            console.log(`🔄 Requesting ${isInterim ? 'predictive' : 'final'} translation for:`, text);
            
            // Cancel any existing translation request if this is a final one
            if (!isInterim && this.currentTranslationAbortController) {
                this.currentTranslationAbortController.abort();
            }
            
            // Create abort controller for this request
            const abortController = new AbortController();
            if (!isInterim) {
                this.currentTranslationAbortController = abortController;
            }
            
            const response = await chrome.runtime.sendMessage({
                action: 'requestTranslation',
                text: text,
                sourceLanguage: this.settings.sourceLanguage,
                targetLanguage: this.settings.targetLanguage,
                isInterim: isInterim
            });

            console.log('🔄 Translation response received:', response);

            if (response && response.success) {
                console.log('🔄 Translation successful, data:', response.data);
                
                // Cache interim translation for potential reuse
                if (isInterim && response.data) {
                    this.lastInterimText = text;
                    this.lastInterimTranslation = response.data;
                    console.log('🔄 Cached interim translation for:', text);
                }
                
                // Hide listening indicator when showing translation
                if (this.listeningIndicator) {
                    this.listeningIndicator.style.display = 'none';
                }
                
                // Translation result will be displayed through showTranslation method
                if (response.data && response.data.translated) {
                    this.showTranslation(response.data);
                } else {
                    console.error('🔄 No translation data in response');
                    this.showStatus('❌ Translation response format error');
                }
            } else {
                console.error('🔄 Translation failed:', response);
                this.showStatus('❌ Translation failed: ' + (response?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('🔄 Translation request failed:', error);
            this.showStatus('❌ Translation request failed: ' + error.message);
        }
    }

    showTranslation(data) {
        if (!this.showSubtitle || !this.subtitleContainer) {
            return;
        }

        const isSystemMessage = data.model === 'system';
        const isListening = data.translated && data.translated.includes('Listening');
        
        // Show model info only for real translations, not system messages
        const modelInfo = (data.model && !isSystemMessage) ? `<div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; text-align: right; margin-bottom: 4px;">${data.model}</div>` : '';
        
        this.subtitleContainer.innerHTML = `
            <button style="position: absolute; top: 8px; right: 12px; background: none; border: none; color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">✕</button>
            ${modelInfo}
            <div style="color: white; font-size: 20px; font-weight: 500; text-align: center; padding: 8px 0;">
                ${data.translated}
            </div>
        `;

        // Add pulse effect for listening status
        if (isListening) {
            this.subtitleContainer.classList.add('voice-translator-pulse');
        } else {
            this.subtitleContainer.classList.remove('voice-translator-pulse');
        }

        // Rebind close button event
        const closeButton = this.subtitleContainer.querySelector('button');
        closeButton.addEventListener('click', () => {
            this.hideSubtitle();
        });

        this.subtitleContainer.style.display = 'block';
        
        // Auto hide translation results after 4 seconds, then show listening indicator again
        if (!isSystemMessage) {
        setTimeout(() => {
            if (this.subtitleContainer.style.display === 'block') {
                this.hideSubtitle();
                    // Show listening indicator again if still listening
                    if (this.isListening && this.listeningIndicator) {
                        this.listeningIndicator.style.display = 'block';
                    }
                }
            }, 4000);
        }
    }

    showStatus(message) {
        if (!this.showSubtitle || !this.subtitleContainer) {
            return;
        }

        // Add pulsing animation for listening status
        const isListening = message.includes('Listening');
        const pulseClass = isListening ? 'voice-translator-pulse' : '';

        this.subtitleContainer.innerHTML = `
            <button style="position: absolute; top: 12px; right: 16px; background: rgba(255, 255, 255, 0.1); border: none; color: rgba(255, 255, 255, 0.8); font-size: 16px; cursor: pointer; padding: 4px 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s ease;">✕</button>
            <div class="${pulseClass}" style="color: white; font-size: 16px; text-align: center; padding: 8px 0;">
                ${message}
            </div>
        `;

        // Add pulse class to container if needed
        if (isListening) {
            this.subtitleContainer.classList.add('voice-translator-pulse');
        } else {
            this.subtitleContainer.classList.remove('voice-translator-pulse');
        }

        // Rebind close button event
        const closeButton = this.subtitleContainer.querySelector('button');
        closeButton.addEventListener('click', () => {
            this.hideSubtitle();
        });

        this.subtitleContainer.style.display = 'block';
    }

    hideSubtitle() {
        if (this.subtitleContainer) {
            this.subtitleContainer.classList.add('voice-translator-hide');
            setTimeout(() => {
                this.subtitleContainer.style.display = 'none';
                this.subtitleContainer.classList.remove('voice-translator-hide');
            }, 300);
        }
    }

    toggleSubtitle(show) {
        this.showSubtitle = show;
        if (!show) {
            this.hideSubtitle();
        }
    }

    getLanguageFlag(code) {
        const flagMap = {
            'zh-TW': '🇹🇼',
            'zh-CN': '🇨🇳',
            'en-US': '🇺🇸',
            'ja-JP': '🇯🇵',
            'ko-KR': '🇰🇷',
            'English': '🇺🇸',
            'Traditional Chinese': '🇹🇼',
            'Simplified Chinese': '🇨🇳',
            'Japanese': '🇯🇵',
            'Korean': '🇰🇷'
        };
        return flagMap[code] || '🌐';
    }
}

// Initialize content script
console.log('🎤🎤🎤 Voice Translator Content Script loaded - Version 1.0 🎤🎤🎤');
console.log('🎤 Current URL:', window.location.href);
console.log('🎤 Document ready state:', document.readyState);
const contentInstance = new VoiceTranslatorContent();
console.log('🎤🎤🎤 Content script initialized successfully 🎤🎤🎤');

// Add a test function to window for debugging
window.testVoiceTranslator = () => {
    console.log('🎤 Test function called - Content script is working!');
    contentInstance.showStatus('🧪 Test message from content script');
    return 'Content script is active';
};

// Ready for production - auto-test removed
