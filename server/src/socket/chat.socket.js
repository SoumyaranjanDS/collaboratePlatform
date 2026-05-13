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
      const { senderName, recipientName, text, isPhantom, fileUrl, fileType, fileName, replyTo } = data;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const tempId = Date.now().toString();
      const messageData = { _id: tempId, senderName, recipientName, text, time, isPhantom, fileUrl, fileType, fileName, replyTo, reactions: [] };

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

      // 2. Save to Database asynchronously
      Message.create({ senderName, recipientName, text: text || '', time, isPhantom, fileUrl, fileType, fileName, replyTo: replyTo || {} })
        .then(savedMsg => {
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

    // === REACTIONS ===
    socket.on('react-to-message', async ({ messageId, emoji, username }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const existing = msg.reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes(username)) {
            existing.users = existing.users.filter(u => u !== username);
            if (existing.users.length === 0) {
              msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            existing.users.push(username);
          }
        } else {
          msg.reactions.push({ emoji, users: [username] });
        }

        await msg.save();
        io.emit('message-reaction-update', { messageId, reactions: msg.reactions });
      } catch (err) {
        console.error('Reaction error:', err);
      }
    });

    // === READ RECEIPTS ===
    socket.on('mark-read', async ({ reader, sender }) => {
      try {
        await Message.updateMany(
          { senderName: sender, recipientName: reader, isRead: false },
          { $set: { isRead: true } }
        );
        const senderSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === sender);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', { reader, sender });
        }
      } catch (err) {
        console.error('Read receipt error:', err);
      }
    });

    // === WHITEBOARD EVENTS ===
    socket.on('draw-line', (data) => {
      const { recipientName } = data;
      if (recipientName) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipientName);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('draw-line', data);
        }
      } else {
        socket.broadcast.emit('draw-line', data);
      }
    });

    socket.on('clear-board', (data) => {
      const { recipientName } = data;
      if (recipientName) {
        const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === recipientName);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('clear-board');
        }
      } else {
        socket.broadcast.emit('clear-board');
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
