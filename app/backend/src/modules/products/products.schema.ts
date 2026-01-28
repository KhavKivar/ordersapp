import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "../../db/schema.js";

export const productSchema = createSelectSchema(products);
export type Product = z.infer<typeof productSchema>;

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
