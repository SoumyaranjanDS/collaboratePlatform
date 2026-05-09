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
      const { senderName, recipientName, text, isPhantom } = data;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const tempId = Date.now().toString(); // Temporary ID for immediate client rendering
      const messageData = { _id: tempId, senderName, recipientName, text, time, isPhantom };

      // 1. Emit Instantly (Zero Delay)
      if (recipientName) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipientName);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-received', messageData);
        }
        socket.emit('message-received', messageData);
      } else {
        io.emit('message-received', messageData);
      }

      // 2. Save to Database asynchronously and update the real _id
      Message.create({ senderName, recipientName, text, time, isPhantom })
        .then(savedMsg => {
          // Send the real MongoDB _id back to the clients so they can delete it if it's a phantom msg
          io.emit('message-id-update', { tempId, realId: savedMsg._id });
        })
        .catch(err => console.error('Error saving message:', err));
    });

    // Handle Phantom Message Deletion
    socket.on('delete-message', async (messageId) => {
      try {
        await Message.findByIdAndDelete(messageId);
        io.emit('message-deleted', messageId);
      } catch (err) {
        console.error("Error deleting phantom message", err);
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
