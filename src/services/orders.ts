import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  clientTable,
  orderLinesTable,
  ordersTable,
  productsTable,
} from "../db/schema.js";

export interface OrderLineItem {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
}

export interface OrderListItem {
  orderId: number;
  createdAt: Date;
  clientName: string | null;
  phone: string | null;
  lines: OrderLineItem[];
}


interface itemInput { 
  productId: number;
      pricePerUnit: number;
      quantity: number;
}
export interface CreateOrderInput {
  clientId: number;
  items: itemInput[];
}

export async function listOrders(): Promise<OrderListItem[]> {
  const rows = await db
    .select({
      createdAt: ordersTable.created_at,
      orderId: ordersTable.id,
      lineId: orderLinesTable.id,
      productId: orderLinesTable.product_id,
      pricePerUnit: orderLinesTable.price_per_unit,
      quantity: orderLinesTable.quantity,
      lineTotal: orderLinesTable.line_total,
      clientName: clientTable.name,
      phone: clientTable.phone,
      productName: productsTable.name,
    })
    .from(ordersTable)
    .innerJoin(clientTable, eq(ordersTable.client_id, clientTable.id))
    .innerJoin(orderLinesTable, eq(orderLinesTable.order_id, ordersTable.id))
    .leftJoin(productsTable, eq(orderLinesTable.product_id, productsTable.id));

  const ordersMap = new Map<number, OrderListItem>();

  for (const row of rows) {
    let order = ordersMap.get(row.orderId);
    if (!order) {
      order = {
        orderId: row.orderId,
        createdAt: row.createdAt,
        clientName: row.clientName,
        phone: row.phone,
        lines: [],
      };
      ordersMap.set(row.orderId, order);
    }

    order.lines.push({
      lineId: row.lineId,
      productId: row.productId,
      pricePerUnit: row.pricePerUnit,
      quantity: row.quantity,
      lineTotal: row.lineTotal,
      productName: row.productName,
    });
  }

  return Array.from(ordersMap.values());
}



export async function createOrder(input: CreateOrderInput) {
  const [createdOrder] = await db
    .insert(ordersTable)
    .values({
      client_id: input.clientId,
    })
    .returning();

  const itemsToInsert = input.items.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.productId,
    price_per_unit: item.pricePerUnit,
    quantity: item.quantity,
  }));

  const createdLines = await db
    .insert(orderLinesTable)
    .values(itemsToInsert)
    .returning();

  return { order: createdOrder, lines: createdLines };
}

export async function deleteOrder(id: number) {
  const [deleted] = await db
    .delete(ordersTable)
    .where(eq(ordersTable.id, id))
    .returning();

  return deleted;
}
