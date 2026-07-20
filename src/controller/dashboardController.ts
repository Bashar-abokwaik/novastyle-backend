import { Request, Response } from "express";

import Order from "../models/orders.js";
import User from "../models/user.js";
import Product from "../models/products.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch total number of users
    const totalUsers = await User.countDocuments();
    // Fetch total number of orders
    const totalOrders = await Order.countDocuments();

    // Fetch total number of products
    const totalProducts = await Product.countDocuments();

    // Calculate total revenue from all orders using aggregation
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue ?? 0;

    // Fetch the latest 5 open orders (not delivered or cancelled)
    const openOrders = await Order.find({
      status: { $nin: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      openOrders,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
