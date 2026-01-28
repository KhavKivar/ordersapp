import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { products } from "../../db/schema.js";
import { Product } from "./products.schema.js";

export async function listProducts(
  db: NodePgDatabase<Record<string, never>>,
): Promise<Product[]> {
  return db
    .select({
      id: products.id,
      name: products.name,
      type: products.type,
      sizeMl: products.sizeMl,
      sellPriceClient: products.sellPriceClient,
      buyPriceSupplier: products.buyPriceSupplier,
      description: products.description,
      batchSize: products.batchSize,
    })
    .from(products);
}
