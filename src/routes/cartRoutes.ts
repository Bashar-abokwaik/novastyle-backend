import express from "express";
import * as cartController from "../controller/cartController.js";
import { authMiddleware } from "../middleware/authMiddlewaer.js";

// Define the routes for the shopping cart
const router = express.Router();

// Route to get the user's cart, protected by authentication middleware
router.get("/", authMiddleware, cartController.getCart);

// Route to add an item to the user's cart, protected by authentication middleware
router.post("/", authMiddleware, cartController.addToCart);

// Route to remove an item from the user's cart, protected by authentication middleware
router.post("/remove", authMiddleware, cartController.removeFromCart);

// Route to increase the quantity of an item in the user's cart, protected by authentication middleware
router.post("/increase", authMiddleware, cartController.increaseQuantity);

// Route to decrease the quantity of an item in the user's cart, protected by authentication middleware
router.post("/decrease", authMiddleware, cartController.decreaseQuantity);

// Route to clear the user's cart, protected by authentication middleware
router.post("/clear", authMiddleware, cartController.clearCart);

// Route to handle the checkout process for the user's cart, protected by authentication middleware
router.post("/checkout", authMiddleware, cartController.checkoutCart);

export default router;
