import type { FastifyInstance } from "fastify";
import { listProducts } from "./products.service.js";

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.get("/products", async () => {
    const products = await listProducts(fastify.db);
    return { products };
  });
}
