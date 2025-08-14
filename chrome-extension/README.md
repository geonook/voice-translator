# 🎤 Voice Translator Chrome 擴充套件

即時語音翻譯 Chrome 擴充套件，使用 OpenAI API 提供高品質翻譯服務。

## ✨ 功能特色

- 🎤 **即時語音識別** - 在任何網頁上進行語音輸入
- 🌍 **多語言翻譯** - 支援中文、英文、日文、韓文互譯  
- 📱 **浮動字幕顯示** - 在網頁上方顯示翻譯結果
- ⚙️ **簡潔設定介面** - 易於配置 API Key 和語言設定
- 📊 **使用統計** - 追蹤翻譯次數和使用時間

## 🚀 安裝步驟

### 1. 準備圖示檔案

1. 在瀏覽器中開啟 `create-icons.html`
2. 右鍵點擊每個圖示並儲存為對應的檔名：
   - `icon16.png` (16x16)
   - `icon48.png` (48x48) 
   - `icon128.png` (128x128)
3. 將這些檔案放入 `icons/` 資料夾

### 2. 載入擴充套件

1. 開啟 Chrome 瀏覽器
2. 在網址列輸入 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇 `chrome-extension` 資料夾
6. 擴充套件會出現在工具列中

### 3. 設定 API Key

1. 點擊工具列中的擴充套件圖示
2. 在彈出視窗中輸入您的 OpenAI API Key
3. 點擊「儲存」按鈕
4. 選擇來源語言和目標語言

## 📋 使用方法

1. **開始翻譯**：點擊「🎤 開始翻譯」按鈕
2. **允許麥克風權限**：首次使用時瀏覽器會要求麥克風權限
3. **開始說話**：說出您想翻譯的內容
4. **查看結果**：翻譯結果會顯示在網頁頂部的浮動字幕中
5. **停止翻譯**：點擊「⏹️ 停止翻譯」按鈕

## ⚙️ 設定選項

- **API Key**：您的 OpenAI API 金鑰
- **來源語言**：要翻譯的語言（語音輸入語言）
- **目標語言**：翻譯成的語言
- **顯示字幕**：是否在網頁上顯示翻譯字幕

## 🔧 檔案結構

```
chrome-extension/
├── manifest.json          # 擴充套件配置
├── popup.html             # 彈出視窗界面
├── popup.css              # 彈出視窗樣式
├── popup.js               # 彈出視窗邏輯
├── background.js          # 背景腳本
├── content.js             # 內容腳本
├── content.css            # 內容腳本樣式
├── create-icons.html      # 圖示生成工具
├── icons/                 # 圖示資料夾
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🛠️ 技術實現

### 架構說明

1. **Popup (彈出視窗)**
   - 使用者介面和設定管理
   - API Key 儲存和驗證
   - 語言選擇和統計顯示

2. **Background Script (背景腳本)**
   - 處理 OpenAI API 翻譯請求
   - 管理擴充套件生命週期
   - 協調 popup 和 content script 之間的通訊

3. **Content Script (內容腳本)**
   - 語音識別功能實現
   - 浮動字幕顯示
   - 與網頁的互動處理

### 權限說明

- `activeTab`：存取當前分頁
- `storage`：儲存設定資料
- `scripting`：注入腳本
- `https://api.openai.com/*`：呼叫 OpenAI API

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
- 確保使用 Chrome、Edge 或 Safari
- 檢查麥克風音量設定
- 嘗試在安靜環境中使用

### 字幕不顯示
- 確認「顯示字幕」選項已開啟
- 檢查網頁是否阻擋內容腳本
- 嘗試重新載入網頁

## 📦 打包發佈

如要發佈到 Chrome Web Store：

1. 將 `chrome-extension` 資料夾壓縮成 zip 檔案
2. 登入 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. 上傳 zip 檔案並填寫相關資訊
4. 等待審核通過

## 🔒 隱私說明

- API Key 僅儲存在本地瀏覽器中
- 語音資料僅用於即時翻譯，不會被儲存
- 翻譯請求直接發送到 OpenAI API
- 不會收集或傳輸任何個人資料

## 📄 授權

MIT License - 詳見 LICENSE 文件

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！
