import { FastifyInstance } from "fastify";
import {
  CreatePurchaseOrderInput,
  purchaseOrderCreateDto,
  purchaseOrderDeleteDto,
  PurchaseOrderDeleteInput,
  purchaseOrderGetByIdDto,
  PurchaseOrderGetByIdInput,
} from "./purchase_order.schema.js";
import { PurchaseOrderService } from "./purchase_orders.service.js";

export async function purchaseOrdersRoutes(fastify: FastifyInstance) {
  const purchaseOrderService = new PurchaseOrderService(fastify.db);

  fastify.get("/", async () => {
    const orders = await purchaseOrderService.listPurchaseOrders();
    return { orders };
  });

  fastify.get(
    "/:id",
    { schema: purchaseOrderGetByIdDto },
    async (request, reply) => {
      const { id } = request.params as PurchaseOrderGetByIdInput;

      try {
        const purchaseOrder =
          await purchaseOrderService.getPurchaseOrderById(id);
        if (!purchaseOrder) {
          return reply.status(404).send({ error: "purchase order not found" });
        }

        return { purchaseOrder };
      } catch (error) {
        request.log.error(
          { err: error },
          "failed to fetch purchase order detail",
        );
        return reply
          .status(500)
          .send({ error: "failed to fetch purchase order" });
      }
    },
  );

  fastify.post(
    "/",
    { schema: purchaseOrderCreateDto },
    async (request, reply) => {
      const body = request.body as CreatePurchaseOrderInput;
      const created = await purchaseOrderService.createPurchaseOrder(body);
      return reply.code(201).send(created);
    },
  );

  fastify.patch(
    "/:id",
    { schema: purchaseOrderCreateDto },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as CreatePurchaseOrderInput;

      const purchaseOrderId = Number(id);

      if (isNaN(purchaseOrderId)) {
        return reply.status(400).send({ error: "Invalid ID" });
      }

      try {
        const updated = await purchaseOrderService.updatePurchaseOrder(
          purchaseOrderId,
          body,
        );
        return updated;
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    },
  );

  fastify.delete(
    "/:id",
    { schema: purchaseOrderDeleteDto },
    async (request, reply) => {
      const { id } = request.params as PurchaseOrderDeleteInput;

      const deleted = await purchaseOrderService.deletePurchaseOrder(id);
      if (!deleted) {
        return reply.status(404).send({ error: "purchase order not found" });
      }

      return { order: deleted };
    },
  );
}
