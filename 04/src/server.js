const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
};

// HTTP server serving the client HTML
const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext];

    fs.readFile(path.join(__dirname, filePath), (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// creating WebSocket server attached to the HTTP server and connecting to chat service
const wss = new WebSocket.Server({ server });
const upstreamWs = new WebSocket('ws://ws-chat-service');

upstreamWs.on('message', (message) => {
    // forwarding messages from the server to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
        }
    });
});

upstreamWs.on('error', (error) => {
    console.error('Upstream WebSocket Error:', error);
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // forwarding messages from clients to the upstream server
        if (upstreamWs.readyState === WebSocket.OPEN) {
            upstreamWs.send(message.toString());
        }
    });
    
    ws.on('error', (error) => {
        console.error('Client WebSocket Error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
