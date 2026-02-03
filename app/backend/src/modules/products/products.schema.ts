import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "../../db/schema.js";

export const productSchema = createSelectSchema(products);

export const createProductSchema = productSchema.omit({ id: true });
export type Product = z.infer<typeof productSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;

export const ResponseProductDto = {
  response: {
    200: z.object({
      products: z.array(productSchema),
    }),
    404: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  },
};
