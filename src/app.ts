import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import landlordRoutes from "./routes/landlord.routes";
import rentalRoutes from "./routes/rental.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";

import { stripeWebhook } from "./controllers/payment.controller";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Stripe webhook needs the RAW request body for signature verification,
// so it must be registered BEFORE express.json() and with express.raw().
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RentNest API is running",
    data: { docs: "/api", health: "/health" },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: "OK", data: { uptime: process.uptime() } });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", propertyRoutes); // /api/properties, /api/properties/:id, /api/categories
app.use("/api/landlord", landlordRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
