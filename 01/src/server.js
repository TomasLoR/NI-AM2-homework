const http = require('http');
const fs = require('fs');
const path = require('path');

// config
const PORT = 8080;
const DATA_GENERATOR_HOST = 'http-data-generator';

// object for static file operations
const ServeStatic = {
    exists: async (filePath) => {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    },
    readContent: async (filePath) => {
        return await fs.promises.readFile(filePath, "binary");
    }
};

const server = http.createServer(async (req, res) => {
    // Route 1 - proxy requests to external data generator service
    if (req.url.startsWith('/data')) {
        const sizePath = req.url.replace('/data', ''); 
        const size = parseFloat(sizePath.substring(1));

        if (isNaN(size) || size > 1e10) {
            res.writeHead(400);
            res.end('Invalid size or size exceeds 10GB limit');
            return;
        }
        
        // set up HTTP request options to forward to external service
        const options = {
            hostname: DATA_GENERATOR_HOST,
            port: 80,
            path: sizePath,
            method: 'GET',
            headers: req.headers
        };

        const connector = http.request(options, (resp) => {
            res.writeHead(resp.statusCode, resp.headers);
            resp.pipe(res);
        });

        connector.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            res.writeHead(500);
            res.end(e.message);
        });

        req.pipe(connector);
        return;
    }

    // Route 2 - serving static files
    const fileName = req.url === '/' ? 'index.html' : req.url.substring(1);
    const filePath = path.join(__dirname, fileName);

    if (await ServeStatic.exists(filePath)) {
        try {
            const data = await ServeStatic.readContent(filePath);
            const ext = path.extname(filePath);
            // mapping file extensions to appropriate Content-Type headers
            const contentTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'text/javascript'
            };
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.write(data, "binary");
            res.end();
        } catch (err) {
            res.statusCode = 400;
            res.end();
        }
    } else {
        res.statusCode = 404;
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
