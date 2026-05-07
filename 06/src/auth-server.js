const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(express.json());

const privateKey = fs.readFileSync(__dirname + "/keys/private.key");
const publicKey = fs.readFileSync(__dirname + "/keys/public.key");

const users = {
  admin: { password: "password", role: "admin" },
  user: { password: "password", role: "user" }
};

const { ISSUER, logAction } = require("./common");

// dummy refresh token store
const refreshTokens = {};

// endpoint for user login and token generation
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  logAction(`Login attempt: ${username}`);

  const user = users[username];
  if (!user || user.password !== password) {
    logAction(`Access denied: ${username}`);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const role = user.role;
  const payload = { role: role };
  const signOptions = {
    algorithm: "RS256",
    subject: username,
    issuer: ISSUER,
    expiresIn: "15m"
  };

  const accessToken = jwt.sign(payload, privateKey, signOptions);
  
  const refreshSignOptions = {
    algorithm: "RS256",
    subject: username,
    issuer: ISSUER,
    expiresIn: "7d"
  };

  const refreshToken = jwt.sign(payload, privateKey, refreshSignOptions);

  refreshTokens[refreshToken] = username;
  logAction(`Token generation for ${username}`);

  res.json({ accessToken, refreshToken });
});

// endpoint for refreshing access tokens
app.post("/auth/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  if (!refreshTokens[token]) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ error: "Refresh token expired" });
      }
      return res.status(403).json({ error: "Refresh token signature invalid" });
    }
    const username = decoded.sub;
    const role = decoded.role;
    logAction(`Refresh token usage by ${username}`);
    
    const newAccessToken = jwt.sign(
      { role: role },
      privateKey,
      {
        algorithm: "RS256",
        subject: username,
        issuer: ISSUER,
        expiresIn: "15m"
      }
    );
    res.json({ accessToken: newAccessToken });
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Auth Server running on port ${PORT}`);
});
