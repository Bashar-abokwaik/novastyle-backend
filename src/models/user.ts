import mongoose from "mongoose";

// Define the User schema using Mongoose
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    address: {
      country: String,
      city: String,
      street: String,
      postalCode: String,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
