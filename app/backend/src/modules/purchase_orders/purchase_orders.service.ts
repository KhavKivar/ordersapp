import { eq, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  clients,
  orderLines,
  orders,
  products,
  purchaseOrders,
} from "../../db/schema.js";
import {
  CreatePurchaseOrderInput,
  OrderPurchaseListItem,
  PurchaseOrderDetail,
  PurchaseOrderDetailOrder,
} from "./purchase_order.schema.js";

export class PurchaseOrderService {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async listPurchaseOrders(): Promise<OrderPurchaseListItem[]> {
    const rows = await this.db
      .select({
        createdAt: purchaseOrders.createdAt,
        purchaseOrderId: purchaseOrders.id,
        productName: products.name,
        orderId: orders.id,
        sellPriceClient: orderLines.pricePerUnit,
        buyPriceSupplier: products.buyPriceSupplier,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
      })
      .from(purchaseOrders)
      .leftJoin(orders, eq(orders.purchaseOrderId, purchaseOrders.id))
      .leftJoin(orderLines, eq(orders.id, orderLines.orderId))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .orderBy(purchaseOrders.id);
    const ordersMap = new Map<number, OrderPurchaseListItem>();

    for (const row of rows) {
      let order = ordersMap.get(row.purchaseOrderId);
      if (!order) {
        order = {
          purchaseOrderId: row.purchaseOrderId,
          createdAt: row.createdAt,
          lines: [],
        };
        ordersMap.set(row.purchaseOrderId, order);
      }
      //safeGuard
      if (
        !row.productName ||
        !row.lineTotal ||
        !row.buyPriceSupplier ||
        !row.sellPriceClient ||
        !row.quantity
      ) {
        continue;
      }

      order.lines.push({
        productName: row.productName,
        lineTotal: row.lineTotal,
        buyPriceSupplier: row.buyPriceSupplier,
        sellPriceClient: row.sellPriceClient,
        quantity: row.quantity,
      });
    }

    return Array.from(ordersMap.values());
  }

  async updatePurchaseOrder(
    purchaseOrderId: number,
    input: CreatePurchaseOrderInput,
  ) {
    return await this.db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({ purchaseOrderId: null })
        .where(eq(orders.purchaseOrderId, purchaseOrderId));

      if (input.orderListIds.length > 0) {
        await tx
          .update(orders)
          .set({ purchaseOrderId: purchaseOrderId })
          .where(inArray(orders.id, input.orderListIds));
      }

      return {
        message: "Purchase order updated successfully",
        id: purchaseOrderId,
      };
    });
  }

  async createPurchaseOrder(input: CreatePurchaseOrderInput) {
    const [createdPurchaseOrder] = await this.db
      .insert(purchaseOrders)
      .values({})
      .returning();

    await this.db
      .update(orders)
      .set({ purchaseOrderId: createdPurchaseOrder.id })
      .where(inArray(orders.id, input.orderListIds));

    return { purchaseOrder: createdPurchaseOrder };
  }

  async deletePurchaseOrder(id: number) {
    const [deleted] = await this.db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning();

    return deleted;
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrderDetail | null> {
    const rows = await this.db
      .select({
        purchaseOrderId: purchaseOrders.id,
        purchaseOrderCreatedAt: purchaseOrders.createdAt,
        purchaseOrderStatus: purchaseOrders.status,
        orderId: orders.id,
        orderCreatedAt: orders.createdAt,
        localName: clients.localName,
        phone: clients.phone,
        lineId: orderLines.id,
        productId: orderLines.productId,
        pricePerUnit: orderLines.pricePerUnit,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
        productName: products.name,
        buyPriceSupplier: products.buyPriceSupplier,
      })
      .from(purchaseOrders)
      .leftJoin(orders, eq(orders.purchaseOrderId, purchaseOrders.id))
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .where(eq(purchaseOrders.id, id));

    if (rows.length === 0) {
      return null;
    }

    const detail: PurchaseOrderDetail = {
      purchaseOrderId: rows[0].purchaseOrderId,
      createdAt: rows[0].purchaseOrderCreatedAt,
      status: rows[0].purchaseOrderStatus,
      orders: [],
    };

    const ordersMap = new Map<number, PurchaseOrderDetailOrder>();

    for (const row of rows) {
      if (!row.orderId || !row.orderCreatedAt) {
        continue;
      }

      let order = ordersMap.get(row.orderId);
      if (!order) {
        order = {
          orderId: row.orderId,
          createdAt: row.orderCreatedAt,
          localName: row.localName,
          phone: row.phone,
          lines: [],
        };
        ordersMap.set(row.orderId, order);
      }

      if (row.lineId === null || row.productId === null) {
        continue;
      }

      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        productName: row.productName,
        pricePerUnit: row.pricePerUnit ?? 0,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
        quantity: row.quantity ?? 0,
        lineTotal: row.lineTotal,
      });
    }

    detail.orders = Array.from(ordersMap.values());

    return detail;
  }
}
