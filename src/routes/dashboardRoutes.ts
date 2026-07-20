import express from "express";
import * as dashboardController from "../controller/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";


const router = express.Router();

// Route to get dashboard statistics, protected by authentication middleware
router.get("/", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);

export default router;