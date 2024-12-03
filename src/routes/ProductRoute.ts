import express from "express";
import { param } from "express-validator";
import ProductController from "../controllers/ProductController";
const router = express.Router();

router.get(
  "/search/:category",
  param("category")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category paramenter must be a valid string"),
  ProductController.searchProducts
);

router.get("/products", ProductController.getProducts);

export default router;
