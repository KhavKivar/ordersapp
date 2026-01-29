import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/error.js";
import {
  clientByPhoneDto,
  clientByPhoneIdDto,
  clientCreateDto,
  clientUpdateDto,
  CreateClientInput,
  UpdateClientInput,
} from "./clients.schema.js";
import { ClientService } from "./clients.service.js";

export async function clientsRoutes(fastify: FastifyInstance) {
  const clientService = new ClientService(fastify.db);

  fastify.get(
    "/phone/:phone",
    { schema: clientByPhoneDto },
    async (request, reply) => {
      const { phone } = request.params as { phone: string };
      const client = await clientService.getClientByPhone(phone);
      if (!client) {
        throw new NotFoundError("Client not found by phone");
      }

      return reply.status(200).send({ client });
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
        throw new NotFoundError("Client not found by phoneId");
      }
      return { client };
    },
  );

  fastify.post("/", { schema: clientCreateDto }, async (request, reply) => {
    const body = request.body as CreateClientInput;
    try {
      const created = await clientService.createClient(body);
      return reply.status(201).send({ client: created });
    } catch (error: any) {
      if (error.message === "CLIENT_EXISTS") {
        throw new ConflictError(
          "A client with this phone or phoneId already exists",
        );
      }
      throw error;
    }
  });

  fastify.patch("/:id", { schema: clientUpdateDto }, async (request, reply) => {
    const { id } = request.params as { id: number };
    const body = request.body as UpdateClientInput;
    try {
      const updated = await clientService.updateClient(id, body);
      return { client: updated };
    } catch (error: any) {
      if (error.message === "CLIENT_NOT_FOUND") {
        throw new NotFoundError("Client not found");
      }
      throw error;
    }
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: number };
    try {
      const deleted = await clientService.deleteClient(id);
      return { client: deleted };
    } catch (error: any) {
      if (error.message === "CLIENT_NOT_FOUND") {
        throw new NotFoundError("Client not found");
      }
      throw error;
    }
  });
}
