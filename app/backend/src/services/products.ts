import { db } from "../db/index.js";
import { productsTable } from "../db/schema.js";

export interface ProductListItem {
  id: number;
  name: string;
  type: string;
  sizeMl: number | null;
  sellPriceClient: number;
  buyPriceSupplier: number;
  description: string | null;
}

export async function listProducts(): Promise<ProductListItem[]> {
  return db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      type: productsTable.type,
      sizeMl: productsTable.size_ml,
      sellPriceClient: productsTable.sell_price_client,
      buyPriceSupplier: productsTable.buy_price_supplier,
      description: productsTable.description,
    })
    .from(productsTable);
}
