class RealtimeTranslationService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.apiKey = '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.translationCount = 0;
        this.sessionStartTime = null;
        this.responseTimes = [];
        
        this.initElements();
        this.initSpeechRecognition();
        this.setupEventListeners();
        this.displaySystemInfo();
        this.checkEnvironment();
    }

    checkEnvironment() {
        // Check if HTTPS environment
        if (location.protocol === 'https:' || location.hostname === 'localhost') {
            this.updateStatus('🔒 Click "Request Microphone Permission" to get started', false);
        } else {
            this.updateStatus('⚠️ HTTPS required for microphone access. Please use HTTPS deployment.', false);
            this.permissionBtn.textContent = '⚠️ HTTPS Required';
            this.permissionBtn.disabled = true;
        }
    }

    async displaySystemInfo() {
        try {
            const info = [];
            info.push('Environment: Zeabur Deployment');
            info.push('Protocol: ' + location.protocol);
            info.push('HTTPS: ' + (location.protocol === 'https:' ? 'Yes' : 'No'));
            info.push('getUserMedia: ' + (navigator.mediaDevices?.getUserMedia ? 'Supported' : 'Not supported'));
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            info.push('Speech Recognition: ' + (SpeechRecognition ? 'Supported' : 'Not supported'));
            
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(d => d.kind === 'audioinput');
                info.push('Audio Devices: ' + audioInputs.length + ' detected');
            } catch (e) {
                info.push('Audio Devices: ' + (location.protocol === 'https:' ? 'Permission needed' : 'HTTPS required'));
            }
            
            // Check health status
            try {
                const response = await fetch('/api/health');
                const health = await response.json();
                info.push('Server Status: ' + health.status);
                info.push('Server Time: ' + new Date(health.timestamp).toLocaleTimeString());
            } catch (e) {
                info.push('Server Status: Unable to connect');
            }
            
            this.systemInfo.textContent = info.join('\n');
            
        } catch (error) {
            this.systemInfo.textContent = 'System info unavailable: ' + error.message;
        }
    }

    async requestMicrophonePermission() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.showError('🚫 HTTPS is required for microphone access. Please ensure your Zeabur deployment uses HTTPS.');
            return;
        }
        
        this.permissionBtn.disabled = true;
        this.permissionBtn.textContent = '⏳ Requesting Permission...';
        this.updateStatus('🔒 Requesting microphone permission...', false);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Test and stop the stream
            const tracks = stream.getTracks();
            console.log('Successfully got microphone stream');
            tracks.forEach(track => track.stop());
            
            // Permission granted
            this.updateStatus('✅ Microphone permission granted! Test your microphone or start listening.', false);
            this.startBtn.disabled = false;
            this.testBtn.style.display = 'inline-flex';
            this.permissionBtn.textContent = '✅ Permission Granted';
            this.permissionBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            this.displaySystemInfo();
            
            setTimeout(() => {
                this.permissionBtn.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            console.error('Microphone permission error:', error);
            this.handlePermissionError(error);
        }
    }

    handlePermissionError(error) {
        let errorMessage = '';
        let troubleshooting = '';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage = 'Microphone access denied.';
                troubleshooting = 'Please refresh and allow microphone access in your browser.';
                break;
            case 'NotFoundError':
                errorMessage = 'No microphone found.';
                troubleshooting = 'Please connect a microphone and try again.';
                break;
            case 'NotSupportedError':
                errorMessage = 'Microphone not supported in this browser.';
                troubleshooting = 'Please use Chrome, Edge, or Safari.';
                break;
            default:
                errorMessage = 'Unable to access microphone: ' + error.message;
                troubleshooting = 'Check your browser microphone settings.';
        }
        
        this.showError('❌ ' + errorMessage + ' ' + troubleshooting);
        this.updateStatus('❌ Microphone permission required.', false);
        this.permissionBtn.disabled = false;
        this.permissionBtn.textContent = '🔒 Try Again';
    }

    initElements() {
        this.permissionBtn = document.getElementById('permissionBtn');
        this.testBtn = document.getElementById('testBtn');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.status = document.getElementById('status');
        this.subtitleDisplay = document.getElementById('subtitleDisplay');
        this.errorDiv = document.getElementById('error');
        this.apiKeyInput = document.getElementById('apiKey');
        this.apiUrlInput = document.getElementById('apiUrl');
        this.sourceLanguageSelect = document.getElementById('sourceLanguage');
        this.targetLanguageSelect = document.getElementById('targetLanguage');
        this.volumeIndicator = document.getElementById('volumeIndicator');
        this.volumeBar = document.getElementById('volumeBar');
        this.floatingMic = document.getElementById('floatingMic');
        this.systemInfo = document.getElementById('systemInfo');
        this.translationCountEl = document.getElementById('translationCount');
        this.sessionTimeEl = document.getElementById('sessionTime');
        this.avgResponseEl = document.getElementById('avgResponse');
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.showError('❌ Speech recognition not supported. Please use Chrome, Edge, or Safari.');
            this.updateStatus('❌ Browser not supported.', false);
            this.startBtn.disabled = true;
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.sourceLanguageSelect.value;

        this.recognition.onstart = () => {
            this.updateStatus('🎤 Listening...', true);
            this.floatingMic.style.display = 'flex';
            this.floatingMic.classList.add('recording');
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
                this.translateText(finalTranscript.trim());
            }

            if (interimTranscript) {
                this.updateStatus(`🎤 Hearing: ${interimTranscript}`, true);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showError('❌ Microphone permission denied.');
                this.startBtn.disabled = true;
            } else if (event.error === 'no-speech') {
                this.updateStatus('🎤 Listening... (No speech detected)', true);
            } else {
                this.showError(`Speech recognition error: ${event.error}`);
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                setTimeout(() => {
                    if (this.isListening) {
                        try {
                            this.recognition.start();
                        } catch (error) {
                            console.error('Failed to restart recognition:', error);
                            this.stopListening();
                        }
                    }
                }, 100);
            } else {
                this.updateStatus('📱 Listening stopped', false);
                this.floatingMic.style.display = 'none';
                this.floatingMic.classList.remove('recording');
            }
        };
    }

    setupEventListeners() {
        this.permissionBtn.addEventListener('click', () => this.requestMicrophonePermission());
        this.testBtn.addEventListener('click', () => this.testMicrophone());
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        this.sourceLanguageSelect.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.sourceLanguageSelect.value;
            }
        });
        
        this.floatingMic.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // Session timer
        setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                this.sessionTimeEl.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    async startListening() {
        this.apiKey = this.apiKeyInput.value.trim();
        this.apiUrl = this.apiUrlInput.value.trim() || 'https://api.openai.com/v1/chat/completions';

        if (!this.apiKey) {
            this.showError('Please enter your OpenAI API key');
            return;
        }

        if (!this.recognition) {
            this.showError('Speech recognition initialization failed');
            return;
        }

        try {
            await this.initAudioContext();
            
            this.isListening = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.hideError();
            
            if (!this.sessionStartTime) {
                this.sessionStartTime = Date.now();
            }
            
            this.recognition.start();
            this.volumeIndicator.style.display = 'block';
            this.startVolumeMonitoring();
            
        } catch (error) {
            this.showError('Unable to access microphone: ' + error.message);
            this.isListening = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }

    stopListening() {
        this.isListening = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.volumeIndicator.style.display = 'none';
        this.stopVolumeMonitoring();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    clearHistory() {
        this.subtitleDisplay.innerHTML = `
            <p style="text-align: center; color: rgba(255,255,255,0.6); font-size: 18px;">
                💬 Translation results will appear here
            </p>`;
        this.translationCount = 0;
        this.translationCountEl.textContent = '0';
        this.responseTimes = [];
        this.avgResponseEl.textContent = '0ms';
        this.sessionStartTime = null;
        this.sessionTimeEl.textContent = '00:00';
    }

    async initAudioContext() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.microphone.connect(this.analyser);
        } catch (error) {
            throw new Error('Unable to access microphone. Please ensure microphone permission is granted.');
        }
    }

    startVolumeMonitoring() {
        const updateVolume = () => {
            if (!this.isListening || !this.analyser) return; 
            
            this.analyser.getByteFrequencyData(this.dataArray);
            const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
            const percentage = Math.min(100, (average / 128) * 100);
            
            this.volumeBar.style.width = percentage + '%';
            
            requestAnimationFrame(updateVolume);
        };
        updateVolume();
    }

    stopVolumeMonitoring() {
        // Volume monitoring stops automatically when isListening becomes false
    }

    async testMicrophone() {
        this.testBtn.disabled = true;
        this.testBtn.textContent = '🔍 Testing...';
        this.updateStatus('🎤 Testing microphone...', false);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 256;
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let maxVolume = 0;
            let sampleCount = 0;
            
            const checkAudio = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                maxVolume = Math.max(maxVolume, average);
                sampleCount++;
                
                if (sampleCount < 100) {
                    requestAnimationFrame(checkAudio);
                } else {
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                    
                    if (maxVolume > 5) {
                        this.updateStatus('✅ Microphone is working! Max volume: ' + Math.round(maxVolume), false);
                        this.testBtn.textContent = '✅ Mic Working';
                        this.testBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                    } else {
                        this.updateStatus('⚠️ Microphone detected but no audio input. Check if muted.', false);
                        this.testBtn.textContent = '⚠️ No Audio';
                        this.testBtn.style.background = 'linear-gradient(45deg, #FF9800, #F57C00)';
                    }
                    this.testBtn.disabled = false;
                }
            };
            
            checkAudio();
            
        } catch (error) {
            console.error('Microphone test error:', error);
            this.showError('Microphone test failed: ' + error.message);
            this.testBtn.disabled = false;
            this.testBtn.textContent = '❌ Test Failed';
        }
    }

    async translateText(text) {
        if (!text || text.length < 2) return;

        const startTime = Date.now();
        this.updateStatus(`🔄 Translating: ${text}`, true);

        try {
            const sourceLanguage = this.getLanguageFullName(this.sourceLanguageSelect.value);
            const targetLanguage = this.targetLanguageSelect.value;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translation assistant. Translate the ${sourceLanguage} text to ${targetLanguage}. Only return the translation result without any additional text.`
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const translation = data.choices[0].message.content.trim();
            
            const responseTime = Date.now() - startTime;
            this.updateStats(responseTime);
            
            this.displayTranslation(text, translation);
            this.updateStatus('🎤 Listening...', true);

        } catch (error) {
            console.error('Translation error:', error);
            this.showError(`Translation failed: ${error.message}`);
            this.updateStatus('🎤 Listening...', true);
        }
    }

    getLanguageFullName(code) {
        const languageMap = {
            'zh-TW': 'Traditional Chinese',
            'zh-CN': 'Simplified Chinese',
            'en-US': 'English',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean'
        };
        return languageMap[code] || 'Unknown';
    }

    updateStats(responseTime) {
        this.translationCount++;
        this.translationCountEl.textContent = this.translationCount.toString();
        
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > 10) {
            this.responseTimes.shift();
        }
        
        const avgResponse = Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length);
        this.avgResponseEl.textContent = avgResponse + 'ms';
    }

    displayTranslation(original, translated) {
        const timestamp = new Date().toLocaleTimeString('en-US');
        const sourceFlag = this.getLanguageFlag(this.sourceLanguageSelect.value);
        const targetFlag = this.getLanguageFlag(this.targetLanguageSelect.value);
        
        const subtitleItem = document.createElement('div');
        subtitleItem.className = 'subtitle-item';
        subtitleItem.innerHTML = `
            <div class="original-text">${sourceFlag} ${original}</div>
            <div class="translated-text">${targetFlag} ${translated}</div>
            <div class="timestamp">${timestamp}</div>
        `;

        if (this.subtitleDisplay.innerHTML.includes('Translation results will appear here')) {
            this.subtitleDisplay.innerHTML = '';
        }

        this.subtitleDisplay.insertBefore(subtitleItem, this.subtitleDisplay.firstChild);

        const items = this.subtitleDisplay.querySelectorAll('.subtitle-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }

        subtitleItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    updateStatus(message, isListening = false) {
        this.status.textContent = message;
        if (isListening) {
            this.status.classList.add('listening');
        } else {
            this.status.classList.remove('listening');
        }
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.className = 'error';
        this.errorDiv.style.display = 'block';
        setTimeout(() => {
            this.hideError();
        }, 8000);
    }



    hideError() {
        this.errorDiv.style.display = 'none';
    }
}

// Initialize service
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new RealtimeTranslationService();
    }, 500);
});
