const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// 啟用 gzip 壓縮
app.use(compression());

// 安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com"],
      mediaSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://voice-translator.zeabur.app',
        'https://*.zeabur.app',
        /\.zeabur\.app$/
      ] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 靜態文件服務 (含緩存設置)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'Zeabur',
    node_version: process.version,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// 環境資訊 API
app.get('/api/info', (req, res) => {
  res.json({
    platform: 'Zeabur',
    service: 'Voice Translation',
    version: '1.0.0',
    features: [
      'Real-time Speech Recognition',
      'AI-powered Translation',
      'Multi-language Support',
      'Web-based Interface'
    ],
    supported_languages: {
      source: ['zh-TW', 'zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
      target: ['English', 'Traditional Chinese', 'Simplified Chinese', 'Japanese', 'Korean']
    }
  });
});

// 主頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 處理
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🎤 Voice Translation Service running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
});