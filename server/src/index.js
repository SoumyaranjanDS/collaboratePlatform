import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Socket
import { chatSocket } from './socket/chat.socket.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});

// Initialize Socket.io
chatSocket(io);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Production Server running on port ${PORT}`));
