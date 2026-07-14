import express from "express";
import * as userController from "../controller/userControllers.js";
import { authMiddleware } from "../middleware/authMiddlewaer.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { body } from "express-validator";

// Define the user routes using Express Router
const router = express.Router();

// Admin routes for managing users, protected by authentication and admin middleware
router.get("/admin", authMiddleware, adminMiddleware, userController.getUsers);

// Admin route to get a specific user by ID, protected by authentication and admin middleware
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  userController.getUserById,
);

// User routes for managing user profiles, protected by authentication middleware
router.get("/me", authMiddleware, userController.getUserProfile);

// Update a user's profile based on the authenticated user's ID, with validation for name and email fields
router.put(
  "/me",
  authMiddleware,
  body("name").notEmpty().isString().withMessage("Name must be a string"),
  body("email").notEmpty().isEmail().withMessage("Invalid email format"),
  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object"),
  userController.updateUserProfile,
);

// User routes for managing user orders, cart, and address, protected by authentication middleware
router.get("/orders", authMiddleware, userController.getUserOrders);

// User route to get the authenticated user's cart, protected by authentication middleware
router.get("/cart", authMiddleware, userController.getUserCart);

// User routes for managing user address, protected by authentication middleware
router.get("/address", authMiddleware, userController.getUserAddress);

// Update a user's address based on the authenticated user's ID, with validation for address fields
router.put(
  "/address",
  authMiddleware,
  body("country").optional().isString().withMessage("Country must be a string"),
  body("city").optional().isString().withMessage("City must be a string"),
  body("street").optional().isString().withMessage("Street must be a string"),
  body("postalCode")
    .optional()
    .isString()
    .withMessage("Postal code must be a string"),
  userController.updateUserAddress,
);

export default router;
