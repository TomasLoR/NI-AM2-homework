const http = require('http');
const { Worker } = require('worker_threads');

// config
const PORT = 8080;
const SERVICE = 'http://http-job-distributor';

// fetching the max number for the job from the job-distribution service
const fetchJob = () => {
    return new Promise((resolve, reject) => {
        http.get(SERVICE, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData.max);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// CPU bound task
const job = (max) => {
    let sum = 0;
    for (let i = 0; i < max; i++) {
        sum += i;
    }
    return sum;
};


const server = http.createServer(async (req, res) => {
    try {
        if (req.url === '/blocking') {
            // runnning the CPU bound task on the main thread, blocking other requests
            const max = await fetchJob();
            const result = job(max);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ max, result }));
        } else if (req.url === '/non-blocking') {
            // offloadiing the CPU bound task to a worker thread, keeping the main thread free
            const max = await fetchJob();
            const worker = new Worker('./worker.js');
            worker.on('message', (result) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ max, result }));
            });
            worker.on('error', (err) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });
            // sending the max value to the worker to start processing
            worker.postMessage(max);
        } else {
            // other routes
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
