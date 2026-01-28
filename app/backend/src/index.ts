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

import sensiblePlugin from "./plugins/sensible.js";

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
await fastify.register(sensiblePlugin);
await fastify.register(productsRoutes);

await fastify.register(ordersRoutes);
await fastify.register(clientsRoutes, { prefix: "/clients" });
await fastify.register(sayHello);
await fastify.register(purchaseOrdersRoutes);
await fastify.register(revenueRoutes);

const port = Number(process.env.PORT || 3000);
await fastify.listen({ port, host: "0.0.0.0" });
