// Debug version of content script - Version 2.0 - 2024/08/14 11:10
console.log('🔍🔍🔍 Voice Translator Content Script loaded - Version 2.0 - 2024/08/14 11:10 🔍🔍🔍');
console.log('🔍 If you see this message, the debug version has been loaded successfully!');

class VoiceTranslatorContentDebug {
    constructor() {
        console.log('🔍 Initializing VoiceTranslatorContentDebug');
        this.recognition = null;
        this.isListening = false;
        this.settings = {};
        this.subtitleContainer = null;
        this.showSubtitle = true;
        
        this.setupMessageListeners();
        this.createSubtitleContainer();
        
        // Test subtitle display
        setTimeout(() => {
            this.testSubtitle();
        }, 2000);
        
        // Add manual test buttons
        this.addTestButtons();
    }

    testSubtitle() {
        console.log('🔍 Testing subtitle display');
        this.showStatus('🧪🧪🧪 Version 2.0 Test Subtitle - 2024/08/14 11:10 🧪🧪🧪');
        
        setTimeout(() => {
            this.showTranslation({
                original: 'Test Original Text',
                translated: 'Test Translation Result',
                timestamp: new Date().toISOString()
            });
        }, 3000);
    }

    addTestButtons() {
        console.log('🔍 Adding test buttons');
        
        // Create test button container
        const testContainer = document.createElement('div');
        testContainer.id = 'voice-translator-test-buttons';
        testContainer.style.cssText = `
            position: fixed !important;
            top: 100px !important;
            right: 20px !important;
            z-index: 999998 !important;
            background: rgba(0, 0, 0, 0.8) !important;
            padding: 10px !important;
            border-radius: 8px !important;
            font-family: Arial, sans-serif !important;
        `;
        
        // Test microphone button
        const testMicBtn = document.createElement('button');
        testMicBtn.textContent = '🎤 Test Microphone';
        testMicBtn.style.cssText = `
            display: block !important;
            width: 120px !important;
            margin: 5px 0 !important;
            padding: 8px !important;
            background: #4CAF50 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
        `;
        
        testMicBtn.addEventListener('click', async () => {
            console.log('🔍 Manual microphone test');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.showStatus('✅ Microphone permission normal');
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                this.showStatus('❌ Microphone error: ' + error.message);
            }
        });
        
        // Test speech recognition button
        const testSpeechBtn = document.createElement('button');
        testSpeechBtn.textContent = '🗣️ Test Speech';
        testSpeechBtn.style.cssText = testMicBtn.style.cssText;
        testSpeechBtn.style.background = '#2196F3 !important';
        
        testSpeechBtn.addEventListener('click', () => {
            console.log('🔍 Manual speech recognition test');
            this.startSpeechRecognition({
                sourceLanguage: 'zh-TW',
                targetLanguage: 'English'
            });
        });
        
        // Stop test button
        const stopTestBtn = document.createElement('button');
        stopTestBtn.textContent = '⏹️ Stop Test';
        stopTestBtn.style.cssText = testMicBtn.style.cssText;
        stopTestBtn.style.background = '#f44336 !important';
        
        stopTestBtn.addEventListener('click', () => {
            console.log('🔍 Manual stop test');
            this.stopSpeechRecognition();
        });
        
        // Hide button
        const hideBtn = document.createElement('button');
        hideBtn.textContent = '❌ Hide';
        hideBtn.style.cssText = testMicBtn.style.cssText;
        hideBtn.style.background = '#9E9E9E !important';
        
        hideBtn.addEventListener('click', () => {
            testContainer.style.display = 'none';
        });
        
        testContainer.appendChild(testMicBtn);
        testContainer.appendChild(testSpeechBtn);
        testContainer.appendChild(stopTestBtn);
        testContainer.appendChild(hideBtn);
        
