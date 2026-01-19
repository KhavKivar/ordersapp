import type { FastifyInstance } from "fastify";
import {
  listOrders,
  createOrder,
  deleteOrder,
} from "../services/orders.js";

export async function ordersRoutes(fastify: FastifyInstance) {
  fastify.get("/orders", async () => {
    const orders = await listOrders();
    return { orders };
  });

  fastify.post("/orders", async (request, reply) => {
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

    const created = await createOrder({
      clientId,
      items: normalizedItems,
    });

    return created;
  });

  fastify.delete("/orders/:id", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (!id) {
      return reply.status(400).send({ error: "id is required" });
    }

    const deleted = await deleteOrder(id);

    if (!deleted) {
      return reply.status(404).send({ error: "order not found" });
    }

    return { order: deleted };
  });
}
