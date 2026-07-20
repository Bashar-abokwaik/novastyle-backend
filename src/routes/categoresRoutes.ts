import express from "express";
import * as categoriesController from "../controller/categoresController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { body } from "express-validator";

// Define the routes for category management
const router = express.Router();

// Route to create a new category, protected by authentication and admin middleware
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  body("name").notEmpty().withMessage("Name is required"),
  body("slug").notEmpty().withMessage("Slug is required"),
  body("imageUrl").notEmpty().withMessage("Image URL is required"),
  categoriesController.createCategory,
);

// Route to retrieve all categories
router.get("/", categoriesController.getCategories);

// Route to retrieve a category by its slug
router.get("/slug/:slug", categoriesController.getCategoryBySlug);

// Route to retrieve a category by its ID
router.get("/id/:id", categoriesController.getCategoryById);

// Route to update a category by its ID, protected by authentication and admin middleware
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("slug").optional().notEmpty().withMessage("Slug cannot be empty"),
  body("imageUrl").optional().notEmpty().withMessage("Image URL cannot be empty"),
  categoriesController.updateCategory,
);

// Route to delete a category by its ID, protected by authentication and admin middleware
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoriesController.deleteCategory,
);

export default router;
