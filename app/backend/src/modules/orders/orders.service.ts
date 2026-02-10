import { eq, isNull, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { clients, orderLines, orders, products } from "../../db/schema.js";
import { NotFoundError } from "../../utils/error.js";
import {
  CLIENT_NOT_FOUND,
  ORDER_NOT_FOUND,
  PRODUCT_NOT_FOUND,
} from "../../utils/error_enum.js";
import { ClientService } from "../clients/clients.service.js";
import { ProductService } from "../products/products.service.js";
import {
  CreateOrderInput,
  OrderListItem,
  OrderStatusUpdateInput,
} from "./orders.schema.js";

export class OrderService {
  private readonly clientService: ClientService;
  private readonly productService: ProductService;
  constructor(private readonly db: NodePgDatabase<any>) {
    this.clientService = new ClientService(db);
    this.productService = new ProductService(db);
  }

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

  async getOrders(): Promise<OrderListItem[]> {
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
        status: orders.status,
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
          status: row.status,
        };
        ordersMap.set(row.orderId, order);
      }

      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        pricePerUnit: row.pricePerUnit,
        quantity: row.quantity,
        lineTotal: row.lineTotal ?? 0,
        productName: row.productName,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
      });
    }

    return Array.from(ordersMap.values());
  }

  async getOrdersAvailable(purchaseOrderId: number): Promise<OrderListItem[]> {
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
        status: orders.status,
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
    if (rows.length == 0) {
      return [];
    }

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
          status: row.status,
        };
        ordersMap.set(row.orderId, order);
      }

      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        pricePerUnit: row.pricePerUnit,
        quantity: row.quantity,
        lineTotal: row.lineTotal ?? 0,
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
        status: orders.status,
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
          status: row.status,
        };
        ordersMap.set(row.orderId, order);
      }

      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        pricePerUnit: row.pricePerUnit,
        quantity: row.quantity,
        lineTotal: row.lineTotal ?? 0,
        productName: row.productName,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
      });
    }

    return ordersMap.get(id) ?? null;
  }

  async createOrder(input: CreateOrderInput) {
    try {
      //First check that client actually exist
      const client = await this.clientService.getClientById(input.clientId);
      if (!client) {
        throw new NotFoundError(CLIENT_NOT_FOUND);
      }
      //Second check that products actually exist
      for (const item of input.items) {
        const product = await this.productService.getProductById(
          item.productId,
        );
        if (!product) {
          throw new NotFoundError(PRODUCT_NOT_FOUND);
        }
      }

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
    } catch (e: any) {
      throw e;
    }
  }

  async updateOrder(id: number, input: CreateOrderInput) {
    return await this.db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          clientId: input.clientId,
        })
        .where(eq(orders.id, id))
        .returning();

      if (!updatedOrder) {
        throw new NotFoundError(ORDER_NOT_FOUND);
      }

      await tx.delete(orderLines).where(eq(orderLines.orderId, id));

      const itemsToInsert = input.items.map((item) => ({
        orderId: updatedOrder.id,
        productId: item.productId,
        pricePerUnit: item.pricePerUnit,
        quantity: item.quantity,
      }));

      const updatedLines = await tx
        .insert(orderLines)
        .values(itemsToInsert)
        .returning();

      return { order: updatedOrder, lines: updatedLines };
    });
  }

  async deleteOrder(id: number) {
    return await this.db.transaction(async (tx) => {
      await tx.delete(orderLines).where(eq(orderLines.orderId, id));
      const [deleted] = await tx
        .delete(orders)
        .where(eq(orders.id, id))
        .returning();

      if (!deleted) {
        throw new NotFoundError(ORDER_NOT_FOUND);
      }

      return deleted;
    });
  }

  async updateStatus(id: number, status: OrderStatusUpdateInput["status"]) {
    const [updatedOrder] = await this.db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) {
      throw new NotFoundError(ORDER_NOT_FOUND);
    }
    return updatedOrder;
  }
}
