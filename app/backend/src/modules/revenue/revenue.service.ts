import { eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { orderLines, orders, products } from "../../db/schema.js";
import { RevenueByDay } from "./revenue.schema.js";

export async function getRevenueByDay(
  db: NodePgDatabase<Record<string, never>>,
): Promise<RevenueByDay[]> {
  return db
    .select({
      day: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`.as("day"),
      totalGain: sql<number>`SUM(
      (${orderLines.pricePerUnit} - ${products.buyPriceSupplier}) * ${orderLines.quantity}
    )::integer`.as("totalGain"),
    })
    .from(orders)
    .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
    .innerJoin(products, eq(orderLines.productId, products.id))
    .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`, orders.createdAt)
    .orderBy(sql`${orders.createdAt} DESC`);
}
