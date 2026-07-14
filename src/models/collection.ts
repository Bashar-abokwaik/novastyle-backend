import mongoose from "mongoose";

// Define the schema for the "Collection" collection in the MongoDB database
const collectionSchema = new mongoose.Schema(
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

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
