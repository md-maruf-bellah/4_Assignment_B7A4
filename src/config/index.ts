import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Don't crash import-time in scripts like seed; throw only when actually used
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,

  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  clientSuccessUrl: process.env.CLIENT_SUCCESS_URL,
  clientCancelUrl: process.env.CLIENT_CANCEL_URL,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};

export { required };
