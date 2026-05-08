const express = require('express'); // Import express framework
const http = require('http'); // Import HTTP module to create a server
const { Server } = require('socket.io'); // Import Socket.io for real-time communication
const cors = require('cors'); // Import CORS to allow cross-origin requests

const app = express(); // Initialize express app
app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app); // Create an HTTP server using the express app

// Initialize Socket.io with the server and configure CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from the Vite frontend
    methods: ["GET", "POST"]
  }
});

// This variable will hold our "board" text in memory (No MongoDB used)
let boardData = "";

// Listen for new client connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user connects, send them the current state of the board
  socket.emit('load-board', boardData);

  // Listen for changes sent by any client
  socket.on('update-text', (newText) => {
    boardData = newText; // Update our local variable with the new text
    // Broadcast the new text to ALL other connected clients except the sender
    socket.broadcast.emit('text-received', newText);
  });

  // Log when a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Set the port for our server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
