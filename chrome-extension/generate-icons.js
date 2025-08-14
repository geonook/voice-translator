const fs = require('fs');
const { createCanvas } = require('canvas');

// 如果沒有 canvas 套件，我們用簡單的方式創建基本圖示
function createSimpleIcon(size) {
    // 創建一個簡單的 SVG 圖示
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-size="${size * 0.6}" fill="white">🎤</text>
    </svg>`;
    
    return svg;
}

// 創建三個尺寸的 SVG 圖示
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const svg = createSimpleIcon(size);
    fs.writeFileSync(`icons/icon${size}.svg`, svg);
    console.log(`Created icon${size}.svg`);
});

console.log('SVG icons created! Chrome extensions can use SVG icons in manifest v3.');
