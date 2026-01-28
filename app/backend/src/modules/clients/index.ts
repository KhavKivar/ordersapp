import type { FastifyInstance } from "fastify";
import {
  clientByPhoneDto,
  clientByPhoneIdDto,
  clientCreateDto,
  CreateClientInput,
} from "./client.schema.js";
import { ClientService } from "./client.service.js";

export async function clientsRoutes(fastify: FastifyInstance) {
  const clientService = new ClientService(fastify.db);

  fastify.get(
    "/phone/:phone",
    { schema: clientByPhoneDto },
    async (request, reply) => {
      const { phone } = request.params as { phone: string };
      const client = await clientService.getClientByPhone(phone);
      if (!client) {
        throw reply.notFound("Client not found");
      }
      return { client };
    },
  );

  fastify.get("/", async () => {
    const clients = await clientService.listClients();
    return { clients };
  });

  fastify.get(
    "/phoneId/:phoneId",
    { schema: clientByPhoneIdDto },
    async (request, reply) => {
      const { phoneId } = request.params as { phoneId: string };
      const client = await clientService.getClientByPhoneId(phoneId);
      if (!client) {
        throw reply.notFound("Client not found");
      }
      return { client };
    },
  );
  fastify.post("/", { schema: clientCreateDto }, async (request, reply) => {
    const body = request.body as CreateClientInput;
    try {
      const created = await clientService.createClient(body);
      return { client: created };
    } catch (error: any) {
      if (error.message === "CLIENT_EXISTS") {
        throw reply.conflict(
          "A client with this phone or phoneId already exists",
        );
      }
      throw error;
    }
  });

  //   fastify.post("/clients", async (request, reply) => {
  //     const body = request.body as {
  //       localName?: string;
  //       address?: string;
  //       phone?: string;
  //       phoneId?: string;
  //     };

  //     const phoneId = body?.phoneId?.trim();
  //     if (!phoneId) {
  //       return reply.status(400).send({ error: "phoneId is required" });
  //     }

  //     const created = await findOrCreateClient({
  //       localName: body?.localName,
  //       address: body?.address,
  //       phone: body?.phone ?? "",
  //       phoneId,
  //     });

  //     return { client: created };
  //   });

  //   fastify.delete("/clients/:id", async (request, reply) => {
  //     const id = Number((request.params as { id?: string }).id);
  //     if (!id) {
  //       return reply.status(400).send({ error: "id is required" });
  //     }

  //     const deleted = await deleteClient(id);

  //     if (!deleted) {
  //       return reply.status(404).send({ error: "client not found" });
  //     }

  //     return { client: deleted };
  //   });

  //   fastify.patch("/clients/:id", async (request, reply) => {
  //     const id = Number((request.params as { id?: string }).id);
  //     if (!id) {
  //       return reply.status(400).send({ error: "id is required" });
  //     }

  //     const body = request.body as {
  //       localName?: string;
  //       address?: string;
  //       phone?: string;
  //       phoneId?: string;
  //     };

  //     const updates: {
  //       localName?: string;
  //       address?: string;
  //       phone?: string;
  //       phoneId?: string;
  //     } = {};

  //     if (typeof body?.localName === "string") {
  //       updates.localName = body.localName.trim();
  //     }

  //     if (typeof body?.address === "string") {
  //       updates.address = body.address.trim();
  //     }

  //     if (typeof body?.address === "string") {
  //       updates.address = body.address.trim();
  //     }

  //     if (typeof body?.phone === "string") {
  //       const phone = body.phone.trim();
  //       if (!phone) {
  //         return reply.status(400).send({ error: "phone is required" });
  //       }
  //       updates.phone = phone;
  //     }

  //     if (typeof body?.phoneId === "string") {
  //       const phoneId = body.phoneId.trim();
  //       if (!phoneId) {
  //         return reply.status(400).send({ error: "phoneId is required" });
  //       }
  //       updates.phoneId = phoneId;
  //     }

  //     if (Object.keys(updates).length === 0) {
  //       return reply.status(400).send({ error: "no fields to update" });
  //     }

  //     const updated = await updateClient(id, updates);

  //     if (!updated) {
  //       return reply.status(404).send({ error: "client not found" });
  //     }

  //     return { client: updated };
  //   });
}
