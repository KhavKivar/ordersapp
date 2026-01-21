import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { clientTable } from "../db/schema.js";

export async function listClients() {
  return db.select().from(clientTable);
}

interface Client {
  id: number;
  name: string | null;
  localName: string | null;
  address: string | null;
  phone: string | null;
  phone_id: string;
}
export type OptionalClient = Client | null;


interface CreateClientInput {
  name: string;
  localName?: string;
  address?: string;
  phone: string;
  phoneId: string;
}

export async function getClientByPhone(phone: string): Promise<OptionalClient> {
  const client = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.phone, phone))
    .limit(1);
  if (client.length === 0) {
    return null;
  }
  return client[0];
}

export async function getClientByPhoneId(
  phoneId: string
): Promise<OptionalClient> {
  console.log("Searching client by phoneId:", phoneId);
  const client = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.phone_id, phoneId))
    .limit(1);
  if (client.length === 0) {
    return null;
  }
  return client[0];
}


export async function findOrCreateClient(
  input: CreateClientInput
): Promise<{ client: Client; isNew: boolean }> {
  const clientAlreadyExist = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.phone_id, input.phoneId))
    .limit(1);
  if (clientAlreadyExist.length > 0) {
    return { client: clientAlreadyExist[0], isNew: false };
  }


  const [created] = await db
    .insert(clientTable)
    .values({
      name: input.name,
      localName: input.localName,
      address: input.address,
      phone: input.phone,
      phone_id: input.phoneId,
    })
    .returning();

  return { client: created, isNew: true };
}

export async function deleteClient(id: number) {
  const [deleted] = await db
    .delete(clientTable)
    .where(eq(clientTable.id, id))
    .returning();

  return deleted;
}
