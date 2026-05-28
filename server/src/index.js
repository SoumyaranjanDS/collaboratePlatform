import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Socket
import { chatSocket } from './socket/chat.socket.js';
import { verifyMailer } from './utils/mailer.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});
app.set('io', io);

// Initialize Socket.io
chatSocket(io);

const PORT = process.env.PORT || 9000;
server.listen(PORT, async () => {
  console.log(`Production Server running on port ${PORT}`);
  // Verify SMTP connection at startup — safe to fail, won't crash server
  await verifyMailer();
});
