import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres"; // or your DB type
import { clients } from "../../db/schema.js";
import { DatabaseError } from "../../utils/error.js";
import { CLIENT_EXISTS, CLIENT_NOT_FOUND } from "../../utils/error_enum.js";
import { Optional } from "../../utils/types.js";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "./clients.schema.js";

export class ClientService {
  constructor(private readonly db: NodePgDatabase<any>) {}
  async getClientById(id: number): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return client ?? null;
  }
  async getClientByPhone(phone: string): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.phone, phone))
      .limit(1);

    return client ?? null;
  }
  async getClientByPhoneId(phoneId: string): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.phoneId, phoneId))
      .limit(1);

    return client ?? null;
  }

  async listClients(): Promise<Client[]> {
    return await this.db.select().from(clients);
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    try {
      const [created] = await this.db
        .insert(clients)
        .values({
          localName: input.localName,
          address: input.address,
          phone: input.phone,
          phoneId: input.phoneId,
        })
        .returning();

      return created;
    } catch (error: any) {
      // Postgres error code 23505 = Unique Violation
      const dbError = error as DatabaseError;
      if (dbError.cause?.code === "23505") {
        throw new Error(CLIENT_EXISTS);
      }
      throw error;
    }
  }
  async updateClient(id: number, input: UpdateClientInput): Promise<Client> {
    try {
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      );

      if (Object.keys(cleanInput).length == 0) {
        const client = await this.getClientById(id);
        if (client == null) {
          throw new Error(CLIENT_NOT_FOUND);
        }
        return client;
      }
      const [updated] = await this.db
        .update(clients)
        .set(cleanInput)
        .where(eq(clients.id, id))
        .returning();

      if (!updated) {
        throw new Error(CLIENT_NOT_FOUND);
      }
      return updated;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteClient(id: number): Promise<Client> {
    try {
      const [deleted] = await this.db
        .delete(clients)
        .where(eq(clients.id, id))
        .returning();
      if (!deleted) {
        throw new Error(CLIENT_NOT_FOUND);
      }
      return deleted;
    } catch (error: any) {
      const code = error.code || error.cause?.code;
      if (code === "23503") {
        throw new Error("Client has orders");
      }
      throw error;
    }
  }
}
