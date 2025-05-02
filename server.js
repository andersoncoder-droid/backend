// server.js
// Main entry point for the backend server. Sets up Express, Socket.io, database connection, and API routes.

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.js";
import assetRoutes from "./routes/assets.js";
import userRoutes from "./routes/users.js";

// Load environment variables from .env file
dotenv.config();

const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
const corsOrigins = frontendURL.includes(",")
  ? frontendURL.split(",").map((url) => url.trim())
  : frontendURL;

// Initialize Express application and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Set up Socket.io for real-time communication
// Set up middleware for CORS and JSON parsing
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Store io instance for use in routes
app.set("io", io);

// Define API routes for authentication, assets, and users
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/users", userRoutes);

// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

startServer();

/**
 * Connects to the database, synchronizes models, creates a default admin user if needed,
 * and starts the HTTP server.
 */
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Sync models with database
    await sequelize.sync();
    console.log("✅ Database models synchronized.");

    // Create default admin user if it doesn't exist
    const User = (await import("./models/User.js")).default;
    const bcrypt = (await import("bcrypt")).default;
    const adminExists = await User.findOne({
      where: { email: "admin@decimetrix.com" },
    });

    if (!adminExists) {
      // Hash the password before creating the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin123!", salt);

      await User.create({
        name: "Administrator",
        email: "admin@decimetrix.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Default admin user created");
    }

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
