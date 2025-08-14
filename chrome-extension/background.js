class VoiceTranslatorBackground {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.settings = {};
        this.currentTabId = null;
        this.translationCache = new Map(); // Translation cache
        this.maxCacheSize = 200; // Increased cache size for better performance
        this.interimCache = new Map(); // Separate cache for interim translations
        
        this.setupMessageListeners();
        this.initSpeechRecognition();
    }

    setupMessageListeners() {
        // Message listeners are set up at the bottom of the file
        // to avoid duplication and ensure proper async handling
        
        // Listen for extension icon clicks
        chrome.action.onClicked.addListener((tab) => {
            // Here you can add logic for handling icon clicks
        });
    }

    initSpeechRecognition() {
        // Note: Web Speech API cannot be used directly in Service Worker
        // We need to handle speech recognition through content script
    }

    async startTranslation(settings, tabId) {
        try {
            console.log('🔧 Background: Starting translation with settings:', settings);
            console.log('🔧 Background: Tab ID:', tabId);
            
            this.settings = settings;
            this.currentTabId = tabId;
            this.isListening = true;

            // Send message to content script to start speech recognition
            if (tabId) {
                console.log('🔧 Background: Sending message to content script...');
                try {
                    await chrome.tabs.sendMessage(tabId, {
                        action: 'startSpeechRecognition',
                        settings: settings
                    });
                    console.log('🔧 Background: Message sent to content script successfully');
                } catch (error) {
                    console.error('🔧 Background: Failed to send message to content script:', error);
                    console.log('🔧 Background: Content script may not be loaded on this tab');
                    
                    // Show error to user
                    this.sendMessageToPopup({
                        action: 'statusUpdate',
                        status: '❌ Please reload the webpage and try again'
                    });
                    
                    throw new Error('Content script not available. Please reload the webpage.');
                }
            } else {
                console.error('🔧 Background: No tab ID provided!');
            }

            // Notify popup of status update
            this.sendMessageToPopup({
                action: 'statusUpdate',
                status: '🎤 Listening...'
            });

        } catch (error) {
            console.error('🔧 Background: Failed to start translation:', error);
            this.sendMessageToPopup({
                action: 'statusUpdate',
                status: '❌ Failed to start: ' + error.message
            });
        }
    }

    async stopTranslation() {
        try {
            console.log('🔧 Background: stopTranslation called');
            console.trace('🔧 Background: Call stack for stopTranslation');
            this.isListening = false;

            // Send message to content script to stop speech recognition
            if (this.currentTabId) {
                console.log('🔧 Background: Sending stop message to content script, tab:', this.currentTabId);
                await chrome.tabs.sendMessage(this.currentTabId, {
                    action: 'stopSpeechRecognition'
                });
            }

            // Notify popup of status update
            this.sendMessageToPopup({
                action: 'statusUpdate',
                status: 'Translation stopped'
            });

        } catch (error) {
            console.error('🔧 Background: Failed to stop translation:', error);
        }
    }

    generateCacheKey(text, sourceLanguage, targetLanguage) {
        return `${sourceLanguage}->${targetLanguage}:${text.toLowerCase().trim()}`;
    }

    // Simple similarity check for short phrases
    isSimilarText(text1, text2) {
        const clean1 = text1.toLowerCase().trim();
        const clean2 = text2.toLowerCase().trim();
        
        // Exact match
        if (clean1 === clean2) return true;
        
        // Length difference check
        if (Math.abs(clean1.length - clean2.length) > 5) return false;
        
        // Simple Levenshtein distance for short texts
        if (clean1.length < 20 && clean2.length < 20) {
            const distance = this.levenshteinDistance(clean1, clean2);
            return distance <= 2; // Allow 2 character differences
        }
        
        return false;
    }

    // Simple Levenshtein distance calculation
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    cleanCache() {
        if (this.translationCache.size > this.maxCacheSize) {
            const entries = Array.from(this.translationCache.entries());
            const toDelete = entries.slice(0, entries.length - this.maxCacheSize + 10);
            toDelete.forEach(([key]) => this.translationCache.delete(key));
            console.log('🔧 Cleaned cache, removed', toDelete.length, 'old entries');
        }
    }

    async translateText(text, sourceLanguage, targetLanguage, apiKey = null, isInterim = false) {
        console.log('🔧 Starting translation:', { text, sourceLanguage, targetLanguage });
        
        if (!text || text.length < 2) {
            console.log('🔧 Text too short, skipping translation');
            return null;
        }

        // Enhanced cache check with fuzzy matching for similar phrases
        const cacheKey = this.generateCacheKey(text, sourceLanguage, targetLanguage);
        
        // Exact match first
        if (this.translationCache.has(cacheKey)) {
            console.log('🔧 ⚡ Using cached translation result (exact match)');
            const cachedResult = this.translationCache.get(cacheKey);
            cachedResult.timestamp = new Date().toISOString();
            return cachedResult;
        }
        
        // Fuzzy match for similar short phrases (performance optimization)
        if (text.length < 50) {
            for (const [key, value] of this.translationCache.entries()) {
                const cachedText = key.split('->')[1].split(':')[1];
                if (cachedText && this.isSimilarText(text, cachedText)) {
                    console.log('🔧 ⚡ Using similar cached translation result');
                    value.timestamp = new Date().toISOString();
                    return value;
                }
            }
        }

        try {
            // Get the model from storage or use default
            const modelResult = await chrome.storage.sync.get(['model']);
            const selectedModel = modelResult.model || 'gpt-4o-mini';
            console.log('🔧 ✅ CONFIRMED USING MODEL:', selectedModel);
            console.log('🔧 📝 Translation request for model:', selectedModel);
            
            // Optimize API parameters for speed - different settings for interim vs final
            const requestBody = {
                model: selectedModel,
                messages: [
                    {
                        role: 'system',
                        content: isInterim 
                            ? `Quickly translate this ${sourceLanguage} text to ${targetLanguage}. This is a partial/interim translation, focus on speed over perfection:` 
                            : `Translate ${sourceLanguage} to ${targetLanguage}:`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: isInterim ? 0 : 0.1,        // Even lower temperature for interim translations
                max_tokens: isInterim ? 60 : 120,        // Fewer tokens for interim to speed up response
                top_p: 1,                                // Focus on most likely tokens
                frequency_penalty: 0,                    // No penalty for speed
                presence_penalty: 0,                     // No penalty for speed
                stream: false                            // Ensure non-streaming for consistent handling
            };
            
            const finalApiKey = apiKey || this.settings.apiKey;
            console.log('🔧 API Key status:', finalApiKey ? `Set (${finalApiKey.substring(0, 10)}...)` : 'Not set');
            
            if (!finalApiKey) {
                throw new Error('No API Key provided');
            }
            
            if (!finalApiKey.startsWith('sk-')) {
                throw new Error('Invalid API Key format. API Key should start with "sk-"');
            }
            
            console.log('🔧 Sending API request with body:', JSON.stringify(requestBody, null, 2));
            
            const apiUrl = 'https://api.openai.com/v1/chat/completions';
            console.log('🔧 API URL:', apiUrl);
            
            // Test basic connectivity to OpenAI
            try {
                console.log('🔧 Testing basic connectivity to OpenAI...');
                const testResponse = await fetch('https://api.openai.com/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${finalApiKey}`
                    }
                });
                console.log('🔧 Connectivity test response status:', testResponse.status);
                console.log('🔧 Connectivity test response URL:', testResponse.url);
                console.log('🔧 Connectivity test response headers:', Object.fromEntries(testResponse.headers.entries()));
                
                if (!testResponse.ok) {
                    const testError = await testResponse.text();
                    console.log('🔧 Connectivity test failed:', testError);
                    
                    // If we get nginx error, there might be a proxy or network issue
                    if (testError.includes('nginx')) {
                        console.error('🔧 NETWORK ISSUE: Getting nginx response instead of OpenAI API');
                        console.error('🔧 This suggests a proxy, firewall, or DNS issue');
                        throw new Error('Network connectivity issue: Unable to reach OpenAI API (nginx response detected)');
                    }
                } else {
                    console.log('🔧 Connectivity test successful');
                }
            } catch (testError) {
                console.error('🔧 Connectivity test error:', testError);
                throw new Error(`Network connectivity test failed: ${testError.message}`);
            }
            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${finalApiKey}`
            };
            console.log('🔧 Request headers:', headers);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔧 API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: errorText
                });
                
                let errorData = {};
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.error('🔧 Failed to parse error response as JSON:', e);
                }
                
                const errorMessage = errorData.error?.message || errorText || response.statusText;
                throw new Error(`API Error ${response.status}: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('🔧 API response:', data);
            
            // Handle different model response formats
            let translation;
            if (data.choices[0].message) {
                // Chat models (gpt-3.5-turbo, gpt-4, etc.)
                translation = data.choices[0].message.content.trim();
            } else {
                // Instruct models (gpt-3.5-turbo-instruct)
                translation = data.choices[0].text.trim();
            }
            console.log('🔧 ✅ Translation completed using model:', selectedModel);
            console.log('🔧 Translation result:', translation);
            
            const result = {
                original: text,
                translated: translation,
                model: selectedModel,
                timestamp: new Date().toISOString()
            };
            
            // Store result in cache
            this.translationCache.set(cacheKey, { ...result });
            this.cleanCache(); // Clean expired cache
            
            console.log('🔧 Translation completed and cached, result:', result);
            console.log('🔧 Cache size:', this.translationCache.size);
            return result;

        } catch (error) {
            console.error('Translation failed:', error);
            throw error;
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

    async sendMessageToPopup(message) {
        try {
            // Send message to all popup instances
            await chrome.runtime.sendMessage(message);
        } catch (error) {
            // Popup might be closed, this is normal
            console.log('Unable to send message to popup:', error.message);
        }
    }

    async sendMessageToContentScript(tabId, message) {
        try {
            if (tabId) {
                await chrome.tabs.sendMessage(tabId, message);
            }
        } catch (error) {
            console.error('Failed to send message to content script:', error);
        }
    }
}

// Service Worker startup log
console.log('🔧🔧🔧 Service Worker started 🔧🔧🔧');
console.log('🔧 Current time:', new Date().toISOString());
console.log('🔧 Service Worker status:', self.registration?.active?.state);

// Initialize background script
console.log('🔧🔧🔧 Background Script initialization started 🔧🔧🔧');
const backgroundInstance = new VoiceTranslatorBackground();
console.log('🔧 Background instance created');

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker install event');
    // Immediately activate new Service Worker
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🔧 Service Worker activate event');
    // Immediately control all clients
    event.waitUntil(self.clients.claim());
});

