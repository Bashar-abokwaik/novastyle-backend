import Category from "../models/categories.js";
import Product from "../models/products.js";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

// Define an interface for the error response structure
interface ErrorResponse {
  message: string;
  error: unknown;
}

// Controller function to create a new category
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
    return;
  }
  try {
    // Extract the category details from the request body
    const { name, slug, imageUrl } = req.body;
    // Check if a category with the same slug already exists in the database
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      res.status(400).json({ message: "Category with this slug already exists" } as ErrorResponse);
      return;
    }
    // Create a new category instance and save it to the database
    const newCategory = new Category({ name, slug, imageUrl });
    const savedCategory = await newCategory.save();
    // Respond with a success message and the saved category data
    res.status(201).json({
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (error) {
    // Respond with a server error message if an exception occurs
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve all categories
export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories retrieved successfully", categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve a category by its ID
export const getCategoryById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the category by its ID from the request parameters
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    res
      .status(200)
      .json({ message: "Category retrieved successfully", category });
  } catch (error) {
    // Respond with a server error message if an exception occurs
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve a category by its slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the slug from the request parameters and find the category in the database
    const slug = req.params.slug as string;
    const category = await Category.findOne({ slug });
    if (!category) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    res
      .status(200)
      .json({ message: "Category retrieved successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to update a category
export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
    return;
  }
  try {
    // Extract the updated category details from the request body
    const { name, slug, imageUrl } = req.body;
    // Check if a category with the same slug already exists in the database
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory && existingCategory._id.toString() !== req.params.id) {
      res.status(400).json({ message: "Category with this slug already exists" } as ErrorResponse);
      return;
    }
    // Update the category in the database using its ID from the request parameters
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, imageUrl },
      { returnDocument: "after" }, // Return the updated document after the update operation
    );
    // If the category is not found, respond with a 404 error
    if (!updatedCategory) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    // Respond with a success message and the updated category data
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    // Respond with a server error message if an exception occurs
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to delete a category
export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Check if the category has associated products before deletion
    const categoryId = new mongoose.Types.ObjectId(req.params.id as string);
    const hasProducts = await Product.exists({
      categoryId,
    });

    // If the category has associated products, respond with a 400 error and a message indicating that the category cannot be deleted
    if (hasProducts) {
      res.status(400).json({
        message:
          "This category contains products. Please delete or move them before deleting the category.",
      });
      return;
    }

    // If the category has no associated products, proceed to delete it from the database
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      res.status(404).json({
        message: "Category not found",
      } as ErrorResponse);
      return;
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    } as ErrorResponse);
  }
};
