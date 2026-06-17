import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword,
      otp,
      otpExpires
    });

    await sendMail({ to: email, subject: "Welcome to Chatify - Verification Code", html: `Your verification code is: ${otp}` });
    res.status(201).json({ status: 'OTP_REQUIRED', email: newUser.email, message: "Verification code sent to email" });
  } catch (error) {
    res.status(400).json({ error: "User already exists or server error" });
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
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      await sendMail({ to: email, subject: "Chatify - Login Verification", html: `Your verification code is: ${otp}` });
      return res.json({ status: 'OTP_REQUIRED', email: user.email, message: "Verification code sent to email" });
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
