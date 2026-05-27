import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reporter: { type: String, required: true },
  reportedUser: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'warned', 'resolved'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);
