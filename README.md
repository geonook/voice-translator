# 🎤 Voice Translator - Real-time AI Voice Translation

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)](https://chrome.google.com/webstore/)
[![GitHub](https://img.shields.io/badge/GitHub-geonook%2Fvoice--translator-blue)](https://github.com/geonook/voice-translator)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful Chrome extension that provides real-time voice translation using OpenAI's advanced GPT models. Transform your browsing experience with instant, accurate AI-powered translation of your speech.

## ✨ Features

### 🗣️ **Real-time Voice Translation**
- Instant speech-to-text conversion using Chrome's Web Speech API
- AI-powered translation with high accuracy
- Live subtitle overlay on any webpage
- Minimal visual indicator during listening

### 🤖 **Multiple AI Models**
- **GPT-4o Mini** (Recommended for speed and efficiency)
- **GPT-4o** (Best quality and accuracy)
- **GPT-3.5 Turbo** (Fastest response time)
- **GPT-4** (High quality)
- **GPT-4 Turbo** (Advanced capabilities)

### ⚡ **Smart & Fast**
- Predictive translation for faster results
- Intelligent caching to reduce API calls and costs
- Optimized performance with minimal latency
- Smart error recovery and auto-restart

### 🎨 **Beautiful Interface**
- Clean, modern popup design
- Elegant subtitle overlay with smooth animations
- Customizable display options
- Dark theme with professional styling

### 🔒 **Privacy First**
- Your API key stays securely on your device
- No data stored on our servers
- Voice processing happens locally in your browser
- Only translated text is sent to OpenAI using your personal API key

### 🌍 **Multi-language Support**
- **Chinese** (Traditional & Simplified)
- **English**
- **Japanese**
- **Korean**
- And more languages supported by Chrome Speech API

## 🚀 Quick Start

### Prerequisites
- Chrome browser with speech recognition support
- Valid OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Microphone access

### Installation
1. Download the extension from [Chrome Web Store](https://chrome.google.com/webstore/) (coming soon)
2. Or install from source (see Development section)

### Setup
1. Click the extension icon in your browser toolbar
2. Enter your OpenAI API key
3. Select your source language (what you'll speak)
4. Select your target language (what you want it translated to)
5. Choose your preferred AI model
6. Click "Start Translation" and start speaking!

## 📋 How to Use

1. **Configure Settings**: Set up your API key, languages, and preferred AI model
2. **Start Translation**: Click the "Start Translation" button
3. **Speak Naturally**: The extension will listen and display a small green indicator
4. **View Results**: Translations appear as elegant subtitle overlays
5. **Enjoy**: The extension works on any webpage!

## 🔧 Advanced Features

### Caching System
- Automatic caching of translation results
- Fuzzy matching for similar phrases
- Reduces API costs and improves speed

### Error Handling
- Robust error recovery
- Auto-restart on connection issues
- Keepalive mode for long-term stability

### Performance Optimization
- Predictive translation for interim results
- Smart debouncing to reduce API calls
- Optimized API parameters for speed

## 🛠️ Development

### Project Structure
```
voice-translator/
├── chrome-extension/          # Extension source code
│   ├── manifest.json         # Extension manifest
│   ├── popup.html/js/css     # Extension popup UI
│   ├── content.js/css        # Content script for webpage integration
│   ├── background.js         # Service worker
│   └── icons/                # Extension icons
├── docs/                     # Documentation
└── dist/                     # Built extension package
```

### Build from Source
```bash
# Clone the repository
git clone https://github.com/geonook/voice-translator.git
cd voice-translator

# Package the extension
./package-extension.sh

# The packaged extension will be in dist/voice-translator-extension.zip
```

### Load in Chrome (Development)
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## 📊 Supported Languages

| Language | Code | Speech Recognition | Translation |
|----------|------|-------------------|-------------|
| Chinese (Traditional) | zh-TW | ✅ | ✅ |
| Chinese (Simplified) | zh-CN | ✅ | ✅ |
| English | en-US | ✅ | ✅ |
| Japanese | ja-JP | ✅ | ✅ |
| Korean | ko-KR | ✅ | ✅ |

## 🔐 Privacy & Security

- **Local Processing**: All voice recognition happens in your browser
- **Secure Storage**: API keys stored securely using Chrome's storage API
- **No Data Collection**: We don't collect or store any personal data
- **Transparent Communication**: Only translated text is sent to OpenAI
- **User Control**: You control your data and can delete it anytime

Read our full [Privacy Policy](https://geonook.github.io/voice-translator/privacy-policy.html)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/geonook/voice-translator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/geonook/voice-translator/discussions)
- **Documentation**: [Wiki](https://github.com/geonook/voice-translator/wiki)

## 🙏 Acknowledgments

- OpenAI for providing the GPT models
- Google Chrome team for the Web Speech API
- The open source community for inspiration and support

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Real-time voice translation
- Multiple AI model support
- Smart caching system
- Beautiful UI with dark theme
- Comprehensive error handling

---

**Made with ❤️ by [geonook](https://github.com/geonook)**

*Transform your browsing experience with AI-powered voice translation!*