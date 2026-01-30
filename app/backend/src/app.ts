import cors from "@fastify/cors";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { clientsRoutes } from "./modules/clients/index.js";
import { productsRoutes } from "./modules/products/index.js";
import dbPlugin from "./plugins/db.js";

import { ordersRoutes } from "./modules/orders/index.js";
import { purchaseOrdersRoutes } from "./modules/purchase_orders/index.js";
import { revenueRoutes } from "./modules/revenue/index.js";
import { AppError } from "./utils/error.js";

export const fastify = Fastify({ logger: true });

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

await fastify.register(cors, {
  origin: [
    "https://vasvani.vercel.app",
    "https://vasvani.shop",
    "https://www.vasvani.shop",
    "https://www.vasvani.vercel.app",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

await fastify.register(dbPlugin);

await fastify.register(productsRoutes, { prefix: "/products" });
await fastify.register(clientsRoutes, { prefix: "/clients" });
await fastify.register(purchaseOrdersRoutes, { prefix: "/purchase_orders" });
await fastify.register(ordersRoutes, { prefix: "/orders" });
await fastify.register(revenueRoutes, { prefix: "/revenue" });

await fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error({ reqId: request.id, err: error });

  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      status: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  return reply.code(500).send({
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
});

export default fastify;
