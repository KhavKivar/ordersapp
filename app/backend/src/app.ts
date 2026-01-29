import cors from "@fastify/cors";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { sayHello } from "./routes/hello.js";
import { ordersRoutes } from "./routes/orders.js";

import { purchaseOrdersRoutes } from "./routes/purchase_orders.js";
import { revenueRoutes } from "./routes/revenue.js";

import { clientsRoutes } from "./modules/clients/index.js";
import { productsRoutes } from "./modules/products/index.js";
import dbPlugin from "./plugins/db.js";

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

await fastify.register(productsRoutes);

await fastify.register(ordersRoutes);
await fastify.register(clientsRoutes, { prefix: "/clients" });
await fastify.register(sayHello);
await fastify.register(purchaseOrdersRoutes);
await fastify.register(revenueRoutes);

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
