import User from "../models/user.js";
import Cart from "../models/cart.js";
import Order from "../models/orders.js";
import { Request, Response } from "express";
import { generateOTP } from "../utils/otp.js";
import { validationResult } from "express-validator";
import brevo from "../utils/brevo.js";

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve all users from the database, excluding their passwords for security reasons
    const users = await User.find().select("-password");
    // Respond with a success message and the retrieved users
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve a user by their ID, excluding the password for security reasons
    const user = await User.findById(req.params.id).select("-password");
    // If the user is not found, respond with a 404 status and an error message
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Respond with a success message and the retrieved user
    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a user profile based on the authenticated user's ID
export const getUserProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the user profile based on the authenticated user's ID, excluding the password for security reasons
    const user = await User.findById(req.user?.userId).select("-password");
    // If the user is not found, respond with a 404 status and an error message
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User profile retrieved", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a user's profile based on the authenticated user's ID
export const updateUserProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body for any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({ message: "Validation failed", error: errors.array() });
    return;
  }
  try {
    // Extract the name, email, and address from the request body
    const { name, email, address } = req.body;
    const user = await User.findById(req.user?.userId);
    // If the user is not found, respond with a 404 status and an error message
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Check if the email has changed and update the user's profile accordingly
    const emailChanged = email && email !== user.email;
    user.name = name || user.name;
    user.address = address || user.address;

    // If the email has changed, update the email, set isVerified to false, generate a new OTP, and send an OTP email for verification
    if (emailChanged) {
      user.email = email;
      user.isVerified = false;
      user.otp = generateOTP();
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
      await user.save();

      // Send OTP email for verification using Brevo
      await brevo.transactionalEmails.sendTransacEmail({
        to: [
          {
            email: email,
          },
        ],
        sender: {
          email: process.env.ADMIN_EMAIL!,
          name: "NovaStyle",
        },
        subject: "Verify your new email",
        htmlContent: `
          <h2>Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <h1>${user.otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>`,
      });
      res.status(200).json({
        message: emailChanged
          ? "Email changed. Verification required."
          : "Profile updated successfully",
        requireLogout: emailChanged,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
        },
      });
      return;
    }
    // If the email has not changed, save the updated user profile and respond with a success message
    const updatedUser = await user.save();
    // Respond with a success message and the updated user profile
    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a user's orders based on the authenticated user's ID
export const getUserOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the authenticated user's ID from the request object
    const userId = req.user?.userId;
    // If the user ID is not found, respond with a 401 status and an error message
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Retrieve the user's orders from the database, populating the product details and user email, and sorting them by creation date in descending order
    const orders = await Order.find({ userId })
      .populate("items.productId")
      .populate("userId", "email")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "User orders retrieved", orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a user's cart based on the authenticated user's ID
export const getUserCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the authenticated user's ID from the request object
    const userId = req.user?.userId;
    // If the user ID is not found, respond with a 401 status and an error message
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Retrieve the user's cart from the database, populating the product details and sorting it by creation date in descending order
    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });
      // If the cart is not found, respond with a 404 status and an error message
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    // Respond with a success message and the retrieved cart
    res.status(200).json({ message: "User cart retrieved", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a user's address based on the authenticated user's ID
export const getUserAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // find the user by their ID and select only the address field
    const user = await User.findById(req.user?.userId).select("address");
    // If the user is not found, respond with a 404 status and an error message
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Respond with a success message and the retrieved address
    res
      .status(200)
      .json({ message: "User address retrieved", address: user.address });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a user's address based on the authenticated user's ID
export const updateUserAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body for any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, respond with a 400 status and the validation error details
    res
      .status(400)
      .json({ message: "Validation failed", error: errors.array() });
    return;
  }
  try {
    // Extract the address fields (country, city, street, postalCode) from the request body
    const { country, city, street, postalCode } = req.body;
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Update the user's address with the provided values, or keep the existing values if not provided
    user.address = {
      country: country || user.address?.country,
      city: city || user.address?.city,
      street: street || user.address?.street,
      postalCode: postalCode || user.address?.postalCode,
    };
    // Save the updated user document to the database
    const updatedUser = await user.save();
    // Respond with a success message and the updated address
    res.status(200).json({
      message: "User address updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
      },
      address: updatedUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
