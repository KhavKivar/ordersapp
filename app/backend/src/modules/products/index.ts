import type { FastifyInstance } from "fastify";
import { ProductService } from "./products.service.js";

export async function productsRoutes(fastify: FastifyInstance) {
  const productService = new ProductService(fastify.db);
  fastify.get("/", async () => {
    const products = await productService.getProducts();
    return { products };
  });
}
