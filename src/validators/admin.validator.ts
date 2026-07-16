import { z } from "zod";

export const updateUserStatusSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid user id"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "BANNED"], {
      errorMap: () => ({ message: "Status must be ACTIVE or BANNED" }),
    }),
  }),
});
