import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getOTPTemplate = (title, username, otp) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
    <h1 style="color: #4f46e5; margin-top: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Chatify</h1>
    <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 24px;">${title}</h2>
    
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px; text-align: left;">
      Hello ${username ? `<strong>@${username}</strong>` : 'there'},<br><br>
      Please use the verification code below to securely access your account. This code will expire in <strong>10 minutes</strong>.
    </p>
    
    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; margin: 30px 0;">
      <div style="font-size: 38px; font-weight: 700; color: #0f172a; letter-spacing: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-left: 10px;">
        ${otp}
      </div>
    </div>
    
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 32px; text-align: left;">
      If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="color: #94a3b8; font-size: 12px;">
      &copy; ${new Date().getFullYear()} Chatify. All rights reserved.<br>
      Secure Collaboration Platform
    </p>
  </div>
</div>
`;

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

    await sendMail({ 
      to: email, 
      subject: "Welcome to Chatify - Verification Code", 
      html: getOTPTemplate("Welcome to Chatify! 🎉", username, otp)
    });
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
      
      await sendMail({ 
        to: email, 
        subject: "Chatify - Login Verification", 
        html: getOTPTemplate("Login Verification", user.username, otp) 
      });
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
