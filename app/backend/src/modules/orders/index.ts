import type { FastifyInstance } from "fastify";
import { InternalServerError, NotFoundError } from "../../utils/error.js";

import {
  errorMessage,
  ORDER_ARE_NOT_AVAILABLE,
} from "../../utils/error_enum.js";
import {
  CreateOrderInput,
  orderCreateDto,
  orderDeleteDto,
  OrderDeleteInput,
  orderGetAvailableDto,
  OrderGetAvailableInput,
  orderGetByIdDto,
  OrderGetByIdInput,
  OrderUpdateInput,
} from "./orders.schema.js";
import { OrderService } from "./orders.service.js";

export async function ordersRoutes(fastify: FastifyInstance) {
  const orderService = new OrderService(fastify.db);

  fastify.get("/", async () => {
    const orders = await orderService.getOrders();
    return { orders };
  });

  fastify.get(
    "/available/:purchaseOrderId",
    { schema: orderGetAvailableDto },
    async (request, reply) => {
      const orderId = request.params as OrderGetAvailableInput;
      const orders = await orderService.getOrdersAvailable(
        orderId.purchaseOrderId,
      );

      if (!orders || orders.length === 0) {
        throw new NotFoundError(errorMessage[ORDER_ARE_NOT_AVAILABLE]);
      }
      return { orders };
    },
  );

  fastify.get("/:id", { schema: orderGetByIdDto }, async (request, reply) => {
    const orderId = request.params as OrderGetByIdInput;
    const order = await orderService.getOrderById(orderId.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return { order };
  });

  fastify.post("/", { schema: orderCreateDto }, async (request, reply) => {
    const body = request.body as CreateOrderInput;
    try {
      const created = await orderService.createOrder(body);
      return reply.code(201).send(created);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("failed to create order");
    }
  });

  fastify.patch("/:id", async (request, reply) => {
    const body = request.body as OrderUpdateInput;
    try {
      const updated = await orderService.updateOrder(body.orderId, body.order);
      if (!updated) {
        throw new NotFoundError("Order not found");
      }
      return updated;
    } catch (error) {
      throw new InternalServerError("failed to update order");
    }
  });

  fastify.delete("/:id", { schema: orderDeleteDto }, async (request, reply) => {
    const id = request.params as OrderDeleteInput;
    try {
      const deleted = await orderService.deleteOrder(id.id);
      if (!deleted) {
        throw new NotFoundError("Order not found");
      }
      return { order: deleted };
    } catch (error) {
      throw new InternalServerError("failed to delete order");
    }
  });
}
