import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  recipientName: { type: String, default: null }, // null means it's a Global Message
  text: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

// INDEXING: This makes searching for messages between two users extremely fast
MessageSchema.index({ senderName: 1, recipientName: 1, createdAt: -1 });
MessageSchema.index({ recipientName: 1, senderName: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
