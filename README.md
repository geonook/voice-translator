# 🎤 Real-time Voice Translation Service

一個基於 AI 的實時語音翻譯服務，部署在 Zeabur 雲端平台。

## ✨ 功能特色

- 🎤 **實時語音識別**: 支援多種語言的語音輸入
- 🌍 **多語言翻譯**: 支援中文、英文、日文、韓文互譯
- 📊 **即時統計**: 顯示翻譯次數、會話時間、平均響應時間
- 🎵 **音量監控**: 即時顯示麥克風音量水平
- 📱 **響應式設計**: 支援桌面和行動裝置
- 🔒 **安全部署**: HTTPS 加密連線

## 🚀 在 Zeabur 部署

### 1. 準備項目文件

創建以下文件結構：
```
voice-translator/
├── package.json
├── server.js
├── public/
│   ├── index.html
├── ├── style.css
│   └── script.js
└── README.md
```

### 2. 部署到 Zeabur

1. **登入 Zeabur**: 訪問 [zeabur.com](https://zeabur.com) 並登入
2. **創建新項目**: 點擊 "Create Project"
3. **連接 GitHub**: 將代碼推送到 GitHub 倉庫
4. **選擇倉庫**: 在 Zeabur 中選擇您的 GitHub 倉庫
5. **自動部署**: Zeabur 會自動檢測 Node.js 項目並部署
6. **獲取域名**: 部署完成後，您會獲得一個 HTTPS 域名

### 3. 環境變數設定 (可選)

在 Zeabur 控制面板中設定：
- `NODE_ENV=production`
- `PORT=3000` (通常自動設定)

## 🔧 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 服務將在 http://localhost:3000 運行
```

## 📝 使用說明

1. **設定 API Key**: 在配置區域輸入您的 OpenAI API Key
2. **選擇語言**: 設定來源語言和目標語言
3. **允許麥克風**: 點擊請求麥克風權限
4. **測試麥克風**: 確保麥克風正常工作
5. **開始翻譯**: 點擊開始聆聽，開始說話即可看到即時翻譯

## 🔧 技術架構

- **前端**: Vanilla JavaScript, HTML5, CSS3
- **後端**: Node.js + Express
- **語音識別**: Web Speech API
- **翻譯服務**: OpenAI GPT-3.5 Turbo
- **部署平台**: Zeabur
- **安全性**: Helmet.js, CORS

## 📋 系統需求

- **瀏覽器**: Chrome, Edge, Safari (支援 Web Speech API)
- **網路**: HTTPS 連線 (麥克風存取需要)
- **權限**: 麥克風存取權限
- **API**: OpenAI API Key

## 🛠️ 自定義設定

### 修改支援的語言

編輯 `public/script.js` 中的語言選項：

```javascript
// 在 initElements() 中添加更多語言選項
const languages = {
    'zh-TW': '繁體中文',
    'en-US': 'English',
    'ja-JP': '日本語',
    // 添加更多語言...
};
```

### 調整翻譯參數

在 `translateText()` 函數中修改 OpenAI API 參數：

```javascript
{
    model: 'gpt-3.5-turbo',
    temperature: 0.3,  // 調整創造性
    max_tokens: 150    // 調整回應長度
}
```

## 🔍 故障排除

### 麥克風無法存取
- 確保網站使用 HTTPS
- 檢查瀏覽器麥克風權限設定
- 確認麥克風硬體正常運作

### 翻譯 API 錯誤
- 檢查 OpenAI API Key 是否正確
- 確認 API 額度是否充足
- 檢查網路連線狀態

### 語音識別問題
- 確保使用支援的瀏覽器
- 檢查麥克風音量設定
- 嘗試在安靜環境中使用

## 📞 支援

如有問題，請查看：
- [Zeabur 文檔](https://zeabur.com/docs)
- [OpenAI API 文檔](https://platform.openai.com/docs)
- [Web Speech API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📄 授權

MIT License - 詳見 LICENSE 文件
