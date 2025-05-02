// middleware/auth.js
// Provides authentication and authorization middleware for protecting routes.

import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token from the request header.
 * Adds the decoded user to req.user if valid.
 */
export const verifyToken = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Access denied. Token not provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token." });
  }
};

/**
 * Middleware to authorize user roles for protected routes.
 * @param {string[]} roles - Array of allowed roles (e.g., ['admin'])
 */
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Not authorized." });
    }
    next();
  };
};
