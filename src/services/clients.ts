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
}
export type OptionalClient = Client | null;


export async function getClientByPhone(phone: string): Promise<OptionalClient>  {
  const client = await db
    .select()
    .from(clientTable)
    .where(eq(clientTable.phone, phone))
    .limit(1);
  if(client.length===0){
    return null;
  }
  return client[0];
}


export async function createClient(input: {
  name: string;
  localName?: string;
  address?: string;
  phone?: string;
}) {
  const [created] = await db
    .insert(clientTable)
    .values({
      name: input.name,
      localName: input.localName,
      address: input.address,
      phone: input.phone,
    })
    .returning();

  return created;
}

export async function deleteClient(id: number) {
  const [deleted] = await db
    .delete(clientTable)
    .where(eq(clientTable.id, id))
    .returning();

  return deleted;
}
