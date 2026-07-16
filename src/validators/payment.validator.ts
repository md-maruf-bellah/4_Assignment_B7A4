import { z } from "zod";

export const createPaymentSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request id"),
  }),
});

export const confirmPaymentSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    sessionId: z.string().min(1, "sessionId is required"),
  }),
});

export const paymentIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid payment id"),
  }),
});
