import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.js";
import assetRoutes from "./routes/assets.js";
import userRoutes from "./routes/users.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://frontend-green-alpha-15.vercel.app/login"
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Set up middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://frontend-green-alpha-15.vercel.app/login"
        : "*",
    credentials: true,
  })
);
app.use(express.json());

// Store io instance for use in routes
app.set("io", io);

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/users", userRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

startServer();

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Sync models with database
    await sequelize.sync();
    console.log("✅ Database models synchronized.");

    // Create default admin user if it doesn't exist
    const User = (await import("./models/User.js")).default;
    const adminExists = await User.findOne({
      where: { email: "admin@decimetrix.com" },
    });

    if (!adminExists) {
      await User.create({
        name: "Administrator",
        email: "admin@decimetrix.com",
        password: "Admin123!",
        role: "admin",
      });
      console.log("Default admin user created");
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