// Keep Service Worker alive
let keepAliveInterval;
function keepServiceWorkerAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    
    keepAliveInterval = setInterval(() => {
        console.log('🔧 Service Worker staying alive:', new Date().toISOString());
    }, 25000); // Log every 25 seconds to stay alive
}

// Start keep-alive mechanism
keepServiceWorkerAlive();

// Listen for translation requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🔧 Background received message:', message);
    console.log('🔧 Sender info:', sender);
    
    if (message.action === 'test') {
        console.log('🔧 Received test message:', message);
        sendResponse({ success: true, message: 'pong', timestamp: new Date().toISOString() });
        return false; // Synchronous response, no need to keep channel open
    }
    
    if (message.action === 'startTranslation') {
        console.log('🔧 Received startTranslation message:', message);
        (async () => {
            try {
                // Get the current active tab since popup doesn't provide tab info
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                console.log('🔧 Found active tab:', activeTab);
                
                await backgroundInstance.startTranslation(message.settings, activeTab?.id);
                sendResponse({ success: true });
            } catch (error) {
                console.error('🔧 Failed to start translation:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for asynchronous response
    }
    
    if (message.action === 'stopTranslation') {
        console.log('🔧 Received stopTranslation message:', message);
        (async () => {
            try {
                // Get the current active tab
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                console.log('🔧 Found active tab for stop:', activeTab);
                
                await backgroundInstance.stopTranslation();
                sendResponse({ success: true });
            } catch (error) {
                console.error('🔧 Failed to stop translation:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true; // Keep message channel open for asynchronous response
    }
    
    if (message.action === 'requestTranslation') {
        // Use immediately executing async function to handle translation
        (async () => {
            try {
                console.log('🔧 Starting to process translation request...');
                
                // Get API key from storage
                const result = await chrome.storage.sync.get(['apiKey']);
                const apiKey = result.apiKey;
                
                console.log('🔧 API Key status:', apiKey ? 'Set' : 'Not set');
                
                if (!apiKey) {
                    sendResponse({ 
                        success: false, 
                        error: 'Please set OpenAI API Key in the extension popup first' 
                    });
                    return;
                }
                
                // Set API key to background instance
                backgroundInstance.settings.apiKey = apiKey;
                
                console.log('🔧 Starting to call translation service...');
                const translationResult = await backgroundInstance.translateText(
                    message.text,
                    message.sourceLanguage,
                    message.targetLanguage,
                    apiKey,
                    message.isInterim
                );
                
                console.log('🔧 Translation result details:', {
                    result: translationResult,
                    hasResult: !!translationResult,
                    hasTranslated: !!translationResult?.translated,
                    translated: translationResult?.translated,
                    isInterim: message.isInterim
                });
                
                if (translationResult && translationResult.translated) {
                    // 添加 isInterim 標記到回應中
                    const response = { 
                        success: true, 
                        data: {
                            ...translationResult,
                            isInterim: message.isInterim
                        }
                    };
                    console.log('🔧 Sending success response:', response);
                    sendResponse(response);
                } else {
                    const response = { success: false, error: 'Translation service returned empty result or format error' };
                    console.log('🔧 Sending failure response:', response);
                    sendResponse(response);
                }
            } catch (error) {
                console.error('🔧 Failed to process translation request:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        
        return true; // Keep message channel open for asynchronous response
    }
    
    console.log('🔧 Unhandled message:', message);
    return false;
});
