import Fastify from "fastify";
import cors from "@fastify/cors";
import { clientsRoutes } from "./routes/clients.js";
import { ordersRoutes } from "./routes/orders.js";
import { productsRoutes } from "./routes/products.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: [
    "https://vasvani.vercel.app",
    "https://vasvani.shop",
    "http://localhost:5173",
  ],
  credentials: true,
});

await fastify.register(productsRoutes);
await fastify.register(ordersRoutes);
await fastify.register(clientsRoutes);

const port = Number(process.env.PORT || 3000);
await fastify.listen({ port, host: "0.0.0.0" });
