const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = (event) => {
    const messageEl = document.createElement('div');
    messageEl.textContent = event.data;
    chat.appendChild(messageEl);
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

function sendMessage() {
    const message = messageInput.value;
    if (message && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        messageInput.value = '';
    }
}

sendBtn.addEventListener('click', sendMessage);