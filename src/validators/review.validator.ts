import { z } from "zod";

export const createReviewSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request id"),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    comment: z
      .string()
      .min(3, "Comment must be at least 3 characters")
      .max(1000),
  }),
});
