import express from "express";
import * as orderController from "../controller/orderController.js";
import { authMiddleware } from "../middleware/authMiddlewaer.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { body } from "express-validator";

// Define the routes for order management
const router = express.Router();

// Route to create a new order, protected by authentication middleware
router.post(
  "/",
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),
  body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  authMiddleware,
  orderController.createOrder,
);

// Route to retrieve all orders for the authenticated user, protected by authentication middleware
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  orderController.adminGetAllOrders,
);

// Route to update the status of an order by its ID, protected by authentication and admin middleware
router.put(
  "/admin/:id/status",
  body("status")
    .notEmpty()
    .withMessage("Status is required"),
  authMiddleware,
  adminMiddleware,
  orderController.adminUpdateOrderStatus,
);

// Route to get orders by status, protected by authentication and admin middleware
router.get(
  "/admin/status/:status",
  authMiddleware,
  adminMiddleware,
  orderController.adminGetOrdersByStatus,
);

// Route to get orders within a specific date range, protected by authentication and admin middleware
router.get(
  "/admin/date-range",
  authMiddleware,
  adminMiddleware,
  orderController.adminGetOrdersByDateRange,
);

// Route to get orders for a specific user by their user ID, protected by authentication and admin middleware
router.get(
  "/admin/user/:userId",
  authMiddleware,
  adminMiddleware,
  orderController.adminGetOrdersByUserId,
);

// Route to delete an order by its ID, protected by authentication and admin middleware
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  orderController.adminDeleteOrder,
);

// Route to get a specific order by its ID for admin users, protected by authentication and admin middleware
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  orderController.adminGetOrderById,
);

// Route to get a specific order by its ID for authenticated users
router.get("/:id", authMiddleware, orderController.getOrderById);

// Route to cancel an order by its ID for authenticated users
router.put("/:id/cancel", authMiddleware, orderController.cancelOrder);

export default router;
