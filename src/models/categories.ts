import mongoose from "mongoose";

// Define the schema for the "Category" collection in the MongoDB database
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
