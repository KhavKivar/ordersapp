import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { clients, orderLines, orders, products } from "../db/schema.js";

export interface OrderLineItem {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  buyPriceSupplier: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
}

export interface OrderListItem {
  orderId: number;
  createdAt: string;
  clientId: number;
  localName: string | null;
  phone: string | null;
  lines: OrderLineItem[];
  purchaseOrderId: number | null;
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
      createdAt: orders.createdAt,
      orderId: orders.id,
      clientId: orders.clientId,
      localName: clients.localName,
      lineId: orderLines.id,
      productId: orderLines.productId,
      pricePerUnit: orderLines.pricePerUnit,
      quantity: orderLines.quantity,
      lineTotal: orderLines.lineTotal,
      phone: clients.phone,
      productName: products.name,
      buyPriceSupplier: products.buyPriceSupplier,
      purchaseOrderId: orders.purchaseOrderId ?? null,
    })
    .from(orders)
    .innerJoin(clients, eq(orders.clientId, clients.id))
    .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(products, eq(orderLines.productId, products.id));

  const ordersMap = new Map<number, OrderListItem>();

  for (const row of rows) {
    let order = ordersMap.get(row.orderId);
    if (!order) {
      order = {
        orderId: row.orderId,
        createdAt: row.createdAt,
        clientId: row.clientId,
        localName: row.localName,
        phone: row.phone,
        lines: [],
        purchaseOrderId: row.purchaseOrderId,
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
      buyPriceSupplier: row.buyPriceSupplier ?? 0,
    });
  }

  return Array.from(ordersMap.values());
}

export async function getOrderById(id: number): Promise<OrderListItem | null> {
  const rows = await db
    .select({
      createdAt: orders.createdAt,
      orderId: orders.id,
      clientId: orders.clientId,
      localName: clients.localName,
      lineId: orderLines.id,
      productId: orderLines.productId,
      pricePerUnit: orderLines.pricePerUnit,
      quantity: orderLines.quantity,
      lineTotal: orderLines.lineTotal,
      phone: clients.phone,
      productName: products.name,
      buyPriceSupplier: products.buyPriceSupplier,
      purchaseOrderId: orders.purchaseOrderId,
    })
    .from(orders)
    .innerJoin(clients, eq(orders.clientId, clients.id))
    .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(products, eq(orderLines.productId, products.id))
    .where(eq(orders.id, id));

  if (rows.length === 0) {
    return null;
  }

  const ordersMap = new Map<number, OrderListItem>();

  for (const row of rows) {
    let order = ordersMap.get(row.orderId);
    if (!order) {
      order = {
        orderId: row.orderId,
        purchaseOrderId: row.purchaseOrderId ?? null,
        createdAt: row.createdAt,
        clientId: row.clientId,
        localName: row.localName,
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
      buyPriceSupplier: row.buyPriceSupplier ?? 0,
    });
  }

  return ordersMap.get(id) ?? null;
}

export async function createOrder(input: CreateOrderInput) {
  const [createdOrder] = await db
    .insert(orders)
    .values({
      clientId: input.clientId,
    })
    .returning();

  const itemsToInsert = input.items.map((item) => ({
    orderId: createdOrder.id,
    productId: item.productId,
    pricePerUnit: item.pricePerUnit,
    quantity: item.quantity,
  }));

  const createdLines = await db
    .insert(orderLines)
    .values(itemsToInsert)
    .returning();

  return { order: createdOrder, lines: createdLines };
}

export async function updateOrder(id: number, input: CreateOrderInput) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      clientId: input.clientId,
    })
    .where(eq(orders.id, id))
    .returning();

  if (!updatedOrder) {
    return null;
  }

  await db.delete(orderLines).where(eq(orderLines.orderId, id));

  const itemsToInsert = input.items.map((item) => ({
    orderId: updatedOrder.id,
    productId: item.productId,
    pricePerUnit: item.pricePerUnit,
    quantity: item.quantity,
  }));

  const updatedLines = await db
    .insert(orderLines)
    .values(itemsToInsert)
    .returning();

  return { order: updatedOrder, lines: updatedLines };
}

export async function deleteOrder(id: number) {
  return await db.transaction(async (tx) => {
    await tx.delete(orderLines).where(eq(orderLines.orderId, id));
    const [deleted] = await tx
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();

    return deleted;
  });
}
