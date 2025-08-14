#!/bin/bash

# 🚀 Zeabur 部署腳本
# 此腳本幫助您快速部署語音翻譯服務到 Zeabur

echo "🚀 開始部署語音翻譯服務到 Zeabur..."

# 檢查是否在正確的分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "zeabur-deployment" ]; then
    echo "⚠️  當前不在 zeabur-deployment 分支"
    echo "正在切換到 zeabur-deployment 分支..."
    git checkout zeabur-deployment
fi

# 檢查依賴
echo "📦 檢查依賴項..."
if [ ! -f "package.json" ]; then
    echo "❌ 找不到 package.json 檔案"
    exit 1
fi

# 安裝依賴
echo "📥 安裝依賴項..."
npm install

# 檢查 Zeabur CLI
if ! command -v zeabur &> /dev/null; then
    echo "📦 安裝 Zeabur CLI..."
    npm install -g @zeabur/cli
fi

# 檢查是否已登入 Zeabur
echo "🔐 檢查 Zeabur 登入狀態..."
if ! zeabur auth whoami &> /dev/null; then
    echo "請先登入 Zeabur:"
    zeabur auth login
fi

# 部署到 Zeabur
echo "🚀 部署到 Zeabur..."
zeabur deploy

echo "✅ 部署完成！"
echo ""
echo "📋 後續步驟:"
echo "1. 在 Zeabur 控制台檢查部署狀態"
echo "2. 設置自定義域名（可選）"
echo "3. 在網頁介面中配置 OpenAI API 金鑰"
echo "4. 測試語音翻譯功能"
echo ""
echo "📖 詳細說明請參考: ZEABUR_DEPLOYMENT.md"
echo "🌐 Zeabur 控制台: https://dash.zeabur.com"
