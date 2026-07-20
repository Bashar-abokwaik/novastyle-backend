import Collection from "../models/collection.js";
import Product from "../models/products.js";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";

// Define an interface for the error response structure
interface ErrorResponse {
  message: string;
  error: unknown;
}

// Controller function to create a new collection
export const createCollection = async (
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
    // Extract the collection details from the request body
    const { name, slug, imageUrl } = req.body;
    // Check if a collection with the same slug already exists in the database
    const existingCollection = await Collection.findOne({ slug });
    if (existingCollection) {
      res
        .status(400)
        .json({
          message: "Collection with this slug already exists",
        } as ErrorResponse);
      return;
    }
    // Create a new collection instance and save it to the database
    const newCollection = new Collection({ name, slug, imageUrl });
    const savedCollection = await newCollection.save();
    res.status(201).json({
      message: "Collection created successfully",
      collection: savedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve all collections
export const getCollections = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all collections from the database
    const collections = await Collection.find();
    res
      .status(200)
      .json({ message: "Collections retrieved successfully", collections });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve a collection by its ID
export const getCollectionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Fetch the collection by its ID from the database
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      res
        .status(404)
        .json({ message: "Collection not found" } as ErrorResponse);
      return;
    }
    res
      .status(200)
      .json({ message: "Collection retrieved successfully", collection });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to update a collection by its ID
export const updateCollection = async (
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
    // Extract the updated collection details from the request body
    const { name, slug, imageUrl } = req.body;

    // Check if a collection with the same slug already exists in the database
    const existingCollection = await Collection.findOne({ slug });
    if (
      existingCollection &&
      existingCollection._id.toString() !== req.params.id
    ) {
      res
        .status(400)
        .json({
          message: "Collection with this slug already exists",
        } as ErrorResponse);
      return;
    }

    // Find the collection by its ID and update it with the new details
    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, slug, imageUrl },
      { returnDocument: "after" }, // Return the updated document after the update operation
    );
    if (!updatedCollection) {
      res
        .status(404)
        .json({ message: "Collection not found" } as ErrorResponse);
      return;
    }
    res.status(200).json({
      message: "Collection updated successfully",
      collection: updatedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to delete a collection by its ID
export const deleteCollection = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the collection by its ID from the request parameters
    const collectionId = req.params.id;
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      res
        .status(404)
        .json({ message: "Collection not found" } as ErrorResponse);
      return;
    }

    // Remove collection from all products
    await Product.updateMany(
      { collectionId: collection._id },
      {
        $unset: {
          collectionId: "",
          collectionSlug: "",
        },
      },
    );

    // Delete the collection from the database
    await collection.deleteOne();

    res.status(200).json({
      message: "Collection deleted successfully",
    } as ErrorResponse);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    } as ErrorResponse);
  }
};

// Controller function to retrieve a collection by its slug
export const getCollectionBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the slug from the request parameters and find the collection in the database
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;
    if (!slug) {
      res
        .status(400)
        .json({ message: "Slug parameter is required" } as ErrorResponse);
      return;
    }
    const collection = await Collection.findOne({ slug });
    // If the collection is not found, respond with a 404 error
    if (!collection) {
      res
        .status(404)
        .json({ message: "Collection not found" } as ErrorResponse);
      return;
    }
    res
      .status(200)
      .json({ message: "Collection retrieved successfully", collection });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};
