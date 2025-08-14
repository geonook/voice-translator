# 🔧 圖標問題修正指南

## 問題
Chrome Web Store 需要 PNG 格式的圖標，但我們目前使用的是 SVG。

## 快速解決方案

### 方法 1：使用線上工具轉換（推薦）
1. 訪問 [CloudConvert](https://cloudconvert.com/svg-to-png) 或 [Convertio](https://convertio.co/svg-png/)
2. 上傳以下 SVG 文件：
   - `chrome-extension/icons/icon16.svg`
   - `chrome-extension/icons/icon48.svg`
   - `chrome-extension/icons/icon128.svg`
3. 轉換為對應尺寸的 PNG 文件
4. 下載並替換原始 SVG 文件

### 方法 2：使用 macOS 預覽程式
1. 用預覽程式打開 SVG 文件
2. 選擇「檔案」→「輸出」
3. 格式選擇 PNG
4. 設定正確的解析度
5. 儲存為對應的檔名

### 方法 3：使用我們的 HTML 工具
1. 打開 `chrome-extension/create-png-icons.html`
2. 點擊「Generate Extension Icons」
3. 分別下載 16x16、48x48、128x128 PNG 圖標
4. 重命名為 `icon16.png`、`icon48.png`、`icon128.png`
5. 放入 `chrome-extension/icons/` 目錄

## 修正後重新打包

```bash
# 確保 PNG 圖標已就位後
./package-extension.sh
```

## 驗證
```bash
# 檢查新的 ZIP 內容
unzip -l dist/voice-translator-extension.zip | grep png
```

應該看到：
```
icons/icon16.png
icons/icon48.png
icons/icon128.png
```

## 注意事項
- PNG 文件必須是正方形
- 建議使用透明背景
- 確保圖標在小尺寸下仍清晰可見
- 16x16 圖標會顯示在瀏覽器工具列
- 48x48 用於擴充功能管理頁面
- 128x128 用於 Chrome Web Store

完成後重新上傳到 Chrome Web Store！