        document.body.appendChild(testContainer);
        console.log('🔍 Test buttons added');
    }

    setupMessageListeners() {
        console.log('🔍 Setting up message listeners');
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('🔍 Received message:', message);
            
            switch (message.action) {
                case 'startSpeechRecognition':
                    console.log('🔍 Start speech recognition');
                    this.startSpeechRecognition(message.settings);
                    break;
                case 'stopSpeechRecognition':
                    console.log('🔍 Stop speech recognition');
                    this.stopSpeechRecognition();
                    break;
                case 'showTranslation':
                    console.log('🔍 Show translation:', message);
                    this.showTranslation(message.data || message);
                    break;
                case 'toggleSubtitle':
                    console.log('🔍 Toggle subtitle:', message.show);
                    this.toggleSubtitle(message.show);
                    break;
                default:
                    console.log('🔍 Unknown message:', message);
                    break;
            }
        });
    }

    createSubtitleContainer() {
        console.log('🔍 Creating subtitle container');
        
        // Avoid duplicate creation
        if (this.subtitleContainer) {
            console.log('🔍 Subtitle container already exists');
            return;
        }

        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.id = 'voice-translator-subtitle-debug';
        this.subtitleContainer.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 999999 !important;
            max-width: 70% !important;
            min-width: 280px !important;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.92), rgba(30, 30, 30, 0.92)) !important;
            color: white !important;
            padding: 20px 24px !important;
            border-radius: 16px !important;
            font-family: 'Segoe UI', 'Arial', sans-serif !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(20px) !important;
            border: 2px solid rgba(255, 255, 255, 0.15) !important;
            display: block !important;
            pointer-events: auto !important;
            animation: slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute !important;
            top: 8px !important;
            right: 12px !important;
            background: yellow !important;
            border: none !important;
            color: black !important;
            font-size: 18px !important;
            cursor: pointer !important;
            padding: 2px 6px !important;
            border-radius: 3px !important;
        `;
        
        closeButton.addEventListener('click', () => {
            console.log('🔍 Close button clicked');
            this.hideSubtitle();
        });

        this.subtitleContainer.appendChild(closeButton);
        
        // Ensure adding to body
        if (document.body) {
            document.body.appendChild(this.subtitleContainer);
            console.log('🔍 Subtitle container added to body');
        } else {
            console.log('🔍 body does not exist, waiting for DOM load');
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(this.subtitleContainer);
                console.log('🔍 Subtitle container added to body (DOMContentLoaded)');
            });
        }
    }

    showTranslation(data) {
        console.log('🔍 showTranslation called:', data);
        
        if (!this.showSubtitle) {
            console.log('🔍 Subtitle display is turned off');
            return;
        }
        
        if (!this.subtitleContainer) {
            console.log('🔍 Subtitle container does not exist, recreating');
            this.createSubtitleContainer();
            return;
        }

        console.log('🔍 Displaying translation result');
        
        this.subtitleContainer.innerHTML = `
            <button style="position: absolute; top: 8px; right: 12px; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
            <div style="color: white; font-size: 18px; font-weight: 600; text-align: center; line-height: 1.4; padding: 8px 0;">
                ${data.translated || 'Unknown'}
            </div>
            <div style="margin-top: 12px; color: rgba(255, 255, 255, 0.6); font-size: 11px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
                ${data.responseTime ? `⚡ ${data.responseTime}ms` : ''}
            </div>
        `;

        // Rebind close button event
        const closeButton = this.subtitleContainer.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('🔍 Close button clicked');
                this.hideSubtitle();
            });
        }

        this.subtitleContainer.style.display = 'block';
        console.log('🔍 Translation result displayed');
        
        // Auto hide after 5 seconds for smoother experience
        setTimeout(() => {
            if (this.subtitleContainer && this.subtitleContainer.style.display === 'block') {
                console.log('🔍 Auto hide translation result');
                this.hideSubtitle();
            }
        }, 5000);
    }

    showStatus(message) {
        console.log('🔍 showStatus called:', message);
        
        if (!this.showSubtitle) {
            console.log('🔍 Subtitle display is turned off');
            return;
        }
        
        if (!this.subtitleContainer) {
            console.log('🔍 Subtitle container does not exist, recreating');
            this.createSubtitleContainer();
            return;
        }

        this.subtitleContainer.innerHTML = `
            <button style="position: absolute; top: 8px; right: 12px; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
            <div style="color: white; font-size: 16px; text-align: center; font-weight: 500; padding: 8px 0;">
                ${message}
            </div>
        `;

        // Rebind close button event
        const closeButton = this.subtitleContainer.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('🔍 Close button clicked');
                this.hideSubtitle();
            });
        }

        this.subtitleContainer.style.display = 'block';
        console.log('🔍 Status message displayed');
    }

    hideSubtitle() {
        console.log('🔍 Hide subtitle');
        if (this.subtitleContainer) {
            this.subtitleContainer.style.display = 'none';
        }
    }

    toggleSubtitle(show) {
        console.log('🔍 Toggle subtitle display:', show);
        this.showSubtitle = show;
        if (!show) {
            this.hideSubtitle();
        }
    }

    // Real speech recognition test
    async startSpeechRecognition(settings) {
        console.log('🔍 Start speech recognition, settings:', settings);
        this.settings = settings;
        
        // First test microphone permissions
        try {
            console.log('🔍 testingmicrophonepermissions...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('🔍 Microphone permissions obtained successfully');
            stream.getTracks().forEach(track => track.stop());
            
            this.showStatus('✅ Microphone permissions normal, starting speech recognition...');
            
        } catch (error) {
            console.error('🔍 microphonepermissionsfailed:', error);
            this.showStatus('❌ microphonepermissionsfailed: ' + error.message);
            return;
        }
        
        // Check speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('🔍 Speech recognition not supported');
            this.showStatus('❌ Browser does not support speech recognition');
            return;
        }
        
        console.log('🔍 Browser supports speech recognition');
        
        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = settings.sourceLanguage || 'zh-TW';
            
            console.log('🔍 Speech recognition settings completed, language:', this.recognition.lang);

            // Use unified event setup function
            this.setupSpeechRecognitionEvents();

            // startingspeech recognition
            this.recognition.start();
            console.log('🔍 Speech recognition start command sent');
            
        } catch (error) {
            console.error('🔍 speech recognitioninitializationfailed:', error);
            this.showStatus('❌ speech recognitioninitializationfailed: ' + error.message);
        }
    }

    restartSpeechRecognition() {
        console.log('🔍 Restart speech recognition');
        
        if (!this.isListening) {
            console.log('🔍 Already stopped listening, not restarting');
            return;
        }
        
        try {
            // Clean up old recognition instance
            if (this.recognition) {
                this.recognition.onstart = null;
                this.recognition.onresult = null;
                this.recognition.onerror = null;
                this.recognition.onend = null;
                this.recognition = null;
            }
            
            // Recreate speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.settings.sourceLanguage || 'zh-TW';
            
            // Optimize speech recognition speed
            this.recognition.maxAlternatives = 1; // Only want best result
            this.recognition.serviceURI = ''; // Use default service
            
            // Reset event handlers
            this.setupSpeechRecognitionEvents();
            
            // starting
            this.recognition.start();
            console.log('🔍 speech recognition重啟successfully');
            
        } catch (error) {
            console.error('🔍 重啟speech recognitionfailed:', error);
            this.showStatus('❌ speech recognition重啟failed，請手動restart');
            this.isListening = false;
        }
    }

    setupSpeechRecognitionEvents() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            console.log('🔍 speech recognition已starting');
            this.isListening = true;
            this.showStatus('🎤 Listening... Please speak');
        };

        this.recognition.onresult = (event) => {
            console.log('🔍 收到speech recognitionresult:', event);
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                console.log('🔍 transcription文字:', transcript, 'final:', event.results[i].isFinal);
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                console.log('🔍 finaltranscription:', finalTranscript);
                // 直接translation，不顯示過場畫面
                this.requestTranslation(finalTranscript.trim());
            }

            if (interimTranscript) {
                console.log('🔍 temporarytranscription:', interimTranscript);
                this.showStatus('🎤 Listening...');
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🔍 speech recognitionerror:', event.error);
            
            let errorMessage = '';
            let shouldRestart = false;
            
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'microphonepermissionsdenied';
                    this.isListening = false;
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected，continue listening...';
                    shouldRestart = true;
                    break;
                case 'audio-capture':
                    errorMessage = 'audio capturefailed';
                    this.isListening = false;
                    break;
                case 'network':
                    errorMessage = 'networkerror';
                    shouldRestart = true;
                    break;
                case 'aborted':
                    errorMessage = 'speech recognitioninterrupted，restarting...';
                    shouldRestart = true;
                    break;
                default:
                    errorMessage = event.error + '，trying torestarting...';
                    shouldRestart = true;
            }
            
            this.showStatus('⚠️ ' + errorMessage);
            
            if (shouldRestart && this.isListening) {
                console.log('🔍 errorimmediately after重啟speech recognition');
                setTimeout(() => {
                    if (this.isListening) {
                        this.restartSpeechRecognition();
                    }
                }, 1000); // 增加延遲到1秒
            }
        };

        this.recognition.onend = () => {
            console.log('🔍 speech recognition結束');
            if (this.isListening) {
                console.log('🔍 normal completion後restartingspeech recognition');
                setTimeout(() => {
                    if (this.isListening) {
                        this.restartSpeechRecognition();
                    }
                }, 500);
            }
        };
    }

    stopSpeechRecognition() {
        console.log('🔍 stopspeech recognition');
        this.isListening = false;
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.log('🔍 stopspeech recognitionencountered error:', error);
            }
            this.recognition = null;
        }
        
        this.showStatus('⏹️ speech recognition已stop');
        setTimeout(() => {
            this.hideSubtitle();
        }, 2000);
    }

    async testBackgroundConnection() {
        console.log('🔍 testing background script connection...');
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'test',
                message: 'ping'
            });
            console.log('🔍 Background connectiontestingresponse:', response);
            return response;
        } catch (error) {
            console.error('🔍 Background connectiontestingfailed:', error);
            
            if (error.message.includes('Extension context invalidated')) {
                this.showStatus('⚠️ Extension has been updated，請reload此webpage');
                this.createReloadButton();
                return null;
            }
            
            return null;
        }
    }

    createReloadButton() {
        // 創建reload按鈕
        const reloadBtn = document.createElement('div');
        reloadBtn.id = 'voice-translator-reload-btn';
        reloadBtn.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 999999 !important;
            background: linear-gradient(45deg, #FF9800, #F57C00) !important;
            color: white !important;
            padding: 20px 30px !important;
            border-radius: 15px !important;
            font-family: Arial, sans-serif !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            box-shadow: 0 8px 32px rgba(255, 152, 0, 0.5) !important;
            text-align: center !important;
            border: 3px solid white !important;
        `;
        
        reloadBtn.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 20px;">⚠️ Extension has been updated</div>
            <div style="margin-bottom: 15px; font-size: 14px;">Please reload this page to continue using</div>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🔄 Click to reload webpage
            </div>
        `;
        
        reloadBtn.addEventListener('click', () => {
            window.location.reload();
        });
        
        // 移除舊的按鈕（如果存在）
        const existingBtn = document.getElementById('voice-translator-reload-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        document.body.appendChild(reloadBtn);
        console.log('🔍 已創建reload按鈕');
    }

    async requestTranslation(text) {
        const startTime = performance.now();
        console.log('🔍 requesttranslation:', text);
        // 移除「translation中...」的過場畫面，直接processtranslation
        
        // checkextensionstatus
        console.log('🔍 checkextensionstatus...');
        console.log('🔍 chrome.runtime.id:', chrome.runtime?.id);
        console.log('🔍 chrome.runtime available:', !!chrome.runtime);
        
        // 先testing background connection（靜默testing）
        const testResult = await this.testBackgroundConnection();
        if (!testResult) {
            // 只在真正failed時才顯示error
            console.error('🔍 unable toconnection到 background script');
            return;
        }
        
        try {
            console.log('🔍 preparesendtranslationrequest:', {
                text: text,
                sourceLanguage: this.settings.sourceLanguage || 'zh-TW',
                targetLanguage: this.settings.targetLanguage || 'English'
            });

            // sendtranslationrequest給 background script
            console.log('🔍 正在send runtime.sendMessage...');
            
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'requestTranslation',
                    text: text,
                    sourceLanguage: this.settings.sourceLanguage || 'zh-TW',
                    targetLanguage: this.settings.targetLanguage || 'English'
                }, (response) => {
                    console.log('🔍 Promise callback 收到response:', response);
                    console.log('🔍 chrome.runtime.lastError:', chrome.runtime.lastError);
                    
                    if (chrome.runtime.lastError) {
                        const error = chrome.runtime.lastError;
                        console.error('🔍 Runtime error詳細:', error);
                        
                        if (error.message.includes('message port closed')) {
                            reject(new Error('Service Worker 在processrequest時被回收，請重試'));
                        } else {
                            reject(new Error(error.message));
                        }
                    } else {
                        resolve(response);
                    }
                });
            });

            console.log('🔍 收到 runtime.sendMessage response:', response);
            console.log('🔍 translationresponse完整內容:', JSON.stringify(response, null, 2));

            // 更詳細的check
            console.log('🔍 response分析:', {
                responseExists: !!response,
                responseType: typeof response,
                success: response?.success,
                successType: typeof response?.success,
                data: response?.data,
                dataType: typeof response?.data,
                dataKeys: response?.data ? Object.keys(response.data) : null,
                translated: response?.data?.translated,
                translatedType: typeof response?.data?.translated,
                error: response?.error
            });

            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            console.log('🔍 translation響應時間:', responseTime + 'ms');

            if (response && response.success && response.data && response.data.translated) {
                console.log('🔍 translationsuccessfully:', response.data.translated, `(${responseTime}ms)`);
                this.showTranslation({
                    original: text,
                    translated: response.data.translated,
                    timestamp: new Date().toISOString(),
                    responseTime: responseTime
                });
            } else if (response && response.success && response.data && response.data.original && response.data.translated !== undefined) {
                // process直接的數據格式
                console.log('🔍 translationsuccessfully (直接格式):', response.data.translated, `(${responseTime}ms)`);
                this.showTranslation({
                    original: text,
                    translated: response.data.translated || 'translationresult為空',
                    timestamp: new Date().toISOString(),
                    responseTime: responseTime
                });
            } else {
                console.error('🔍 translationresponse格式error，詳細資訊:', {
                    hasResponse: !!response,
                    success: response?.success,
                    hasData: !!response?.data,
                    hasTranslated: !!response?.data?.translated,
                    error: response?.error,
                    fullResponse: response
                });
                
                // Silently handle errors without interrupting user experience
                // Only log in console, let speech recognition continue working
            }
        } catch (error) {
            console.error('🔍 Request translation failed:', error);
            this.showStatus('❌ Translation request failed: ' + error.message);
        }
    }
}

// Initialize debug version
console.log('🔍 Preparing to initialize debug version');
const debugInstance = new VoiceTranslatorContentDebug();
console.log('🔍 Debug version initialization completed');
