import API_BASE_URL from "@/config/api";
import z from "zod";
import type { Client } from "./client.schema";

export const CreateClientDtoSchema = z.object({
  name: z.string().nonempty("El nombre es obligatorio"),
  localName: z.string().nonempty("El nombre del local es obligatorio"),
  address: z.string().nonempty("La direccion es obligatoria"),
  phone: z.string().min(5, "El telefono debe tener al menos 5 caracteres"),
  phoneId: z.string().optional().default(""),
});

export type CreateClientDto = z.infer<typeof CreateClientDtoSchema>;

export const createClient = async (
  createdDto: CreateClientDto,
): Promise<Client> => {
  const res = await fetch(`${API_BASE_URL}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createdDto),
  });
  if (!res.ok) throw new Error("Client not created");
  const response = await res.json();

  return response;
};
