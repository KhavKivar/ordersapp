import { eq, isNull, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { clients, orderLines, orders, products } from "../../db/schema.js";
import { CreateOrderInput, OrderListItem } from "./orders.schema.js";

export class OrderService {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async hasOrdersByClientId(clientId: number): Promise<boolean> {
    const rows = await this.db
      .select({
        id: orders.id,
      })
      .from(orders)
      .where(eq(orders.clientId, clientId))
      .limit(1);

    return rows.length > 0;
  }

  async listOrders(): Promise<OrderListItem[]> {
    const rows = await this.db
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

  async getOrdersAvailable(purchaseOrderId: number) {
    const rows = await this.db
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
      .where(
        or(
          isNull(orders.purchaseOrderId),
          eq(orders.purchaseOrderId, purchaseOrderId),
        ),
      );
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

  async getOrderById(id: number): Promise<OrderListItem | null> {
    const rows = await this.db
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

  async createOrder(input: CreateOrderInput) {
    const [createdOrder] = await this.db
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

    const createdLines = await this.db
      .insert(orderLines)
      .values(itemsToInsert)
      .returning();

    return { order: createdOrder, lines: createdLines };
  }

  async updateOrder(id: number, input: CreateOrderInput) {
    const [updatedOrder] = await this.db
      .update(orders)
      .set({
        clientId: input.clientId,
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) {
      return null;
    }

    await this.db.delete(orderLines).where(eq(orderLines.orderId, id));

    const itemsToInsert = input.items.map((item) => ({
      orderId: updatedOrder.id,
      productId: item.productId,
      pricePerUnit: item.pricePerUnit,
      quantity: item.quantity,
    }));

    const updatedLines = await this.db
      .insert(orderLines)
      .values(itemsToInsert)
      .returning();

    return { order: updatedOrder, lines: updatedLines };
  }

  async deleteOrder(id: number) {
    return await this.db.transaction(async (tx) => {
      await tx.delete(orderLines).where(eq(orderLines.orderId, id));
      const [deleted] = await tx
        .delete(orders)
        .where(eq(orders.id, id))
        .returning();

      return deleted;
    });
  }
}
