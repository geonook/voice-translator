class VoiceTranslatorPopup {
    constructor() {
        console.log('🎤 Popup: Initializing popup...');
        this.isListening = false;
        this.translationCount = 0;
        this.sessionStartTime = null;
        
        this.initElements();
        this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
        console.log('🎤 Popup: Popup initialized successfully');
    }

    initElements() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveApiKeyBtn = document.getElementById('saveApiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.sourceLanguageSelect = document.getElementById('sourceLanguage');
        this.targetLanguageSelect = document.getElementById('targetLanguage');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.translationCountEl = document.getElementById('translationCount');
        this.sessionTimeEl = document.getElementById('sessionTime');
        this.showSubtitleCheckbox = document.getElementById('showSubtitle');
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'apiKey', 
                'model',
                'sourceLanguage', 
                'targetLanguage', 
                'showSubtitle',
                'translationCount'
            ]);
            
            if (result.apiKey) {
                this.apiKeyInput.value = result.apiKey;
                this.startBtn.disabled = false;
            }
            
            if (result.model) {
                this.modelSelect.value = result.model;
            }
            
            if (result.sourceLanguage) {
                this.sourceLanguageSelect.value = result.sourceLanguage;
            }
            
            if (result.targetLanguage) {
                this.targetLanguageSelect.value = result.targetLanguage;
            }
            
            if (result.showSubtitle !== undefined) {
                this.showSubtitleCheckbox.checked = result.showSubtitle;
            }

            if (result.translationCount) {
                this.translationCount = result.translationCount;
                this.translationCountEl.textContent = this.translationCount;
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                apiKey: this.apiKeyInput.value,
                model: this.modelSelect.value,
                sourceLanguage: this.sourceLanguageSelect.value,
                targetLanguage: this.targetLanguageSelect.value,
                showSubtitle: this.showSubtitleCheckbox.checked,
                translationCount: this.translationCount
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    setupEventListeners() {
        this.saveApiKeyBtn.addEventListener('click', async () => {
            const apiKey = this.apiKeyInput.value.trim();
            if (!apiKey) {
                this.showError('Please enter API Key');
                return;
            }
            
            await this.saveSettings();
            this.startBtn.disabled = false;
            this.updateStatus('✅ API Key saved');
            
            // Test API Key
            this.testApiKey(apiKey);
        });

        this.startBtn.addEventListener('click', () => {
            console.log('🎤 Popup: Start button clicked!');
            this.startTranslation();
        });

        this.stopBtn.addEventListener('click', () => {
            this.stopTranslation();
        });

        this.modelSelect.addEventListener('change', () => {
            this.saveSettings();
            const selectedModel = this.modelSelect.value;
            console.log('🎤 Popup: ✅ Model changed to:', selectedModel);
            this.updateStatus(`📝 Model: ${selectedModel}`, false);
        });

        this.sourceLanguageSelect.addEventListener('change', () => {
            this.saveSettings();
        });

        this.targetLanguageSelect.addEventListener('change', () => {
            this.saveSettings();
        });

        this.showSubtitleCheckbox.addEventListener('change', () => {
            this.saveSettings();
            // Notify content script to update subtitle display settings
            this.sendMessageToContentScript({
                action: 'toggleSubtitle',
                show: this.showSubtitleCheckbox.checked
            });
        });

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'translationResult') {
                this.handleTranslationResult(message.data);
            } else if (message.action === 'statusUpdate') {
                this.updateStatus(message.status);
            }
        });

        // Update session time
        setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                this.sessionTimeEl.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    async testApiKey(apiKey) {
        try {
            this.updateStatus('🔍 Testing API Key...');
            
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                this.updateStatus('✅ API Key is valid');
            } else {
                this.updateStatus('❌ API Key is invalid');
                this.startBtn.disabled = true;
            }
        } catch (error) {
            this.updateStatus('❌ Unable to verify API Key');
            console.error('API Key test failed:', error);
        }
    }

    async startTranslation() {
        console.log('🎤 Popup: Starting translation...');
        
        if (!this.apiKeyInput.value.trim()) {
            this.showError('Please enter OpenAI API Key first');
            return;
        }

        try {
            this.isListening = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            if (!this.sessionStartTime) {
                this.sessionStartTime = Date.now();
            }

            const settings = {
                apiKey: this.apiKeyInput.value,
                model: this.modelSelect.value,
                sourceLanguage: this.sourceLanguageSelect.value,
                targetLanguage: this.targetLanguageSelect.value,
                showSubtitle: this.showSubtitleCheckbox.checked
            };
            
            console.log('🎤 Popup: Sending message to background with settings:', settings);

            // Send message to background script to start translation
            const response = await chrome.runtime.sendMessage({
                action: 'startTranslation',
                settings: settings
            });
            
            console.log('🎤 Popup: Received response from background:', response);

            this.updateStatus('🎤 Listening...', true);
            
        } catch (error) {
            console.error('🎤 Popup: Error starting translation:', error);
            this.showError('Failed to start translation: ' + error.message);
            this.resetButtons();
        }
    }

    async stopTranslation() {
        try {
            this.isListening = false;
            
            console.log('🎤 Popup: Sending stop message to background');
            // Send message to background script to stop translation
            await chrome.runtime.sendMessage({
                action: 'stopTranslation'
            });

            this.resetButtons();
            this.updateStatus('Translation stopped');
            
        } catch (error) {
            console.error('Error stopping translation:', error);
            this.resetButtons();
        }
    }

    resetButtons() {
        console.log('🎤 Popup: Resetting buttons - this will stop translation');
        console.trace('🎤 Popup: Call stack for resetButtons');
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
    }

    handleTranslationResult(data) {
        this.translationCount++;
        this.translationCountEl.textContent = this.translationCount;
        this.saveSettings();
        
        // Send translation result to content script to display subtitles
        if (this.showSubtitleCheckbox.checked) {
            this.sendMessageToContentScript({
                action: 'showTranslation',
                original: data.original,
                translated: data.translated,
                sourceLanguage: this.sourceLanguageSelect.value,
                targetLanguage: this.targetLanguageSelect.value
            });
        }
    }

    async sendMessageToContentScript(message) {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (tab) {
                await chrome.tabs.sendMessage(tab.id, message);
            }
        } catch (error) {
            console.error('Failed to send message to content script:', error);
        }
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
        // Create error element
        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        // Insert before status element
        this.status.parentNode.insertBefore(errorDiv, this.status);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }
}

// 初始化彈出視窗
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎤 Popup: DOM loaded, creating popup instance...');
    const popupInstance = new VoiceTranslatorPopup();
    console.log('🎤 Popup: Popup instance created:', popupInstance);
    
    // Add global access for debugging
    window.popupInstance = popupInstance;
});
