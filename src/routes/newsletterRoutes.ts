import express from "express";
import * as newsletterController from "../controller/newsletterController.js";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/authMiddlewaer.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

// Define the routes for newsletter management
const router = express.Router();

// Route to subscribe to the newsletter
router.post(
  "/subscribe",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  newsletterController.subscribeNewsletter,
);

// Route to unsubscribe from the newsletter
router.delete("/unsubscribe/:email", newsletterController.unsubscribe);

// Route to send the newsletter, protected by authentication and admin middleware
router.post(
  "/send",
  authMiddleware,
  adminMiddleware,
  body("subject").notEmpty().withMessage("Subject is required"),
  body("content").notEmpty().withMessage("Content is required"),
  newsletterController.sendNewsletter,
);

export default router;
