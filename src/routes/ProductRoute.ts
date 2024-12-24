import express from "express";
import { param } from "express-validator";
import ProductController from "../controllers/ProductController";
const router = express.Router();

router.get(
  "/details/:productId",
  param("productId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("ProductId parameter must be a valid string"),
  ProductController.getProduct
);

router.get(
  "/search/:category",
  param("category")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category parameter must be a valid string"),
  ProductController.searchProducts
);

router.get("/products", ProductController.getProducts);

export default router;
