// socket/index.js
// Configures and exports the Socket.io server for real-time communication.

import { Server } from "socket.io";

/**
 * Sets up Socket.io on the provided HTTP server.
 * Handles client connection and disconnection events.
 * @param {http.Server} server - The HTTP server instance
 * @returns {Server} - The configured Socket.io server instance
 */
export const configureSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  return io;
};
