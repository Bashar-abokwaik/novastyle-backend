import Cart from "../models/cart.js";
import Product from "../models/products.js";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Get the cart for the authenticated user
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the cart for the authenticated user and populate the product details
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    }).populate("items.productId");

    // If the user does not have a cart, return an empty cart structure
    if (!userCart) {
      res.status(200).json({
        message: "Cart retrieved successfully",
        cart: {
          _id: "",
          userId: req.user?.userId,
          items: [],
        },
      });
      return;
    }

    // If the user has a cart, return the cart details
    res.status(200).json({
      message: "Cart retrieved successfully",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while retrieving the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a product to the authenticated user's cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the productId and quantity from the request body
    const { productId, quantity } = req.body;

    // Find the cart for the authenticated user
    let userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // If the user does not have a cart, create a new cart for the user
    if (!userCart) {
      userCart = new Cart({
        userId: new mongoose.Types.ObjectId(req.user?.userId),
        items: [],
      });
    }

    // Find the product by its ID to check if it exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // Check if the product is out of stock
    if (product.stock === 0) {
      res.status(400).json({
        message: "Product is out of stock",
      });
      return;
    }

    // Check if the product already exists in the cart
    const existingItemIndex = userCart.items.findIndex(
      (item) => item.productId?.toString() === productId,
    );

    // If the product exists, increase the quantity; otherwise, add the product to the cart
    if (existingItemIndex >= 0) {
      userCart.items[existingItemIndex]!.quantity += quantity;
    } else {
      userCart.items.push({
        productId,
        quantity,
      });
    }

    // Save the updated cart to the database and populate the product details for the items in the cart
    await userCart.save();
    await userCart.populate("items.productId");

    // Return a success response with the updated cart details
    res.status(200).json({
      message: "Product added to cart",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while adding the product to the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Remove a product from the authenticated user's cart
export const removeFromCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the productId from the request body
    const { productId } = req.body;

    // Find the cart for the authenticated user
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // If the user does not have a cart, return a 404 response indicating that the cart was not found
    if (!userCart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Filter out the item with the specified productId from the cart items
    userCart.items = userCart.items.filter(
      (item) => item.productId?.toString() !== productId,
    ) as any;

    // Save the updated cart to the database and populate the product details for the items in the cart
    await userCart.save();
    await userCart.populate("items.productId");

    // Return a success response with the updated cart details
    res.status(200).json({
      message: "Product removed from cart",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while removing the product from the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Increase the quantity of a product in the authenticated user's cart
export const increaseQuantity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the productId from the request body
    const { productId } = req.body;

    // Find the cart for the authenticated user
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // If the user does not have a cart, return a 404 response indicating that the cart was not found
    if (!userCart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Find the item in the cart with the specified productId
    const item = userCart.items.find(
      (item) => item.productId?.toString() === productId,
    );

    // If the item is not found in the cart, return a 404 response indicating that the product was not found
    if (!item) {
      res.status(404).json({ message: "Product not found in cart" });
      return;
    }

    // Increase the quantity of the item by 1
    item.quantity += 1;

    // Save the updated cart to the database
    await userCart.save();

    // Populate the product details for the items in the cart
    await userCart.populate("items.productId");

    // Return a success response with the updated cart details
    res.status(200).json({
      message: "Product quantity increased",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while increasing the quantity of the product in the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Decrease the quantity of a product in the authenticated user's cart
export const decreaseQuantity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract the productId from the request body
    const { productId } = req.body;

    // Find the cart for the authenticated user
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // If the user does not have a cart, return a 404 response indicating that the cart was not found
    if (!userCart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Find the item in the cart with the specified productId
    const item = userCart.items.find(
      (item) => item.productId?.toString() === productId,
    );

    // If the item is not found in the cart, return a 404 response indicating that the product was not found
    if (!item) {
      res.status(404).json({ message: "Product not found in cart" });
      return;
    }

    // If the quantity of the item is less than or equal to 1, return a 400 response indicating that the quantity cannot be less than 1
    if (item.quantity <= 1) {
      res.status(400).json({
        message: "Quantity cannot be less than 1",
      });
      return;
    }

    // Decrease the quantity of the item by 1
    item.quantity -= 1;

    // Save the updated cart to the database and populate the product details for the items in the cart
    await userCart.save();
    await userCart.populate("items.productId");

    // Return a success response with the updated cart details
    res.status(200).json({
      message: "Product quantity decreased",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while decreasing the quantity of the product in the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Clear the authenticated user's cart by removing all items
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the cart for the authenticated user
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // If the user does not have a cart, return a 404 response indicating that the cart was not found
    if (!userCart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Clear all items from the user's cart and save the updated cart to the database and populate the product details for the items in the cart
    userCart.items.splice(0);
    await userCart.save();
    await userCart.populate("items.productId");

    // Return a success response with the cleared cart details
    res.status(200).json({
      message: "Cart cleared",
      cart: userCart,
    });
  } catch (error) {
    // If there is an error while clearing the cart, return a server error response
    res.status(500).json({ message: "Server error", error });
  }
};

// Checkout the authenticated user's cart and calculate the subtotal, shipping, and total amounts
export const checkoutCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find the cart for the authenticated user and populate the product details for the items in the cart
    const userCart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    }).populate("items.productId");

    // If the user does not have a cart or the cart is empty, return a 400 response indicating that the cart is empty
    if (!userCart || userCart.items.length === 0) {
      res.status(400).json({
        message: "Cart is empty",
      });
      return;
    }

    // Calculate the subtotal for the items in the cart
    let subtotal = 0;

    // Iterate through each item in the user's cart and calculate the subtotal based on the product price, discount, and quantity
    for (const item of userCart.items) {
      const product = item.productId as any;

      if (product?.price) {
        const priceAfterDiscount =
          product.price - (product.price * (product.discount || 0)) / 100;

        subtotal += priceAfterDiscount * item.quantity;
      }
    }

    // Return the checkout data including the items, subtotal, shipping, and total amounts
    res.status(200).json({
      message: "Checkout data",
      items: userCart.items,
      subtotal,
      shipping: 0,
      total: subtotal,
      paymentMethods: ["cash", "visa", "mastercard"],
    });
  } catch (error) {
    // If there is an error while checking out the cart, return a server error response
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
