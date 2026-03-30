const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_GENERATOR_OPTIONS = {
    hostname: 'http-data-generator',
    port: 80,
    path: '/10',
    method: 'GET'
};

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // serving the HTML page
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/events') {
        // serving the SSE endpoint
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });

        // sending an initial message to confirm connection
        res.write('data: Connected to SSE Server\n\n');

        const sendEvent = () => {
            http.get(DATA_GENERATOR_OPTIONS, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    res.write(`data: ${data}\n\n`);
                });
            }).on('error', (err) => {
                console.error('Error fetching from generator:', err.message);
            });
        };

        // every 2 seconds, fetching new data and sending it to the client
        const intervalId = setInterval(sendEvent, 2000);

        // clean up when the client disconnects
        req.on('close', () => {
            clearInterval(intervalId);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`SSE Server running at http://localhost:${PORT}/`);
});
