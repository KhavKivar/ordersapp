import type { FastifyInstance } from "fastify";
import { listProducts } from "../services/products.js";

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.get("/products", async () => {
    const products = await listProducts();
    return { products };
  });
}
