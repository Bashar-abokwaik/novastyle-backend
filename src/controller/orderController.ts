import Order from "../models/orders.js";
import Cart from "../models/cart.js";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Product from "../models/products.js";

// Controller function to create a new order
export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    // Extract the shipping address and payment method from the request body
    const { shippingAddress, paymentMethod } = req.body;
    // Find the user's cart and populate the product details for each item
    const userCart = await Cart.findOne({
      userId: req.user?.userId as any,
    }).populate("items.productId");

    // Check if the cart exists and has items
    if (!userCart || userCart.items.length === 0) {
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    // Map the cart items to the order items format
    const orderItems = userCart.items.map((item) => {
      const product = item.productId as any;

      const finalPrice =
        product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price;

      return {
        productId: product._id,
        quantity: item.quantity,
        price: finalPrice,
      };
    });
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
    // Check if the products in the cart have enough stock before creating the order
    for (const item of userCart.items) {
      const product = item.productId as any;

      if (product.stock < item.quantity) {
        res.status(400).json({
          message: `${product.title} is out of stock or doesn't have enough quantity`,
        });
        return;
      }
    }

    // Deduct the ordered quantity from the product stock
    for (const item of userCart.items) {
      const product = item.productId as any;
      product.stock -= item.quantity;
      await product.save();
    }
    // Create a new order instance and save it to the database
    const order = new Order({
      userId: req.user?.userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });
    await order.save();
    // Clear the user's cart after creating the order
    await Cart.updateOne({ _id: userCart._id }, { $set: { items: [] } });
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Controller function to get orders by order ID for a specific user
export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the order by its ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({
      _id: req.params.id as any,
      userId: req.user?.userId as any,
    }).populate("items.productId");
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to cancel an order for a specific user
export const cancelOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the order by its ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({
      _id: req.params.id as any,
      userId: req.user?.userId as any,
    });
    // Check if the order exists and is in a pending state before allowing cancellation
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    // Check if the order status is not "pending" before allowing cancellation
    if ((order as any).status !== "pending") {
      res.status(400).json({ message: "Only pending orders can be cancelled" });
      return;
    }

    // Restore the stock of the products in the order when cancelling
    for (const item of order.items as any[]) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      product.stock += item.quantity;

      await product.save();
    }
    // Update the order status to "cancelled"
    (order as any).status = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Controller function to get all orders for a all users (admin functionality)
export const adminGetAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination for retrieving all orders
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all orders, populate the product and user details, and apply pagination
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count the total number of orders in the database for pagination purposes
    const total = await Order.countDocuments();

    // Respond with the retrieved orders, total count, current page, and total pages
    res.status(200).json({
      message: "All orders retrieved successfully",
      orders,
      total,
      page,
      pages: Math.ceil(total / limit), // Calculate the total number of pages based on the total count and limit
    });
  } catch (error) {
    // Respond with a server error message if an exception occurs
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to update the status of an order (admin functionality)
export const adminUpdateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Validate the request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    // Extract the new status from the request body
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    // Update the order status and save the changes to the database
    (order as any).status = status;
    await order.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to get an order by its ID (admin functionality)
export const adminGetOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the order by its ID and populate the product and user details
    const order = await Order.findById(req.params.id)
      .populate("items.productId")
      .populate("userId", "email");
    // Check if the order exists and respond accordingly
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to delete an order by its ID (admin functionality)
export const adminDeleteOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the order by its ID and delete it from the database
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to get orders by user ID (admin functionality)
export const adminGetOrdersByUserId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find all orders for a specific user by their user ID and populate the product and user details
    const orders = await Order.find({ userId: req.params.userId as any })
      .populate("items.productId")
      .populate("userId", "email");
    // Check if any orders were found for the specified user and respond accordingly
    if (!orders || orders.length === 0) {
      res.status(404).json({ message: "No orders found for this user" });
      return;
    }
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to get orders by status (admin functionality)
export const adminGetOrdersByStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the status from the request parameters and find all orders with that status, populating the product and user details
    const status = req.params.status;
    const orders = await Order.find({ status: status as any })
      .populate("items.productId")
      .populate("userId", "email");
    // Check if any orders were found with the specified status and respond accordingly
    if (!orders || orders.length === 0) {
      res.status(404).json({ message: "No orders found with this status" });
      return;
    }
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to get orders within a specific date range (admin functionality)
export const adminGetOrdersByDateRange = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the start and end dates from the request query parameters
    const { startDate, endDate } = req.query;

    // Validate that both startDate and endDate are provided in the request query parameters
    if (!startDate || !endDate) {
      res.status(400).json({
        message: "startDate and endDate are required",
      });
      return;
    }

    // Find all orders created within the specified date range and populate the product and user details
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    })
      .populate("items.productId")
      .populate("userId", "email");

    res.status(200).json({
      message: "Orders retrieved successfully",
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
