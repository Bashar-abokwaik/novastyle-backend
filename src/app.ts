import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import { apilimiter } from "./middleware/rateLimitMiddleware.js";
// Import routes
import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import categoriesRoutes from "./routes/categoresRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import contactMessageRoutes from "./routes/contactMessageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for specified origins and methods
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://novastyle-store.web.app", "https://novastyle-home.web.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Use Helmet for security headers
app.use(helmet());

// Set the trust proxy setting to 1, which is useful when the app is behind a reverse proxy (like Nginx or Heroku)
app.set("trust proxy", 1);

// Use the imported routes for handling requests to specific endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", apilimiter, productsRoutes);
app.use("/api/categories", apilimiter, categoriesRoutes);
app.use("/api/collections", apilimiter, collectionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/contact", apilimiter, contactMessageRoutes);
app.use(
  "/api/newsletter",
  apilimiter,
  (await import("./routes/newsletterRoutes.js")).default,
);

// Get the MongoDB URI and server port from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Check if the MongoDB URI is defined in the environment variables
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in env");
}

// Connect to MongoDB and start the server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
