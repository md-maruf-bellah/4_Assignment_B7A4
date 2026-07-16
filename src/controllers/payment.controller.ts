import { Request, Response } from "express";
import Stripe from "stripe";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import * as paymentService from "../services/payment.service";
import { stripe } from "../config/stripe";
import { env } from "../config";
import { UnauthorizedError, BadRequestError } from "../utils/AppError";

export const createPayment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const result = await paymentService.createPaymentSession(
    req.user.id,
    req.body.rentalRequestId,
  );
  sendResponse(res, {
    statusCode: 201,
    message: "Payment session created successfully",
    data: result,
  });
});

export const confirmPayment = catchAsync(
  async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const payment = await paymentService.confirmPayment(sessionId);
    sendResponse(res, {
      statusCode: 200,
      message: `Payment ${payment.status === "COMPLETED" ? "confirmed" : "not completed"}`,
      data: payment,
    });
  },
);

// Stripe webhook — must use the raw body (configured in app.ts route mount)
export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    if (env.stripeWebhookSecret) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        env.stripeWebhookSecret,
      );
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    throw new BadRequestError("Webhook signature verification failed");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await paymentService.markPaymentFromWebhook(
      session.id,
      session.payment_status === "paid",
    );
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await paymentService.markPaymentFromWebhook(session.id, false);
  }

  res.status(200).json({ received: true });
});

export const getPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const payments = await paymentService.getPaymentHistory(
      req.user.id,
      req.user.role,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Payment history retrieved successfully",
      data: payments,
    });
  },
);

export const getPaymentById = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const paymentId = req.params.id;
    if (!paymentId) throw new BadRequestError("Payment id is required");
    const payment = await paymentService.getPaymentById(
      paymentId,
      req.user.id,
      req.user.role,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  },
);

// Simple landing endpoints for Stripe's success_url / cancel_url redirects
export const paymentSuccessRedirect = catchAsync(
  async (req: Request, res: Response) => {
    const sessionId = req.query.session_id as string;
    if (sessionId) {
      await paymentService.confirmPayment(sessionId);
    }
    sendResponse(res, {
      statusCode: 200,
      message: "Payment completed. You may return to the app.",
    });
  },
);

export const paymentCancelRedirect = catchAsync(
  async (req: Request, res: Response) => {
    sendResponse(res, { statusCode: 200, message: "Payment was cancelled." });
  },
);
