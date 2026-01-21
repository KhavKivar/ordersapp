import type { FastifyInstance } from "fastify";
import {
  listClients,
  findOrCreateClient,
  deleteClient,
} from "../services/clients.js";

export async function clientsRoutes(fastify: FastifyInstance) {
  fastify.get("/clients", async () => {
    const clients = await listClients();
    return { clients };
  });

  fastify.post("/clients", async (request, reply) => {
    const body = request.body as {
      name?: string;
      localName?: string;
      address?: string;
      phone?: string;
      phoneId?: string;
    };

    const name = body?.name?.trim();
    const phoneId = body?.phoneId?.trim();
    if (!name) {
      return reply.status(400).send({ error: "name is required" });
    }
    if (!phoneId) {
      return reply.status(400).send({ error: "phoneId is required" });
    }

    const created = await findOrCreateClient({
      name,
      localName: body?.localName,
      address: body?.address,
      phone: body?.phone ?? "",
      phoneId,
    });

    return { client: created };
  });

  fastify.delete("/clients/:id", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (!id) {
      return reply.status(400).send({ error: "id is required" });
    }

    const deleted = await deleteClient(id);

    if (!deleted) {
      return reply.status(404).send({ error: "client not found" });
    }

    return { client: deleted };
  });
}
