import "server-only";
import Stripe from "stripe";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const stripeConfigured = Boolean(SECRET_KEY);

export const stripe = SECRET_KEY
  ? new Stripe(SECRET_KEY)
  : null;
