import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import Report from '../models/Report.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username isOnline');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const saveFeedback = async (req, res) => {
  try {
    const { username, rating, review } = req.body;
    if (!username || !rating) {
      return res.status(400).json({ error: "Username and rating are required" });
    }
    const feedback = await Feedback.create({ username, rating, review });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
};

export const saveReport = async (req, res) => {
  try {
    const { reporter, reportedUser, reason } = req.body;
    if (!reporter || !reportedUser || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const report = await Report.create({ reporter, reportedUser, reason });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
};
