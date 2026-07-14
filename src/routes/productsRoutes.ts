import express from "express";
import * as productsController from "../controller/productsController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddlewaer.js";
import { body } from "express-validator";

// Define the product routes using Express Router
const router = express.Router();

// Admin routes for managing products, protected by authentication and admin middleware
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  productsController.getAllProductsAdmin,
);

// Create a new product, protected by authentication and admin middleware, with validation for required fields
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("categoryId").notEmpty().withMessage("Category ID is required"),
  body("stock").isNumeric().withMessage("Stock must be a number"),
  body("costPrice").isNumeric().withMessage("Cost Price must be a number"),
  productsController.createProducts,
);

// Update an existing product by ID, protected by authentication and admin middleware, with validation for optional fields
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("categoryId")
    .optional()
    .notEmpty()
    .withMessage("Category ID cannot be empty"),
  body("stock").optional().isNumeric().withMessage("Stock must be a number"),
  body("costPrice").optional().isNumeric().withMessage("Cost Price must be a number"),

  productsController.updateProduct,
);

// Delete a product by ID, protected by authentication and admin middleware
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productsController.deleteProduct,
);

// Public routes for retrieving products based on various criteria
router.get("/offers", productsController.getOfferedProducts);

// Public route to get products by category slug
router.get("/category/:slug", productsController.getProductsByCategory);

// Public route to get products by collection slug
router.get("/collection/:slug", productsController.getProductsByCollection);

// Public route to get new arrivals products
router.get("/new-arrivals", productsController.getNewArrivals);

// Public route to get featured products
router.get("/featured", productsController.getFeaturedProducts);

// Public route to get best sellers products
router.get("/best-sellers", productsController.getBestSellers);

// Public route to get all products
router.get("/", productsController.getAllProducts);

// Public route to get a product by ID
router.get("/id/:id", productsController.getProductById);

export default router;
