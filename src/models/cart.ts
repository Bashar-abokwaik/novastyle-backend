import mongoose from "mongoose";

// Define the schema for the shopping cart
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model to associate the cart with a specific user
      required: true,
      unique: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the Product model to associate the item with a specific product
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
