import { z } from "zod";

const propertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "STUDIO",
  "CONDO",
  "ROOM",
]);

export const getPropertiesQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    location: z.string().optional(),
    city: z.string().optional(),
    type: propertyTypeEnum.optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/, "minPrice must be a number")
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/, "maxPrice must be a number")
      .optional(),
    amenities: z.string().optional(), // comma separated
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const propertyIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid property id"),
  }),
});

export const createPropertySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    type: propertyTypeEnum,
    price: z.number().positive("Price must be greater than 0"),
    location: z.string().min(2),
    city: z.string().min(2),
    address: z.string().min(5),
    bedrooms: z.number().int().min(0).default(0),
    bathrooms: z.number().int().min(0).default(0),
    areaSqft: z.number().int().positive().optional(),
    amenities: z.array(z.string()).optional(),
    images: z
      .array(z.string().url("Each image must be a valid URL"))
      .optional(),
    categoryId: z.string().uuid("Invalid category id"),
  }),
});

export const updatePropertySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid property id"),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    type: propertyTypeEnum.optional(),
    price: z.number().positive().optional(),
    location: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    areaSqft: z.number().int().positive().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "RENTED"]).optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export const createCategorySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
  }),
});
