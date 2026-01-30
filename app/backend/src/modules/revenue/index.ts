import type { FastifyInstance } from "fastify";
import { getRevenueByDay } from "./revenue.service.js";

export async function revenueRoutes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    const revenue = await getRevenueByDay(fastify.db);
    return { revenue };
  });
}
