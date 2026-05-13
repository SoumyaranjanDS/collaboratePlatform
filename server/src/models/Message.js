import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  recipientName: { type: String, default: null }, // null means it's a Global Message
  text: { type: String, default: '' },
  time: { type: String, required: true },
  isPhantom: { type: Boolean, default: false },
  fileUrl: { type: String, default: null },
  fileType: { type: String, default: null },  // 'image', 'video', 'pdf', 'file'
  fileName: { type: String, default: null },
  reactions: [{
    emoji: String,
    users: [String],
  }],
  replyTo: {
    _id: { type: String, default: null },
    senderName: { type: String, default: null },
    text: { type: String, default: null },
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// INDEXING: This makes searching for messages between two users extremely fast
MessageSchema.index({ senderName: 1, recipientName: 1, createdAt: -1 });
MessageSchema.index({ recipientName: 1, senderName: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
