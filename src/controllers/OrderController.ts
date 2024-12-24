import Stripe from "stripe";
import { Request, Response } from "express";
import Product, { ProductType } from "../models/product";
import Order from "../models/order";
import { AnyAaaaRecord } from "dns";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);

const FRONTEND_URL = process.env.FRONTEND_URL as string;

const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: {
    productId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.log(error);
    res.status(400).send(`Webhook error: ${error.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      res.status(404).json({ message: "Order not found!" });
      return;
    }

    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    // Fetch products using the IDs from cartItems
    const products = await Product.find({
      _id: {
        $in: checkoutSessionRequest.cartItems.map((item) => item.productId),
      },
    });

    if (!products.length) {
      throw new Error("One or more products not found!");
    }

    const newOrder = new Order({
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const deliveryPrice = 2000;

    const lineItems = createLineItems(checkoutSessionRequest, products);

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      deliveryPrice
    );

    if (!session.url) {
      res.status(500).json({ message: "Error creating stripe session!" });
      return;
    }

    await newOrder.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  products: ProductType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const product = products.find(
      (product) => product._id.toString() === cartItem.productId.toString()
    );

    if (!product) {
      throw new Error(`Product not found: ${cartItem.productId}!`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        product_data: {
          name: product.name,
          images: [product.imageUrl],
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "usd",
          },
        },
      },
    ],

    mode: "payment",
    metadata: {
      orderId,
    },

    success_url: `${FRONTEND_URL}/order-status?success=true`,
  });

  return sessionData;
};

export default {
  createCheckoutSession,
  stripeWebhookHandler,
};
