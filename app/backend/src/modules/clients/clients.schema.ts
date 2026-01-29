import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clients } from "../../db/schema.js";
import { phoneRegex } from "../../utils/regex.js";

const clientSchema = createSelectSchema(clients);

export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof clientCreateDto.body>;
export type UpdateClientInput = z.infer<typeof clientUpdateDto.body>;

export const clientByPhoneDto = {
  params: z.object({
    phone: z.string().regex(phoneRegex, {
      message:
        "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
    }),
  }),
  response: {
    200: z.object({
      client: clientSchema,
    }),
    404: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  },
};

export const clientByPhoneIdDto = {
  params: z.object({
    phoneId: z.string().min(10, "PhoneId must be at least 10 characters long"),
  }),
  response: {
    200: z.object({
      client: clientSchema,
    }),
    404: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  },
};

export const clientCreateDto = {
  body: z.object({
    localName: z
      .string()
      .min(4, "Local name must be at least 4 characters long"),
    address: z.string(),
    phone: z.string().regex(phoneRegex, {
      message:
        "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
    }),
    phoneId: z.string().nullable(),
  }),
  response: {
    201: z.object({
      client: clientSchema,
    }),

    400: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  },
};

export const clientUpdateDto = {
  body: z.object({
    localName: z
      .string()
      .min(4, "Local name must be at least 4 characters long")
      .optional(),
    address: z.string().optional(),
    phone: z
      .string()
      .regex(phoneRegex, {
        message:
          "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
      })
      .optional(),
    phoneId: z.string().optional().nullable(),
  }),
  response: {
    200: z.object({
      client: clientSchema,
    }),
    400: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  },
};
