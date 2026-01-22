const QRCode = require('qrcode');
const path = require('path');

const url = 'http://localhost:3000'; // Change this to production URL
const outputPath = path.join(__dirname, 'public', 'qrcode.png');

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#808000',  // Olive green
        light: '#F5F5DC'  // Beige background
    },
    width: 500
}, function (err) {
    if (err) throw err;
    console.log('QR Code generated at public/qrcode.png');
});
