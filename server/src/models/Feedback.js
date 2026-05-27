import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  review: { type: String },
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema);
