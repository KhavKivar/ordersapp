import type { FastifyInstance } from "fastify";
import { OrderService } from "./orders.service.js";

export async function ordersRoutes(fastify: FastifyInstance) {
  const orderService = new OrderService(fastify.db);

  fastify.get("/", async () => {
    const orders = await orderService.listOrders();
    return { orders };
  });

  fastify.get("/available/:purchaseOrderId", async (request, reply) => {
    const purchaseOrderId = Number(
      (request.params as { purchaseOrderId?: string }).purchaseOrderId,
    );
    if (!purchaseOrderId) {
      return reply.status(400).send({ error: "purchaseOrderId is required" });
    }
    const orders = await orderService.getOrdersAvailable(purchaseOrderId);
    return { orders };
  });

  fastify.get("/:id", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (!id) {
      return reply.status(400).send({ error: "id is required" });
    }

    const order = await orderService.getOrderById(id);
    if (!order) {
      return reply.status(404).send({ error: "order not found" });
    }

    return { order };
  });

  fastify.post("/", async (request, reply) => {
    const body = request.body as {
      client_id?: number;
      items?: Array<{
        product_id?: number;
        price_per_unit?: number;
        quantity?: number;
      }>;
    };

    const clientId = body?.client_id;
    const items = body?.items ?? [];

    if (!clientId || items.length === 0) {
      return reply.status(400).send({
        error: "client_id and items are required",
      });
    }

    const normalizedItems: Array<{
      productId: number;
      pricePerUnit: number;
      quantity: number;
    }> = [];
    for (const item of items) {
      if (!item.product_id || !item.price_per_unit || !item.quantity) {
        return reply.status(400).send({
          error:
            "Each item needs product_id, price_per_unit, quantity with values greater than 0",
        });
      }

      normalizedItems.push({
        productId: item.product_id,
        pricePerUnit: item.price_per_unit,
        quantity: item.quantity,
      });
    }

    const created = await orderService.createOrder({
      clientId,
      items: normalizedItems,
    });

    return created;
  });

  fastify.patch("/:id", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (!id) {
      return reply.status(400).send({ error: "id is required" });
    }

    const body = request.body as {
      client_id?: number;
      items?: Array<{
        product_id?: number;
        price_per_unit?: number;
        quantity?: number;
      }>;
    };

    const clientId = body?.client_id;
    const items = body?.items ?? [];

    if (!clientId || items.length === 0) {
      return reply.status(400).send({
        error: "client_id and items are required",
      });
    }

    const normalizedItems: Array<{
      productId: number;
      pricePerUnit: number;
      quantity: number;
    }> = [];
    for (const item of items) {
      if (!item.product_id || !item.price_per_unit || !item.quantity) {
        return reply.status(400).send({
          error:
            "Each item needs product_id, price_per_unit, quantity with values greater than 0",
        });
      }

      normalizedItems.push({
        productId: item.product_id,
        pricePerUnit: item.price_per_unit,
        quantity: item.quantity,
      });
    }

    const updated = await orderService.updateOrder(id, {
      clientId,
      items: normalizedItems,
    });

    if (!updated) {
      return reply.status(404).send({ error: "order not found" });
    }

    return updated;
  });

  fastify.delete("/:id", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);

    if (!id) {
      return reply.status(400).send({ error: "id is required" });
    }

    try {
      const deleted = await orderService.deleteOrder(id);

      if (!deleted) {
        return reply.status(404).send({ error: "order not found" });
      }

      return { order: deleted };
    } catch (error) {
      request.log.error({ err: error }, "failed to delete order");
      return reply.status(500).send({ error: "failed to delete order" });
    }
  });
}
