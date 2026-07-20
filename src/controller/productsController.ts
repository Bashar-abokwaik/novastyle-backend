import Product from "../models/products.js";
import Category from "../models/categories.js";
import Collection from "../models/collection.js";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import Order from "../models/orders.js";
import { getSortOption } from "../utils/sort.js";

// Define a constant to specify the fields to exclude when retrieving public product data
const PUBLIC_PRODUCT_FIELDS = {
  costPrice: 0,
  sku: 0,
};

// Define an interface for the error response structure
interface ErrorResponse {
  message: string;
  error: unknown;
}

// Controller function to retrieve all products for admin users
export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch products from the database, applying pagination and sorting by creation date in descending order
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count the total number of products in the database to calculate the total number of pages
    const total = await Product.countDocuments();

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

// Controller function to retrieve a product by its ID for admin users
export const getProductByIdAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the product ID from the request parameters and attempt to find the product in the database
    const product = await Product.findById(req.params.id);

    // If the product is not found, respond with a 404 error
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Respond with a success message and the retrieved product data
    res.status(200).json({
      message: "Success",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller function to create a new product in the database (admin functionality)
export const createProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body using express-validator to ensure required fields are present and valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
    return;
  }
  try {
    // Extract product details from the request body
    const {
      title,
      description,
      price,
      imageUrl,
      categoryId,
      collectionId,
      isNewArrival,
      isFeatured,
      discount,
      stock,
      costPrice,
    } = req.body;
    // Check if the specified category exists in the database before creating the product
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    // Check if the specified collection exists in the database before creating the product
    const categorySlug = category?.slug;
    const collection = await Collection.findById(collectionId);
    const collectionSlug = collection?.slug;

    // Create a new product instance with the provided details and save it to the database
    const newProduct = new Product({
      title,
      description,
      price,
      imageUrl,
      categoryId,
      categorySlug,
      collectionId,
      collectionSlug,
      isNewArrival,
      isFeatured,
      discount,
      stock,
      costPrice,
    });
    const savedProduct = await newProduct.save();
    // Respond with a success message and the saved product data
    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to update an existing product in the database (admin functionality)
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body using express-validator to ensure required fields are present and valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
    return;
  }
  try {
    // Extract the product ID from the request parameters and product details from the request body
    const productId = req.params.id;
    const {
      title,
      description,
      price,
      imageUrl,
      categoryId,
      categorySlug,
      collectionId,
      collectionSlug,
      isNewArrival,
      isFeatured,
      discount,
      stock,
      costPrice,
    } = req.body;
    // Check if the specified category exists in the database before updating the product
    if (categoryId) {
      const category = await Category.findById(categoryId);

      // If the category does not exist, respond with a 404 error
      if (!category) {
        res.status(404).json({
          message: "Category not found",
        });
        return;
      }
    }
    // Check if the specified collection exists in the database before updating the product
    if (collectionId) {
      const collection = await Collection.findById(collectionId);
      // If the collection does not exist, respond with a 404 error
      if (!collection) {
        res.status(404).json({
          message: "Collection not found",
        });
        return;
      }
    }
    // Update the product in the database with the provided details and return the updated product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        description,
        price,
        imageUrl,
        categoryId,
        categorySlug,
        collectionId,
        collectionSlug,
        isNewArrival,
        isFeatured,
        discount,
        stock,
        costPrice,
      },
      { returnDocument: "after" }, // Return the updated document after the update operation
    );
    // If the product is not found, respond with a 404 error
    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" } as ErrorResponse);
      return;
    }
    // Respond with a success message and the updated product data
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to delete a product from the database (admin functionality)
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the product ID from the request parameters and attempt to delete the product from the database
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    // If the product is not found, respond with a 404 error
    if (!deletedProduct) {
      res.status(404).json({ message: "Product not found" } as ErrorResponse);
      return;
    }
    // Respond with a success message and the deleted product data
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve all products for public users
export const getAllProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    // Extract the sort parameter from the query string to determine the sorting order of the products
    const sort = getSortOption(req.query.sort as string);

    const skip = (page - 1) * limit;

    // Fetch products from the database that are in stock (stock > 0), applying pagination, sorting, and excluding sensitive fields
    const products = await Product.aggregate([
      // Match products that are in stock (stock > 0)
      {
        $match: {
          stock: { $gt: 0 },
        },
      },

      // Add a new field 'finalPrice' to each product document based on the discount and price
      {
        $addFields: {
          finalPrice: {
            $cond: [
              { $gt: ["$discount", 0] },

              // Calculate the final price after applying the discount
              {
                $multiply: [
                  "$price",
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ["$discount", 100],
                      },
                    ],
                  },
                ],
              },

              "$price",
            ],
          },
        },
      },

      // Sort the products based on the specified sort option (field and order)
      {
        $sort: {
          [sort.field]: sort.order,
        },
      },

      // Skip the specified number of products for pagination
      {
        $skip: skip,
      },

      // Limit the number of products returned for pagination
      {
        $limit: limit,
      },

      // Project only the public product fields to exclude sensitive information
      {
        $project: PUBLIC_PRODUCT_FIELDS,
      },
    ]);
    // Count the total number of products in the database to calculate the total number of pages
    const total = await Product.countDocuments({
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve a product by its ID for public users
export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the product ID from the request parameters and attempt to find the product in the database
    const product = await Product.findById(req.params.id);
    // If the product is not found or out of stock, respond with a 404 error
    if (!product || product.stock === 0) {
      res.status(404).json({ message: "Product not found" } as ErrorResponse);
      return;
    }
    // Respond with a success message and the retrieved product data
    res.status(200).json({
      message: "Success",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve a product by its slug for public users
export const getOfferedProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Extract the sort parameter from the query string to determine the sorting order of the products
    const sort = getSortOption(req.query.sort as string);

    // Fetch products from the database that have a discount greater than 0 and are in stock (stock > 0), applying pagination, sorting, and excluding sensitive fields
    const products = await Product.aggregate([
      // Match products that have a discount greater than 0 and are in stock (stock > 0)
      {
        $match: {
          discount: { $gt: 0 },
          stock: { $gt: 0 },
        },
      },

      // Add a new field 'finalPrice' to each product document based on the discount and price
      {
        $addFields: {
          finalPrice: {
            $cond: [
              { $gt: ["$discount", 0] },
              // Calculate the final price after applying the discount
              {
                $multiply: [
                  "$price",
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ["$discount", 100],
                      },
                    ],
                  },
                ],
              },
              "$price",
            ],
          },
        },
      },
      // Sort the products based on the specified sort option (field and order)
      {
        $sort: {
          [sort.field]: sort.order,
        },
      },
      // Skip the specified number of products for pagination
      {
        $skip: skip,
      },
      // Limit the number of products returned for pagination
      {
        $limit: limit,
      },
      // Project only the public product fields to exclude sensitive information
      {
        $project: PUBLIC_PRODUCT_FIELDS,
      },
    ]);

    // Count the total number of products with a discount in the database to calculate the total number of pages
    // Only count products that are in stock (stock > 0)
    const total = await Product.countDocuments({
      discount: { $gt: 0 },
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve new arrival products for public users
export const getNewArrivals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const products = await Product.find({
      isNewArrival: true,
      stock: { $gt: 0 },
    })
      .select(PUBLIC_PRODUCT_FIELDS)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    // Count the total number of new arrival products in the database to calculate the total number of pages
    const total = await Product.countDocuments({
      isNewArrival: true,
      stock: { $gt: 0 },
    });
    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve featured products for public users
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Fetch featured products from the database, applying pagination, sorting by creation date in descending order, and excluding sensitive fields
    const products = await Product.find({ isFeatured: true, stock: { $gt: 0 } })
      .select(PUBLIC_PRODUCT_FIELDS)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count the total number of featured products in the database to calculate the total number of pages
    const total = await Product.countDocuments({
      isFeatured: true,
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve products by category slug for public users
export const getProductsByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the category slug from the request parameters and validate its presence
    const slug = req.params.slug;
    if (!slug) {
      res
        .status(400)
        .json({ message: "Category slug is required" } as ErrorResponse);
      return;
    }
    // Find the category in the database using the provided slug
    const category = await Category.findOne({ slug });
    if (!category) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Extract the sort parameter from the query string to determine the sorting order of the products
    const sort = getSortOption(req.query.sort as string);

    // Fetch products from the database that belong to the specified category, are in stock (stock > 0), applying pagination, sorting, and excluding sensitive fields
    const products = await Product.aggregate([
      {
        $match: {
          categoryId: category._id,
          stock: { $gt: 0 },
        },
      },

      {
        $addFields: {
          finalPrice: {
            $cond: [
              { $gt: ["$discount", 0] },
              {
                $multiply: [
                  "$price",
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ["$discount", 100],
                      },
                    ],
                  },
                ],
              },
              "$price",
            ],
          },
        },
      },

      {
        $sort: {
          [sort.field]: sort.order,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      {
        $project: PUBLIC_PRODUCT_FIELDS,
      },
    ]);

    // Count the total number of products in the specified category that are in stock to calculate the total number of pages
    const total = await Product.countDocuments({
      categoryId: category._id,
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

export const getProductsByCategoryOffers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the category slug from the request parameters and validate its presence
    const slug = req.params.slug;
    if (!slug) {
      res
        .status(400)
        .json({ message: "Category slug is required" } as ErrorResponse);
      return;
    }
    // Find the category in the database using the provided slug
    const category = await Category.findOne({ slug });
    if (!category) {
      res.status(404).json({ message: "Category not found" } as ErrorResponse);
      return;
    }
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Extract the sort parameter from the query string to determine the sorting order of the products
    const sort = getSortOption(req.query.sort as string);

    // Fetch products from the database that belong to the specified category, have a discount greater than 0, are in stock (stock > 0), applying pagination, sorting, and excluding sensitive fields
    const products = await Product.aggregate([
      {
        $match: {
          categoryId: category._id,
          discount: { $gt: 0 },
          stock: { $gt: 0 },
        },
      },
      {
        $addFields: {
          finalPrice: {
            $cond: [
              { $gt: ["$discount", 0] },
              {
                $multiply: [
                  "$price",
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ["$discount", 100],
                      },
                    ],
                  },
                ],
              },
              "$price",
            ],
          },
        },
      },
      {
        $sort: {
          [sort.field]: sort.order,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: PUBLIC_PRODUCT_FIELDS,
      },
    ]);

    // Count the total number of products in the specified category that have a discount and are in stock to calculate the total number of pages
    const total = await Product.countDocuments({
      categoryId: category._id,
      discount: { $gt: 0 },
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve products by collection slug for public users
export const getProductsByCollection = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the collection slug from the request parameters and validate its presence
    const slug = req.params.slug;
    if (!slug) {
      res
        .status(400)
        .json({ message: "Collection slug is required" } as ErrorResponse);
      return;
    }
    // Find the collection in the database using the provided slug
    const collection = await Collection.findOne({ slug });
    if (!collection) {
      res
        .status(404)
        .json({ message: "Collection not found" } as ErrorResponse);
      return;
    }
    // Implement pagination logic to retrieve products in a paginated manner
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Fetch products from the database that belong to the specified collection, applying pagination, sorting by creation date in descending order, and excluding sensitive fields
    const products = await Product.find({
      collectionId: collection._id,
      stock: { $gt: 0 },
    })
      .select(PUBLIC_PRODUCT_FIELDS)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count the total number of products in the specified collection that are in stock to calculate the total number of pages
    const total = await Product.countDocuments({
      collectionId: collection._id,
      stock: { $gt: 0 },
    });

    // Respond with the retrieved products, total count, current page, and total pages
    res.status(200).json({
      message: "Success",
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error } as ErrorResponse);
  }
};

// Controller function to retrieve best-selling products based on order data for public users
export const getBestSellers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Use MongoDB aggregation to calculate the best-selling products based on order data
    const bestSellers = await Order.aggregate([
      // Unwind the items array in each order document to process individual items
      { $unwind: "$items" },

      // Group the items by productId and calculate the total quantity sold for each product
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },

      // Sort the grouped results by totalSold in descending order to get the best-selling products first
      { $sort: { totalSold: -1 } },

      // Limit the results to the top 8 best-selling products
      { $limit: 8 },

      // Perform a lookup to join the product details from the Product collection based on the productId
      {
        $lookup: {
          from: Product.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      // Unwind the product array to get individual product documents for each best-selling product
      { $unwind: "$product" },

      // Project the desired fields for the response, including product details and totalSold
      {
        $project: {
          _id: 1,
          totalSold: 1,
          product: {
            _id: "$product._id",
            title: "$product.title",
            price: "$product.price",
            imageUrl: "$product.imageUrl",
            categorySlug: "$product.categorySlug",
            discount: "$product.discount",
          },
        },
      },
    ]);

    // Respond with a success message and the retrieved best-selling products
    res.status(200).json({
      message: "Best sellers retrieved successfully",
      products: bestSellers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
