import Stripe from "stripe";
import { env } from ".";

export const stripe = new Stripe(env.stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});
