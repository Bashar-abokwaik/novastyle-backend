import User from "../models/user.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/otp.js";
import crypto from "crypto";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string };
    }
  }
}
// Define interfaces for request and response types
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
// Define interfaces for request and response types
interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}
// Define interfaces for request and response types
interface SuccessResponse {
  message: string;
  user?: UserResponse;
  token?: string;
}
// Define interfaces for request and response types
interface ErrorResponse {
  message: string;
  error?: unknown;
}

// Register a new user
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<SuccessResponse | ErrorResponse>,
): Promise<void> => {
  try {
    // Extract user details from request body
    const { name, email, password } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      address: {
        country: "",
        city: "",
        street: "",
        postalCode: "",
      },
    });

    // Send OTP email
    try {
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
      <h2>Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>`,
      });
    } catch (error) {
      console.error("Error sending OTP email:", error);
    }
    // Return success response
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify user's email using OTP
export const verifyEmail = async (
  req: Request,
  res: Response<SuccessResponse | ErrorResponse>,
): Promise<void> => {
  try {
    // Extract email and OTP from request body
    const { email, otp } = req.body;
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and verify OTP
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ message: "Email already verified" });
      return;
    }
    if (user.otp !== otp || user.otpExpires! < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Return success response
    res.status(200).json({ message: "Email verified successfully", token });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Resend OTP for email verification
export const resendOTP = async (
  req: Request<{}, {}, { email: string }>,
  res: Response<SuccessResponse | ErrorResponse>,
): Promise<void> => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Send OTP email
    try {
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
    <h2>Email Verification</h2>
    <p>Your OTP for email verification is:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>`,
      });
    } catch (error) {
      console.error("Error sending OTP email:", error);
    }
    await user.save();
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Login user and return JWT token
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response<SuccessResponse | ErrorResponse>,
): Promise<void> => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Password is wrong" });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

      // Send OTP email
      try {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          html: `
      <h2>Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>`,
        });
      } catch (error) {
        console.error("Error sending OTP email:", error);
      }
      await user.save();
      res.status(400).json({ message: "Email not verified" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    // Return user info and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Logout user (no server-side action needed for JWT)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Return success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Handle password reset request by sending a reset email
export const forgetPassword = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
): Promise<void> => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set reset token and expiration on user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Send reset password email
    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">
          Reset Password
        </a>
      `,
    });

    // Return success response
    res.status(200).json({
      message: "Reset password email sent",
    });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset user's password using the reset token
export const resetPassword = async (
  req: Request<
    { token: string },
    {},
    { newPassword: string; confirmPassword: string }
  >,
  res: Response,
): Promise<void> => {
  try {
    // Extract reset token and new password from request
    const token = req.params.token as string;
    const { newPassword, confirmPassword } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation failed", error: errors.array() });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    // Check if user exists and token is valid
    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Return success response
    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Change user's password while logged in
export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract current password, new password, and confirm password from request body
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user?.userId);

    // Validate input
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Current password is wrong" });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      res.status(400).json({
        message: "New password cannot be the same as old password",
      });
      return;
    }
    // Hash new password and save user
    user.password = await bcrypt.hash(newPassword, 12);
    // Update passwordChangedAt field to current date
    user.passwordChangedAt = new Date();
    await user.save();
    // Return success response
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    // Return error response
    res.status(500).json({ message: "Server error" });
  }
};
