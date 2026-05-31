import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "avatar1" },
    isOnline: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    warnings: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
