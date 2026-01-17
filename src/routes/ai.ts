import type { FastifyInstance } from "fastify";
import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../ai/graph/index.js";

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.post("/ai", async (request, reply) => {
    const body = request.body as { message?: string };
    const message = body?.message?.trim();
    if (!message) {
      return reply.status(400).send({ error: "message is required" });
    }

    const respond = await graph.invoke({
      messages: [new HumanMessage(message)],
    });

    const last = respond.messages[respond.messages.length - 1];
    const content = last?.content ?? "";
    const text = typeof content === "string" ? content : JSON.stringify(content);

    return { message: text };
  });
}
