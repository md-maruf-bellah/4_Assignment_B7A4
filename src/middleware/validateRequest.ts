import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Validates req.body / req.query / req.params against a Zod schema.
// On failure, ZodError is passed to next() and handled by the global error handler.
export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
};
