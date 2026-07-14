import express from "express"
import * as collectionController from "../controller/collectionController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddlewaer.js";
import { body } from "express-validator";

// Define the routes for collection management
const router = express.Router();

// Route to create a new collection, protected by authentication and admin middleware
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  body("name").notEmpty().withMessage("Name is required"),
  body("slug").notEmpty().withMessage("Slug is required"),
  body("imageUrl").notEmpty().withMessage("Image URL is required"),
  collectionController.createCollection
);

// Route to retrieve all collections
router.get("/", collectionController.getCollections);

// Route to retrieve a collection by its ID
router.get("/id/:id", collectionController.getCollectionById);

// Route to retrieve a collection by its slug
router.get("/slug/:slug", collectionController.getCollectionBySlug);

// Route to update a collection by its ID, protected by authentication and admin middleware
router.put("/:id",
  authMiddleware,
  adminMiddleware,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("slug").optional().notEmpty().withMessage("Slug cannot be empty"),
    body("imageUrl").optional().notEmpty().withMessage("Image URL cannot be empty"),
  collectionController.updateCollection
);

// Route to delete a collection by its ID, protected by authentication and admin middleware
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  collectionController.deleteCollection
);

export default router;