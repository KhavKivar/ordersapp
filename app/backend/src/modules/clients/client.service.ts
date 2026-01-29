import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres"; // or your DB type
import { clients } from "../../db/schema.js";
import { DatabaseError } from "../../utils/error.js";
import { Optional } from "../../utils/types.js";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "./client.schema.js";

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
        throw new Error("CLIENT_EXISTS");
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
        if (!client) {
          throw new Error("CLIENT_NOT_FOUND");
        }
        return client;
      }
      const [updated] = await this.db
        .update(clients)
        .set(cleanInput)
        .where(eq(clients.id, id))
        .returning();

      if (!updated) {
        throw new Error("CLIENT_NOT_FOUND");
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

      return deleted;
    } catch (error: any) {
      throw error;
    }
  }
}

// import { eq } from "drizzle-orm";

// import { db } from "../db/index.js";
// import { clients } from "../db/schema.js";
// import { hasOrdersByClientId } from "./orders.js";

// type Client = typeof clients.$inferSelect;

// export type OptionalClient = Client | null;

// interface CreateClientInput {
//   localName?: string;
//   address?: string;
//   phone: string;
//   phoneId: string;
// }

// interface UpdateClientInput {
//   localName?: string;
//   address?: string;
//   phone?: string;
//   phoneId?: string;
// }

// export async function listClients() {
//   return db.select().from(clients);
// }

// export async function getClientByPhone(phone: string): Promise<OptionalClient> {
//   const client = await db
//     .select()
//     .from(clients)
//     .where(eq(clients.phone, phone))
//     .limit(1);
//   return client[0] || null;
// }

// export async function getClientByPhoneId(
//   phoneId: string,
// ): Promise<OptionalClient> {
//   console.log("Searching client by phoneId:", phoneId);
//   const client = await db
//     .select()
//     .from(clients)
//     .where(eq(clients.phoneId, phoneId))
//     .limit(1);
//   return client[0] || null;
// }

// export async function findOrCreateClient(
//   input: CreateClientInput,
// ): Promise<{ client: Client; isNew: boolean }> {
//   const clientAlreadyExist = await db
//     .select()
//     .from(clients)
//     .where(eq(clients.phoneId, input.phoneId))
//     .limit(1);
//   if (clientAlreadyExist.length > 0) {
//     return { client: clientAlreadyExist[0], isNew: false };
//   }

//   const [created] = await db
//     .insert(clients)
//     .values({
//       localName: input.localName,
//       address: input.address,
//       phone: input.phone,
//       phoneId: input.phoneId,
//     })
//     .returning();

//   return { client: created, isNew: true };
// }

// export async function deleteClient(id: number) {
//   //check if have orders associted
//   const hasOrders = await hasOrdersByClientId(id);
//   if (hasOrders) {
//     throw new Error("Client has orders");
//   }

//   const [deleted] = await db
//     .delete(clients)
//     .where(eq(clients.id, id))
//     .returning();

//   return deleted;
// }

// export async function updateClient(id: number, input: UpdateClientInput) {
//   const updates: Partial<typeof clients.$inferInsert> = {};

//   if (input.localName !== undefined) {
//     updates.localName = input.localName;
//   }
//   if (input.address !== undefined) {
//     updates.address = input.address;
//   }
//   if (input.phone !== undefined) {
//     updates.phone = input.phone;
//   }
//   if (input.phoneId !== undefined) {
//     updates.phoneId = input.phoneId;
//   }

//   const [updated] = await db
//     .update(clients)
//     .set(updates)
//     .where(eq(clients.id, id))
//     .returning();

//   return updated;
// }
