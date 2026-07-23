import express from "express";
import * as authController from "../controller/authController.js";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter, loginLimiter, verifyOtpLimiter, otpLimiter } from "../middleware/rateLimitMiddleware.js";

// Define the routes for authentication
const router = express.Router();

// Route for user registration
router.post(
  "/register",
  authLimiter,
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Must contain special character"),
  authController.register,
);

// Route for email verification
router.post(
  "/verify-email",
  verifyOtpLimiter,
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  authController.verifyEmail
);

// Route for resending OTP
router.post(
  "/resend-otp",
  otpLimiter,
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  authController.resendOTP
);

// Route for user login
router.post(
  "/login",
  loginLimiter,
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  authController.login
);

// Route for user logout
router.post("/logout", authController.logout);

// Route for refreshing access token
router.post(
  "/forget-password",
  authLimiter,
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  authController.forgetPassword
);

// Route for changing password
router.post(
  "/change-password",
  authLimiter,
  authMiddleware,
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Must contain special character"),
  body("confirmNewPassword").notEmpty().withMessage("Confirm new password is required"),
  authController.changePassword
);

// Route for resetting password
router.post(
  "/reset-password/:token",
  authLimiter,
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Must contain special character"),
  body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
  authController.resetPassword
);

export default router;
