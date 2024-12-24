import mongoose, { InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema({
  // productId: { type: mongoose.Schema.Types.ObjectId },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  material: { type: String, required: true },
  stone: { type: String, required: true },
  status: { type: String, required: true },
  imageUrl: { type: String, required: true },

  lastUpdated: { type: Date, required: true },
});

const Product = mongoose.model("Product", productSchema);
export default Product;

export type ProductType = InferSchemaType<typeof productSchema>;
