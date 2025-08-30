
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";


const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];


    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request object

    console.log(`✅ Authenticated user: ${decoded.id} (Role: ${decoded.role || "N/A"})`);
    console.log('Decoded token:', decoded);

    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `⚠️ Access denied for user ${req.user.id}. Required roles: ${allowedRoles.join(", ")}, but has: ${req.user.role}`
      );
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
