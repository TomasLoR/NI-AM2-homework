const statusInput = document.getElementById('statusInput');
const progressBar = document.getElementById('progressBar');
const xhrBtn = document.getElementById('xhrBtn');
const fetchBtn = document.getElementById('fetchBtn');
const sizeInput = document.getElementById('sizeInput');

function updateStatus(text) {
    statusInput.value = text;
}

function updateProgress(percent) {
    const barLength = 20;
    const filledLength = Math.round((barLength * percent) / 100);
    const bar = '='.repeat(filledLength) + ' '.repeat(barLength - filledLength);
    progressBar.innerText = `[${bar}] ${percent}%`;
}

function getValidatedSize() {
    const size = parseInt(sizeInput.value);
    const MAX_SIZE = 1e10;
    
    if (isNaN(size) || size <= 0 || size > MAX_SIZE) {
        alert('Enter a valid positive number with a limit of 10GB');
        return null;
    }
    
    return size;
}

// XHR implementation
xhrBtn.addEventListener('click', () => {
    const size = getValidatedSize();
    if (!size) return;

    const xhr = new XMLHttpRequest();
    
    // tracking XHR state transitions
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 1) {
            updateStatus('loading');
        } else if (xhr.readyState === 2) {
            updateStatus('loaded');
        } else if (xhr.readyState === 3) {
            updateStatus('downloading');
        } else if (xhr.readyState === 4) {
            updateStatus('finished downloading');
            updateProgress(100);
        }
    };

    // updating progress bar as data arrives
    xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            updateProgress(percent);
        }
    });

    xhr.addEventListener('error', () => {
        updateStatus('Error occurred');
    });

    xhr.open('GET', `/data/${size}`); 
    xhr.send();
});


// Fetch API implementation
fetchBtn.addEventListener('click', async () => {
    const size = getValidatedSize();
    if (!size) return;

    updateProgress(0);
    updateStatus('loading');
    
    try {
        const response = await fetch(`/data/${size}`); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        updateStatus('loaded');
        
        // streaming data using ReadableStream API
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;

        updateStatus('downloading');
        
        // reading chunks and calculating progress
        while(true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            receivedLength += value.length;
            if (contentLength) {
                const percent = Math.round((receivedLength / contentLength) * 100);
                updateProgress(percent);
            }
        }

        updateStatus('finished downloading');
        updateProgress(100);

    } catch (error) {
        console.error('Fetch error:', error);
        updateStatus('Error');
    }
});