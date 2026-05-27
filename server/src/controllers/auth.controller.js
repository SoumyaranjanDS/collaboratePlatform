import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ user: { id: newUser._id, username: newUser.username } });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({ error: "All fields are required" });
    }

    // Seed admin if not exists
    const adminExists = await User.findOne({ email: 'admin@chatify.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@chatify.com',
        password: hashedPassword,
        role: 'admin'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      // Predefined Admin OTP logic
      if (user.role === 'admin') {
        user.otp = '999999';
        user.otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
        await user.save();
        return res.json({ status: 'OTP_SENT', message: 'Predefined Admin login OTP activated.' });
      }

      // Generate 6-digit OTP for regular users
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
      await user.save();

      // Log OTP to server console as a fallback
      console.log(`[OTP] Generated code for ${user.email} (${user.username}): ${otp}`);

      // Send OTP to email asynchronously (non-blocking)
      sendMail({
        to: user.email,
        subject: 'Your Chatify Access Code',
        html: `
          <div style="font-family: sans-serif; background-color: #0b0c10; color: #c5c6c7; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1f2833;">
            <h2 style="color: #66fcf1; text-transform: uppercase; letter-spacing: 2px;">Chatify</h2>
            <p>Hello <strong>@${user.username}</strong>,</p>
            <p>Please use the verification code below to complete your login session:</p>
            <div style="background-color: #1f2833; color: #66fcf1; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; margin: 25px 0; border: 1px dashed #66fcf1; letter-spacing: 4px;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #45a29e;">This code will expire in 5 minutes. Do not share this code with anyone.</p>
          </div>
        `
      }).catch(err => console.error('[Mailer] Async OTP email sending failed:', err));
 
      res.json({ status: 'OTP_SENT', message: 'Verification code sent to your email.' });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // OTP matches! Clear verification details
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: "Server error during verification" });
  }
};
