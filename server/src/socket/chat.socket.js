import User from '../models/User.js';
import Message from '../models/Message.js';

let onlineUsers = {};

export const chatSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-chat', async (username) => {
      onlineUsers[socket.id] = username;
      await User.findOneAndUpdate({ username }, { isOnline: true });
      io.emit('user-status-change', { username, status: 'online' });
      io.emit('online-users-list', Object.values(onlineUsers));
    });

    // UPDATED: Added Pagination (limit and skip)
    socket.on('fetch-history', async (data) => {
      const { sender, recipient, skip = 0 } = data;
      let query = {};
      if (recipient) {
        query = {
          $or: [
            { senderName: sender, recipientName: recipient },
            { senderName: recipient, recipientName: sender }
          ]
        };
      } else {
        query = { recipientName: null };
      }

      // Fetch 20 messages at a time, sorted by newest first
      const history = await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20);

      // Send back in chronological order
      socket.emit('load-messages', { 
        messages: history.reverse(), 
        isMore: history.length === 20 
      });
    });

    socket.on('send-message', async (data) => {
      const { senderName, recipientName, text } = data;
      const newMessage = await Message.create({
        senderName,
        recipientName,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      if (recipientName) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipientName);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-received', newMessage);
        }
        socket.emit('message-received', newMessage);
      } else {
        io.emit('message-received', newMessage);
      }
    });

    // NEW: Typing Indicators
    socket.on('typing-start', (data) => {
      const { sender, recipient } = data;
      if (recipient) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipient);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('user-typing', { username: sender, isTyping: true });
        }
      } else {
        // Global typing could be noisy, but adding it for consistency
        socket.broadcast.emit('user-typing', { username: sender, isTyping: true, isGlobal: true });
      }
    });

    socket.on('typing-stop', (data) => {
      const { recipient } = data;
      if (recipient) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipient);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('user-typing', { isTyping: false });
        }
      } else {
        socket.broadcast.emit('user-typing', { isTyping: false });
      }
    });

    socket.on('disconnect', async () => {
      const username = onlineUsers[socket.id];
      if (username) {
        delete onlineUsers[socket.id];
        await User.findOneAndUpdate({ username }, { isOnline: false });
        io.emit('user-status-change', { username, status: 'offline' });
        io.emit('online-users-list', Object.values(onlineUsers));
      }
    });
  });
};
