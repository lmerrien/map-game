// Simple HTTP Server for 2D Map Game
const http = require('http');
const fs = require('fs');
const path = require('path');

// const PORT = 3000;
// const HOST = 'localhost';
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer((request, response) => {
    console.log(`📨 Request received: ${request.method} ${request.url}`);
    
    let filePath = './public' + request.url;
    if (filePath === './public/') {
        filePath = './public/index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
    };
    
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<h1>404 - File Not Found</h1>', 'utf-8');
                console.log('❌ File not found:', filePath);
            } else {
                response.writeHead(500);
                response.end('Server Error: ' + error.code);
                console.log('❌ Server error:', error.code);
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
            console.log('✅ File served successfully:', filePath);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║      🗺️  2D Map Game Server Started!         ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🌐 Server running at: http://${HOST}:${PORT}/`);
    console.log('');
    console.log('📝 Instructions:');
    console.log('   1. Open your web browser');
    console.log(`   2. Go to: http://${HOST}:${PORT}/`);
    console.log('   3. Use buttons or arrow keys to move the unit!');
    console.log('');
    console.log('🛑 To stop the server: Press Ctrl+C');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Server Activity Log:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log('❌ Error: Port 3000 is already in use!');
        console.log('   Try changing the PORT in server.js to a different number (e.g., 3001)');
    } else {
        console.log('❌ Server error:', error);
    }
});
