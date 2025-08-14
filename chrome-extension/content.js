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
        
        // Remove any existing subtitle containers from DOM
        const existingContainers = document.querySelectorAll('#voice-translator-subtitle');
        existingContainers.forEach((container, index) => {
            console.log(`🎤 Removing existing subtitle container ${index + 1}`);
            container.remove();
        });
        
        // Avoid duplicate creation
        if (this.subtitleContainer) {
            console.log('🎤 Subtitle container already exists in instance');
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

        // 簡化 CSS，移除動畫
        const style = document.createElement('style');
        style.textContent = `
            .voice-translator-hide {
                opacity: 0 !important;
                transition: opacity 0.2s ease !important;
            }
            
            .voice-translator-pulse {
                /* 移除脈衝動畫，保持穩定 */
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
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3) !important;
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
                console.log('🎤 Final transcript received, but skipping final translation (real-time only mode):', finalText);
                
                // Cancel any pending interim translation since we got the final result
                if (this.interimTranslationTimeout) {
                    clearTimeout(this.interimTranslationTimeout);
                    this.interimTranslationTimeout = null;
                }
                
                // If we have a cached interim translation for similar text, show it as final
                if (this.lastInterimText && this.isSimilarText(this.lastInterimText, finalText) && this.lastInterimTranslation) {
                    console.log('🎤 Converting cached interim translation to final display:', finalText);
                    const finalTranslationData = {
                        ...this.lastInterimTranslation,
                        isInterim: false
                    };
                    this.showTranslation(finalTranslationData);
                }
            }

            // 即時翻譯：支援長句子分段翻譯（降低門檻）
            if (interimTranscript && interimTranscript.trim().length > 5) {
                const interimText = interimTranscript.trim();
                
                // Cancel previous interim translation
                if (this.interimTranslationTimeout) {
                    clearTimeout(this.interimTranslationTimeout);
                }
                
                // 智能觸發條件：
                // 1. 文字長度達到一定程度
                // 2. 包含自然的句子結構（標點符號或連接詞）
                // 3. 時間間隔達到閾值
                // 檢查是否啟用即時翻譯
                if (!this.settings.enableRealtimeTranslation) {
                    return; // 如果沒有啟用即時翻譯，只等待最終結果
                }
                
                const shouldTranslateImmediately = this.shouldTriggerTranslation(interimText);
                
                // 針對長句子優化的延遲策略
                let delay;
                if (shouldTranslateImmediately) {
                    // 立即翻譯：短延遲
                    delay = 200;
                } else {
                    // 等待更多文字：根據文字長度動態調整延遲
                    const baseDelay = this.settings.realtimeDelay || 600;
                    delay = Math.max(400, Math.min(baseDelay, 800 - interimText.length * 10));
                }
                
                console.log(`🎤 Translation delay set to ${delay}ms for text length ${interimText.length}`);
                
                // 不顯示聆聽文字，保持字幕區域乾淨
                // this.showListeningText(interimText);
                
                // Debounce interim translation to avoid too many API calls
                this.interimTranslationTimeout = setTimeout(() => {
                    // 針對長句子的漸進翻譯策略
                    if (this.lastInterimText) {
                        // 如果新文字只是舊文字的小幅延伸（少於5個字），跳過
                        const extension = interimText.length - this.lastInterimText.length;
                        if (interimText.includes(this.lastInterimText) && extension < 5) {
                            console.log('🎤 Skipping - minimal extension:', interimText);
                            return;
                        }
                        
                        // 對於長句子，允許更頻繁的翻譯（每增加10+字符就翻譯）
                        if (interimText.includes(this.lastInterimText) && extension < 10 && interimText.length < 30) {
                            console.log('🎤 Skipping - waiting for more significant content:', interimText);
                            return;
                        }
                    }
                    
                    console.log(`🎤 Starting real-time translation for:`, interimText);
                    this.requestTranslation(interimText, true); // true = interim
                }, delay);
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



    // 判斷兩個文字是否相似（用於緩存比較）
    isSimilarText(text1, text2) {
        if (!text1 || !text2) return false;
        
        // 移除標點符號和空白，轉為小寫進行比較
        const normalize = (text) => text.replace(/[^\w\u4e00-\u9fff]/g, '').toLowerCase();
        const norm1 = normalize(text1);
        const norm2 = normalize(text2);
        
        // 如果完全相同
        if (norm1 === norm2) return true;
        
        // 如果一個是另一個的子字串或超集（長度差異在20%以內）
        const lengthDiff = Math.abs(norm1.length - norm2.length);
        const maxLength = Math.max(norm1.length, norm2.length);
        const lengthRatio = lengthDiff / maxLength;
        
        if (lengthRatio <= 0.2) {
            // 檢查較短的文字是否包含在較長的文字中
            const shorter = norm1.length <= norm2.length ? norm1 : norm2;
            const longer = norm1.length > norm2.length ? norm1 : norm2;
            return longer.includes(shorter);
        }
        
        return false;
    }

    // 智能判斷是否應該立即觸發翻譯（針對長句子優化）
    shouldTriggerTranslation(text) {
        // 長句子分段翻譯策略
        
        // 1. 基本長度檢查 - 降低門檻以支援更頻繁的翻譯
        if (text.length > 12) {
            
            // 2. 檢查是否包含自然的停頓點（適合分段翻譯）
            const naturalBreakPoints = /[，、；：。！？\,\;\:\.\!\?]|而且|但是|然後|接著|另外|此外|因此|所以|不過|而|和|與|或|以及/;
            if (naturalBreakPoints.test(text)) {
                console.log('🎤 Natural break point found, triggering translation:', text);
                return true;
            }
            
            // 3. 長句子分段策略 - 每15-20字翻譯一次
            if (text.length >= 15 && text.length % 15 < 5) {
                console.log('🎤 Long sentence segment reached, triggering translation:', text);
                return true;
            }
            
            // 4. 檢查是否包含完整的語義單元
            const semanticUnits = /(.*)(的時候|的話|之後|之前|以來|開始|結束|完成|進行|處理|執行|實現|達到|獲得|提供|支援|包含|具有|屬於|關於|對於|根據|通過|透過)/;
            if (semanticUnits.test(text)) {
                console.log('🎤 Semantic unit completed, triggering translation:', text);
                return true;
            }
        }
        
        // 5. 超長句子強制分段（避免單句過長）
        if (text.length > 40) {
            console.log('🎤 Very long sentence, forcing translation:', text);
            return true;
        }
        
        return false;
    }
    
    // 顯示正在聆聽的文字（灰色顯示，表示還未翻譯）
    showListeningText(text) {
        if (!this.showSubtitle || !this.subtitleContainer) return;
        
        // 移除之前的聆聽文字
        const existingListeningText = this.subtitleContainer.querySelector('.listening-text');
        if (existingListeningText) {
            existingListeningText.remove();
        }
        
        // 創建新的聆聽文字元素
        const listeningDiv = document.createElement('div');
        listeningDiv.className = 'listening-text';
        listeningDiv.style.cssText = `
            color: #888 !important; 
            font-size: 16px !important; 
            margin-bottom: 8px !important; 
            opacity: 0.8 !important;
            padding: 8px 12px !important;
            background: rgba(0,0,0,0.3) !important;
            border-radius: 6px !important;
            border-left: 3px solid #888 !important;
        `;
        listeningDiv.innerHTML = `🎤`;
        
        // 檢查是否已有字幕容器內容
        if (this.subtitleContainer.children.length === 0) {
            // 如果沒有現有內容，創建基本結構
            this.subtitleContainer.innerHTML = `
                <button style="position: absolute; top: 8px; right: 12px; background: none; border: none; color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">✕</button>
            `;
            
            // 重新綁定關閉按鈕事件
            const closeButton = this.subtitleContainer.querySelector('button');
            closeButton.addEventListener('click', () => {
                this.hideSubtitle();
            });
        }
        
        // 將聆聽文字插入到字幕容器的開頭（關閉按鈕之後）
        this.subtitleContainer.insertBefore(listeningDiv, this.subtitleContainer.children[1] || null);
        
        this.subtitleContainer.style.display = 'block';
    }

    async requestTranslation(text, isInterim = false) {
        try {
            console.log(`🔄 Requesting ${isInterim ? 'predictive' : 'final'} translation for:`, text);
            
            // 對於 interim 翻譯，檢查是否已經有相同的翻譯正在處理
            if (isInterim && this.lastInterimText === text) {
                console.log('🔄 Skipping duplicate interim translation request for:', text);
                return;
            }
            
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
        
        // 確保 DOM 中只有一個字幕容器
        const allSubtitleContainers = document.querySelectorAll('#voice-translator-subtitle');
        if (allSubtitleContainers.length > 1) {
            console.log('🎤 Found multiple subtitle containers, removing duplicates...');
            // 保留第一個，移除其他的
            for (let i = 1; i < allSubtitleContainers.length; i++) {
                allSubtitleContainers[i].remove();
            }
            // 確保我們的實例指向正確的容器
            this.subtitleContainer = allSubtitleContainers[0];
        }

        const isSystemMessage = data.model === 'system';
        const isListening = data.translated && data.translated.includes('Listening');
        const isInterim = data.isInterim === true;
        
        // 清除之前的聆聽文字
        const existingListeningText = this.subtitleContainer.querySelector('.listening-text');
        if (existingListeningText) {
            existingListeningText.remove();
        }
        
        // Show model info only for real translations, not system messages
        const modelInfo = (data.model && !isSystemMessage) ? `<div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; text-align: right; margin-bottom: 4px;">${data.model}${isInterim ? ' (即時)' : ''}</div>` : '';
        
        // 簡化樣式，減少視覺干擾
        const translationStyle = isInterim 
            ? 'color: #E6E6FA; font-size: 18px; font-weight: 400; text-align: center; padding: 8px 0; opacity: 0.95;'
            : 'color: white; font-size: 20px; font-weight: 500; text-align: center; padding: 8px 0;';
        
        const translationPrefix = isInterim ? '⚡ ' : '';
        
        this.subtitleContainer.innerHTML = `
            <button style="position: absolute; top: 8px; right: 12px; background: none; border: none; color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">✕</button>
            ${modelInfo}
            <div style="${translationStyle}">
                ${translationPrefix}${data.translated}
            </div>
        `;

        // 移除所有動畫效果，保持穩定顯示
        this.subtitleContainer.classList.remove('voice-translator-pulse');
        this.subtitleContainer.style.animation = 'none';

        // Rebind close button event
        const closeButton = this.subtitleContainer.querySelector('button');
        closeButton.addEventListener('click', () => {
            this.hideSubtitle();
        });

        this.subtitleContainer.style.display = 'block';
        
        // 移除自動隱藏功能，讓用戶手動控制
        // 字幕會持續顯示直到用戶關閉或有新翻譯
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

// Initialize content script - prevent duplicate initialization
if (!window.voiceTranslatorInitialized) {
    console.log('🎤🎤🎤 Voice Translator Content Script loaded - Version 1.0 🎤🎤🎤');
    console.log('🎤 Current URL:', window.location.href);
    console.log('🎤 Document ready state:', document.readyState);
    
    // Clean up any existing subtitle containers before creating new instance
    const existingContainer = document.getElementById('voice-translator-subtitle');
    if (existingContainer) {
        console.log('🎤 Removing existing subtitle container');
        existingContainer.remove();
    }
    
    const contentInstance = new VoiceTranslatorContent();
    window.voiceTranslatorInstance = contentInstance;
    window.voiceTranslatorInitialized = true;
    console.log('🎤🎤🎤 Content script initialized successfully 🎤🎤🎤');
} else {
    console.log('🎤 Voice Translator already initialized, skipping...');
}

// Add a test function to window for debugging
window.testVoiceTranslator = () => {
    console.log('🎤 Test function called - Content script is working!');
    if (window.voiceTranslatorInstance) {
        window.voiceTranslatorInstance.showStatus('🧪 Test message from content script');
    }
    return 'Content script is active';
};

// Ready for production - auto-test removed
