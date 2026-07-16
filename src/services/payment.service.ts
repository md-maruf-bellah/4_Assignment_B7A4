import crypto from "crypto";
import { stripe } from "../config/stripe";
import { env } from "../config";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/AppError";
import { prisma } from "../lib/prisma";

// Creates a Stripe Checkout Session for an APPROVED rental request.
export async function createPaymentSession(
  tenantId: string,
  rentalRequestId: string,
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rental) throw new NotFoundError("Rental request");
  if (rental.tenantId !== tenantId) {
    throw new ForbiddenError("This rental request does not belong to you");
  }
  if (rental.status !== "APPROVED") {
    throw new BadRequestError(
      "Payment can only be made for an approved rental request",
    );
  }
  if (rental.payment && rental.payment.status === "COMPLETED") {
    throw new BadRequestError("This rental request has already been paid for");
  }

  const amount = Number(rental.property.price);
  const transactionId = `TXN-${crypto.randomUUID()}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rent - ${rental.property.title}`,
            description: `Rental payment for property located at ${rental.property.location}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      rentalRequestId: rental.id,
      tenantId,
      transactionId,
    },
    success_url: `${env.clientSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.clientCancelUrl,
  });

  const payment = await prisma.payment.upsert({
    where: { rentalRequestId: rental.id },
    update: {
      providerSessionId: session.id,
      status: "PENDING",
      amount,
      transactionId,
    },
    create: {
      transactionId,
      amount,
      method: "card",
      provider: "STRIPE",
      status: "PENDING",
      providerSessionId: session.id,
      rentalRequestId: rental.id,
      tenantId,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id, payment };
}

// Confirms payment status by checking the Checkout Session with Stripe.
// Also usable as the logic backing a webhook handler.
export async function confirmPayment(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payment = await prisma.payment.findFirst({
    where: { providerSessionId: sessionId },
  });
  if (!payment) throw new NotFoundError("Payment");

  if (session.payment_status === "paid") {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    await prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });
    return updated;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });
}

export async function markPaymentFromWebhook(sessionId: string, paid: boolean) {
  const payment = await prisma.payment.findFirst({
    where: { providerSessionId: sessionId },
  });
  if (!payment) return null;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: paid
      ? { status: "COMPLETED", paidAt: new Date() }
      : { status: "FAILED" },
  });

  if (paid) {
    await prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });
  }
  return updated;
}

export async function getPaymentHistory(userId: string, role: string) {
  if (role === "ADMIN") {
    return prisma.payment.findMany({
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        rentalRequest: { include: { property: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  return prisma.payment.findMany({
    where: { tenantId: userId },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentById(
  paymentId: string,
  userId: string,
  role: string,
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalRequest: { include: { property: true } } },
  });
  if (!payment) throw new NotFoundError("Payment");
  if (payment.tenantId !== userId && role !== "ADMIN") {
    throw new ForbiddenError("You do not have access to this payment");
  }
  return payment;
}
