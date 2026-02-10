import { fastify } from "./app.js";

const port = Number(process.env.PORT || 3000);

try {
  await fastify.listen({ port, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
