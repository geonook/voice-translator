# 🚀 Zeabur 部署指南

## 概述

此分支專為在 Zeabur 平台上部署語音翻譯服務而優化。Zeabur 是一個現代化的雲端部署平台，提供快速、穩定且可擴展的應用程式託管服務。

## ✨ 特色功能

### 🎯 針對 Zeabur 優化
- ⚡ 快速部署配置
- 🔒 HTTPS 安全連接
- 🌍 全球 CDN 加速
- 📊 實時監控儀表板
- 💾 自動擴展資源

### 🎤 語音翻譯功能
- 🗣️ 即時語音識別
- 🤖 AI 驅動翻譯
- 🌐 多語言支援
- 📱 響應式網頁介面
- 📈 使用統計追蹤

## 🛠️ 部署步驟

### 1. 準備工作
```bash
# 切換到 zeabur-deployment 分支
git checkout zeabur-deployment

# 確保所有依賴項都已安裝
npm install
```

### 2. 在 Zeabur 上部署

#### 方法一：通過 GitHub 連接
1. 登入 [Zeabur 控制台](https://dash.zeabur.com)
2. 點擊 "Create Project" 創建新項目
3. 選擇 "Deploy from GitHub"
4. 選擇您的倉庫和 `zeabur-deployment` 分支
5. Zeabur 會自動檢測到 Node.js 項目並開始部署

#### 方法二：使用 Zeabur CLI
```bash
# 安裝 Zeabur CLI
npm install -g @zeabur/cli

# 登入 Zeabur
zeabur auth login

# 部署項目
zeabur deploy
```

### 3. 配置環境變數
在 Zeabur 控制台中設置以下環境變數：
- `NODE_ENV=production`
- `PORT=3000` (通常 Zeabur 會自動設置)

### 4. 自定義域名（可選）
1. 在 Zeabur 控制台中進入您的服務
2. 點擊 "Domains" 標籤
3. 添加您的自定義域名
4. 按照指示配置 DNS 記錄

## 🔧 配置檔案說明

### zeabur.json
```json
{
  "$schema": "https://zeabur.com/schema.json",
  "name": "voice-translator",
  "services": [
    {
      "name": "voice-translator-web",
      "type": "nodejs",
      "buildCommand": "npm install",
      "startCommand": "npm start",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3000"
      },
      "ports": [
        {
          "port": 3000,
          "type": "http"
        }
      ],
      "healthCheck": {
        "path": "/api/health",
        "timeout": 10
      },
      "resources": {
        "cpu": "0.5",
        "memory": "512Mi"
      }
    }
  ]
}
```

### package.json 優化
- 更新了依賴項以包含 `compression` 中間件
- 設置了適當的 Node.js 版本要求
- 添加了 Zeabur 相關的關鍵字和描述

### server.js 增強
- 啟用 gzip 壓縮以提高性能
- 優化 CORS 設置以支援 Zeabur 域名
- 添加了健康檢查和系統資訊 API 端點
- 增強了靜態檔案緩存設置

## 📊 監控與維護

### API 端點
- `/api/health` - 健康檢查端點
- `/api/info` - 服務資訊端點

### 系統監控
部署後，您可以通過以下方式監控服務：
1. Zeabur 控制台的即時監控儀表板
2. 網頁介面中的系統資訊面板
3. 使用統計追蹤面板

## 🔐 安全性

### HTTPS 支援
- Zeabur 自動為所有部署提供 HTTPS 加密
- 語音識別功能需要 HTTPS 環境才能正常工作
- 所有 API 通信都經過加密保護

### CORS 配置
已針對 Zeabur 域名配置了適當的 CORS 設置：
- 生產環境：支援 `*.zeabur.app` 域名
- 開發環境：支援本地主機

## 🌍 多語言支援

### 支援的語言
**來源語言 (語音識別):**
- 🇹🇼 繁體中文 (zh-TW)
- 🇨🇳 簡體中文 (zh-CN) 
- 🇺🇸 英文 (en-US)
- 🇯🇵 日文 (ja-JP)
- 🇰🇷 韓文 (ko-KR)

**目標語言 (翻譯輸出):**
- English
- Traditional Chinese
- Simplified Chinese
- Japanese
- Korean

## 🚀 性能優化

### 已實施的優化
- ✅ Gzip 壓縮
- ✅ 靜態檔案緩存
- ✅ CDN 加速 (通過 Zeabur)
- ✅ 響應式設計
- ✅ 延遲載入

### 建議的進一步優化
- 實施 Service Worker 以支援離線功能
- 添加圖片優化
- 實施更進階的緩存策略

## 📱 使用指南

### 首次使用
1. 開啟部署的網站
2. 輸入您的 OpenAI API 金鑰
3. 選擇來源和目標語言
4. 點擊 "Request Microphone Permission" 授權麥克風存取
5. 開始語音翻譯

### 故障排除
- **麥克風無法存取**: 確保使用 HTTPS 連接並授權麥克風權限
- **翻譯失敗**: 檢查 API 金鑰是否正確且有足夠配額
- **語音識別不工作**: 確保使用支援的瀏覽器 (Chrome, Edge, Safari)

## 🤝 支援

### 獲取幫助
- 查看 Zeabur [官方文檔](https://docs.zeabur.com)
- 檢查瀏覽器控制台的錯誤訊息
- 使用網頁介面中的系統資訊面板診斷問題

### 常見問題
**Q: 為什麼語音識別不工作？**
A: 語音識別需要 HTTPS 環境。確保您的 Zeabur 部署使用 HTTPS。

**Q: 如何更新 API 金鑰？**
A: 在網頁介面的配置區域更新 OpenAI API 金鑰即可。

**Q: 支援哪些瀏覽器？**
A: 建議使用 Chrome、Edge 或 Safari 以獲得最佳體驗。

---

🎉 **恭喜！** 您的語音翻譯服務現在已成功部署在 Zeabur 上，享受快速、穩定且可擴展的雲端服務體驗！
