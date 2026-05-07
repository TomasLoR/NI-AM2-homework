const ISSUER = "jwt-app";
const LOG_URL = "http://http-log-collector/logs";

// logging function to send logs to the log collector
async function logAction(message) {
  try {
    const payload = JSON.stringify({
      user: 'petert13',
      source: "jwt-app",
      message: message
    });
    const { request } = require("http");
    const { URL } = require("url");
    const logUrl = new URL(LOG_URL);
    
    const req = request({
      hostname: logUrl.hostname,
      port: logUrl.port,
      path: logUrl.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    });

    req.on('error', (e) => {
      console.error(`Problem logging: ${e.message}`);
    });
    req.write(payload);
    req.end();

  } catch (err) {
    console.error("Log failed:", err.message);
  }
}

module.exports = {
  ISSUER,
  logAction
};
