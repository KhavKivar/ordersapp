import type { FastifyInstance } from "fastify";

export async function sayHello(fastify: FastifyInstance) {
  fastify.get("/hello", async () => {
    return { message: "Hello, world!" };    
  });
}
