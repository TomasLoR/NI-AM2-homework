const http2 = require('http2');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
});

server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  const reqPath = headers[':path'];
  const method = headers[':method'];

  if (method === 'GET' && reqPath === '/') {
    stream.respond({
      'content-type': 'text/html',
      ':status': 200
    });
    stream.end(fs.readFileSync('index.html'));
  } else if (method === 'GET' && reqPath === '/script.js') {
    stream.respond({
      'content-type': 'application/javascript',
      ':status': 200
    });
    stream.end(fs.readFileSync('script.js'));
  } else if (method === 'POST' && reqPath === '/log') {
    // collecting the JSON log
    let body = '';
    stream.on('data', chunk => body += chunk.toString());
    stream.on('end', () => {
      // forwarding the log to the log collector service
      const req = http.request('http://http-log-collector/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        stream.respond({ ':status': 200 });
        stream.end('Logged');
      });
      req.on('error', (e) => {
        console.error('Log collector error:', e.message);
        stream.respond({ ':status': 500 });
        stream.end('Log Error');
      });
      req.write(body);
      req.end();
    });
  } else {
    stream.respond({ ':status': 404 });
    stream.end('Not Found');
  }
});

server.listen(8444, () => {
  console.log('Server is running on https://localhost:8444');
});