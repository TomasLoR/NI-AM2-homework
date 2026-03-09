const { parentPort } = require('worker_threads');

// CPU bound task
const job = (max) => {
    let sum = 0;
    for (let i = 0; i < max; i++) {
        sum += i;
    }
    return sum;
};

// listening for messages from the main thread
parentPort.on('message', (max) => {
    const result = job(max);
    parentPort.postMessage(result);
});
