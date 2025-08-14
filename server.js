const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

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
    ? ['https://your-domain.zeabur.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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