import { z } from "zod";

export const createRentalRequestSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    propertyId: z.string().uuid("Invalid property id"),
    moveInDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid moveInDate"),
    message: z.string().max(1000).optional(),
  }),
});

export const rentalIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid rental request id"),
  }),
});

export const updateRentalStatusSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid rental request id"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
      errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
    }),
    rejectReason: z.string().max(500).optional(),
  }),
});
