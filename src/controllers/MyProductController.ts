import { Request, Response } from "express";
import Product from "../models/product";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// import User from "../models/user";
// const ADMIN_EMAIL = "sahmeelessar@gmail.com";

const getMyProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);

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
    // const user = await User.findById(req.userId);
    // if (!user || user.email !== ADMIN_EMAIL) {
    //   return res
    //     .status(403)
    //     .json({ message: "Unauthorized! Incorrect email." });
    // }

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
    const product = await Product.findById(req.params.productId);

    if (!product) {
      res.status(404).json({ message: "Product not found!" });
      return;
    }

    product.name = req.body.name;
    product.price = req.body.price;
    product.material = req.body.material;
    product.stone = req.body.stone;
    product.status = req.body.status;
    product.style = req.body.style;
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

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;

  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getMyProduct,
  createMyProduct,
  updateMyProduct,
};
