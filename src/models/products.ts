import mongoose from "mongoose";

// Define the Product schema using Mongoose

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categorySlug: { type: String, required: true },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: false,
    },
    collectionSlug: { type: String, required: false },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },

    stock: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
