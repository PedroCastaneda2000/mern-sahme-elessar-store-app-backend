import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  material: { type: String, required: true },
  stone: { type: String, required: true },
  status: { type: String, required: true },
  imageUrl: { type: String, required: true },
  style: [{ type: String, required: true }],
  lastUpdated: { type: Date, required: true },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
