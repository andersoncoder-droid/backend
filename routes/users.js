// routes/users.js
// Provides API endpoints for managing users (admin only).

import express from "express";
import User from "../models/User.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/users
 * Get all users (admin only). Passwords are excluded from the response.
 * Protected route.
 */
router.get("/", verifyToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Don't send passwords
    });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * POST /api/users
 * Create a new user (admin only).
 * Protected route.
 */
router.post("/", verifyToken, authorizeRole(["admin"]), async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user
    user = await User.create({
      username,
      email,
      password,
      role: role || "operator",
    });

    // Don't send password back
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user by ID (admin only).
 * Protected route.
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      await user.destroy();
      res.json({ msg: "User removed" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

export default router;
