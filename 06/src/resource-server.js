const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(express.json());

const publicKey = fs.readFileSync(__dirname + "/keys/public.key");
const roles = require("./roles.json");

const { ISSUER, logAction } = require("./common");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const verifyOptions = { algorithms: ["RS256"], issuer: ISSUER };

  jwt.verify(token, publicKey, verifyOptions, (err, decoded) => {
    if (err) {
      logAction("Token verification failed");
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
    
    // successfully extracted claims
    const username = decoded.sub;
    logAction(`Token verification successful for ${username}`);
    req.user = decoded;
    next();
  });
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    const role = req.user.role;
    const userPermissions = roles[role];
    
    // checking for exact permission or any permission for the action
    const [action] = permission.split(':');
    const anyPermission = `${action}:any`;
    
    if (userPermissions && (userPermissions.includes(permission) || userPermissions.includes(anyPermission))) {
      logAction(`Access granted for ${permission} to ${req.user.sub}`);
      next();
    } else {
      logAction(`Access denied for ${permission} to ${req.user.sub}`);
      res.status(403).json({ error: "Insufficient permissions" });
    }
  };
};

// endpoint for users with read:any permission
app.get("/data/any", verifyToken, checkPermission("read:any"), (req, res) => {
  res.json({ data: "This is sensitive data for admins." });
});

// endpoint for users with read:own or read:any permissions
app.get("/data/own", verifyToken, checkPermission("read:own"), (req, res) => {
  res.json({ data: "This is data for normal users." });
});

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Resource Server running on port ${PORT}`);
});
