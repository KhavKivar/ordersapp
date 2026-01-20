import type { FastifyInstance } from "fastify";
import { runAiIntent } from "../services/ai.js";

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.post("/ai", async (request, reply) => {
    const body = request.body as { message?: string };
    const message = body?.message?.trim();
    if (!message) {
      return reply.status(400).send({ error: "message is required" });
    }

    const text = await runAiIntent(message,"");

    return { message: text };
  });
}
