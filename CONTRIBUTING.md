# Contributing to Voice Translator

Thank you for your interest in contributing to Voice Translator! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/geonook/voice-translator/issues) page
- Search existing issues before creating a new one
- Provide detailed information including browser version, steps to reproduce, and expected behavior

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its potential benefits
- Discuss implementation approaches if you have ideas

### Code Contributions

#### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/voice-translator.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Create a pull request

#### Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions focused and small

#### Testing
- Test on multiple browsers (Chrome, Edge, Firefox)
- Verify all features work as expected
- Test with different languages and API models
- Ensure no console errors

### Pull Request Guidelines
- Provide a clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Keep commits atomic and well-documented

## 🛠️ Development Guidelines

### Project Structure
```
chrome-extension/
├── manifest.json      # Extension configuration
├── popup.html/js/css  # Extension popup interface
├── content.js/css     # Webpage integration
├── background.js      # Service worker
└── icons/            # Extension icons
```

### Key Technologies
- **Manifest V3**: Latest Chrome extension format
- **Web Speech API**: Browser-native speech recognition
- **OpenAI API**: GPT models for translation
- **Chrome Storage API**: Settings persistence

### Adding New Features

#### New Language Support
1. Update language lists in `popup.js`
2. Test speech recognition compatibility
3. Update documentation

#### New AI Models
1. Add model options to `popup.html`
2. Update model selection logic in `popup.js`
3. Test API compatibility

#### UI Improvements
1. Maintain consistent design language
2. Ensure responsive design
3. Test accessibility features

## 📋 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Respect different viewpoints and experiences

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information
- Spam or off-topic content

## 🔍 Review Process

### Pull Request Review
1. Automated checks must pass
2. Code review by maintainers
3. Testing on different environments
4. Documentation updates if needed

### Merge Criteria
- Code quality meets standards
- All tests pass
- Documentation is updated
- No breaking changes (unless major version)

## 🆘 Getting Help

### Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

### Community
- [GitHub Discussions](https://github.com/geonook/voice-translator/discussions)
- [Issues Page](https://github.com/geonook/voice-translator/issues)

## 📝 License

By contributing to Voice Translator, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Voice Translator! 🎤✨
