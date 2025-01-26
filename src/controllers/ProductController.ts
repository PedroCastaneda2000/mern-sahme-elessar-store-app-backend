import { Request, Response } from "express";
import Product from "../models/product";

const getProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchProducts = async (req: Request, res: Response) => {
  try {
    const category = req.params.category;

    const searchQuery = (req.query.searchQuery as string) || "";
    const material = (req.query.material as string) || "";
    const stone = (req.query.stone as string) || "";
    const status = (req.query.status as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query["category"] =
      category === "earrings" || category === "rings"
        ? category
        : new RegExp(category, "i");
    const categoryCheck = await Product.countDocuments(query);
    if (categoryCheck === 0) {
      res.status(404).json([
        {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pages: 1,
          },
        },
      ]);
      return;
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { name: searchRegex },
        { material: searchRegex },
        { stone: searchRegex },
        { status: searchRegex },
      ];
    }

    if (material) {
      query["material"] = new RegExp(material, "i");
    }
    if (stone) {
      query["stone"] = new RegExp(stone, "i");
    }
    if (status) {
      query["status"] = new RegExp(status, "i");
    }

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const products = await Product.find(query)
      .sort({ [sortOption]: sortOption === "lastUpdated" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments(query);

    const response = {
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getProducts = async (req: Request, res: Response) => {
  try {
    const productQuery = (req.query.productQuery as string) || "";
    const material = (req.query.material as string) || "";
    const stone = (req.query.stone as string) || "";
    const status = (req.query.status as string) || "";
    const category = (req.query.category as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    if (productQuery) {
      const productRegex = new RegExp(productQuery, "i");
      query["$or"] = [
        { name: productRegex },
        { material: productRegex },
        { stone: productRegex },
        { status: productRegex },
        { category: productRegex },
      ];
    }

    if (material) {
      query["material"] = new RegExp(material, "i");
    }

    if (stone) {
      query["stone"] = new RegExp(stone, "i");
    }

    if (status) {
      query["status"] = new RegExp(status, "i");
    }

    if (category) {
      query["category"] =
        category === "earrings" || category === "rings"
          ? category
          : new RegExp(category, "i");
    }

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const products = await Product.find(query)
      .sort({ [sortOption]: sortOption === "lastUpdated" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments(query);

    const response = {
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products!" });
  }
};

export default {
  searchProducts,
  getProducts,
  getProduct,
};
