import { Request, Response } from "express";
import Product from "../models/product";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const getMyProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found!" });
      return;
    }
    res.json(product);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching product!" });
  }
};

const createMyProduct = async (req: Request, res: Response) => {
  try {
    const existingProduct = await Product.findOne({ name: req.body.name });

    if (existingProduct) {
      res.status(409).json({ message: "Product already exists!" });
      return;
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const product = new Product(req.body);
    product.imageUrl = imageUrl;
    product.user = new mongoose.Types.ObjectId(req.userId);
    product.lastUpdated = new Date();
    await product.save();

    res.status(201).send(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateMyProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found!" });
      return;
    }

    product.name = req.body.name;
    product.price = req.body.price;
    product.category = req.body.category;
    product.material = req.body.material;
    product.stone = req.body.stone;
    product.status = req.body.status;
    product.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      product.imageUrl = imageUrl;
    }

    await product.save();
    res.status(200).send(product);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const deleteMyProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found!" });
      return;
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error deleting product!" });
  }
};

const getMyProductOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate("user");

    if (!orders) {
      res.status(404).json({ message: "Orders not found" });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: "Order not found!" });
      return;
    }

    // const user = await User.findById(req.userId);
    // if (!user || user.email !== ADMIN_EMAIL) {
    //   res.status(401).json({ message: "Unauthorized! Incorrect admin email!" });
    //   return;
    // }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to update order status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;

  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getMyProductOrders,
  updateOrderStatus,
  getMyProduct,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
};
