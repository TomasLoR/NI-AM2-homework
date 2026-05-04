const CLIENT_ID = '153536616996-if40uao88ag06abv7aj8pi02muo8usg3.apps.googleusercontent.com';
const REDIRECT_URI = 'https://localhost:8444';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const APP_NAME = 'AM2-OAuth';

// simple function to send logs
async function sendLog(message) {
  try {
    await fetch('/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'petert13',
        source: APP_NAME,
        message: message
      })
    });
    console.log(`Logged: ${message}`);
  } catch(e) {
    console.error('Log failed', e);
  }
}

document.getElementById('loginBtn').addEventListener('click', () => {
  sendLog('User initiated login').then(() => {
    // a random string for state to protect against CSRF
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    // setup for OAuth request using Google's Implicit Flow
    const url = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=profile&state=${state}&prompt=consent`;
    window.location.href = url;
  });
});

// implicit flow (token in fragment)
const hashParams = new URLSearchParams(window.location.hash.slice(1));
const token = hashParams.get('access_token');
const returnedState = hashParams.get('state');

if (token) {
  const savedState = sessionStorage.getItem('oauth_state');
  
  if (!savedState || returnedState !== savedState) {
    sendLog('CSRF warning: State mismatch').then(() => {
      document.getElementById('content').textContent = 'Error: CSRF State mismatch';
    });
  } else {
    // clean up state
    sessionStorage.removeItem('oauth_state');
    
    sendLog('Received access token via implicit flow').then(() => {
      document.getElementById('content').textContent = `Received Access Token: ${token}`;
      // now token can be used to fetch user resources
    });
  }
} else {
  sendLog('Application loaded, awaiting login action');
}