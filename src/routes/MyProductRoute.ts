import express from "express";
import multer from "multer";
import MyProductController from "../controllers/MyProductController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyProductRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyProductController.getMyProductOrders
);

router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  MyProductController.updateOrderStatus
);

router.get("/:productId", jwtCheck, jwtParse, MyProductController.getMyProduct);

router.post(
  "/",
  upload.single("imageFile"),
  validateMyProductRequest,
  jwtCheck,
  jwtParse,
  MyProductController.createMyProduct
);

router.put(
  "/:productId",
  upload.single("imageFile"),
  validateMyProductRequest,
  jwtCheck,
  jwtParse,
  MyProductController.updateMyProduct
);

router.delete(
  "/:productId",
  jwtCheck,
  jwtParse,
  MyProductController.deleteMyProduct
);

export default router;
