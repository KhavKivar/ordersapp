import { GraphNode } from "@langchain/langgraph";
import { State } from "../state/schema.js";
import { ai } from "../providers/gemini.js";
import { UserIntentType } from "./types.js";
import { toMessageText } from "../utils/message.js";
import { readFileSync } from "node:fs";
import { listProducts, ProductListItem as Item } from "../../services/products.js";
import {
  getClientByPhone,
  OptionalClient,
  createClient,
} from "../../services/clients.js";

const systemInstructionUserIntent = readFileSync(
  new URL("./prompts/user-intent.xml", import.meta.url),
  "utf8"
);
const systemInstructionOrder = readFileSync(
  new URL("./prompts/user-intent.xml", import.meta.url),
  "utf8"
);

const systemInstructionCreateClient = readFileSync(
  new URL("./prompts/create-client.xml", import.meta.url),
  "utf8"
);


export const userIntentNode: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  if (messages.length === 0) {
    throw new Error("No messages found in state");
  }
  const userMessage = messages[messages.length - 1].content;
  const userMessageText = toMessageText(userMessage);
  
  const parseMessage = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionUserIntent },
    contents: userMessageText,
  });


  const intent = parseMessage.text as string;
  let intentType: UserIntentType;

  switch (intent) {
    case "list_prices":
      intentType = UserIntentType.LIST_PRICES;
      break;
    case "place_order":
      intentType = UserIntentType.PLACE_ORDER;
      break;
    case "register_client":
      intentType = UserIntentType.REGISTER_CLIENT;
      break;
    default:
      intentType = UserIntentType.NOT_RELATED;
  }

  return { messages: [{ role: "ai", content: intentType }] };
};


const toCapitalized = (value: string) =>
  value ? value[0].toUpperCase() + value.slice(1) : "";


export const listPriceNode : GraphNode<typeof State> = async (state) => {
  const getAllPrices:Item[] = await listProducts();
  let responseMessage = "Lista de productos:\n";

  const typeOfProduct = [...new Set(getAllPrices.map(item => item.type))];

  for (const type of typeOfProduct) {
    responseMessage += `\n-- ${toCapitalized(type)} --\n`;
    const productsOfType = getAllPrices.filter(item => item.type === type);
    for (const product of productsOfType) {
      responseMessage += `${product.name}, precio: $ ${product.sellPriceClient}\n`;
    }
  }
  return { messages: [{ role: "ai", content: responseMessage }] };
};  


export const makeOrderNode : GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  const stateMessage = messages[messages.length - 1].content;
  const sender:string = typeof messages[0]?.additional_kwargs?.sender === "string"
  ? messages[0].additional_kwargs.sender
  : "";
  
  
  if(sender.trim()==="") {
    return { messages: [{ role: "ai", content: "Para hacer un pedido necesitas registrarte, escribre regristarte para saber mas" }] };
  }
  const clientExist:OptionalClient = await getClientByPhone(sender);
  if(!clientExist){
    return { messages: [{ role: "ai", content: "No se encontró un cliente asociado a este número. Por favor, regístrate antes de realizar un pedido." }] };
  }


  const extractOrder = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionOrder },
    contents: toMessageText(stateMessage),
  });
  return { messages: [{ role: "ai", content: "Funcionalidad de realizar pedido no implementada aún." }] };
}


type ClientPayload = {
  name: string;
  localName: string;
  address: string;
};

type CreateClientPayload = Partial<ClientPayload>;

const safeParseClientPayload = (value: string): CreateClientPayload | null => {
  const cleaned = value
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as CreateClientPayload;
  } catch {
    return null;
  }
};

const getMissingClientFields = (payload: CreateClientPayload) => {
  const missing: string[] = [];

  if (!payload.name?.trim()) missing.push("nombre");
  if (!payload.localName?.trim()) missing.push("nombre del local");
  if (!payload.address?.trim()) missing.push("direccion");

  return missing;
};

export const registerClientNode: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  const stateMessage = messages[0].content;
  const userMessageText = toMessageText(stateMessage);
  console.log("User message for create client:", userMessageText);
  const parseMessageToCreateClient = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionCreateClient },
    contents: userMessageText,
  });
  console.log("Parsed create client message:", parseMessageToCreateClient.text);

  const payloadText = (parseMessageToCreateClient.text ?? "").trim();
  const payload = safeParseClientPayload(payloadText) ?? {};
  const missingFields = getMissingClientFields(payload);

  if (missingFields.length === 3) {
    return {
      messages: [
        {
          role: "ai",
          content:
            "Necesito los siguientes datos: nombre, nombre del local y direccion para poder registrarte.",
        },
      ],
    };
  }

  if (missingFields.length > 0) {
    return {
      messages: [
        {
          role: "ai",
          content: `Falta ${missingFields.join(", ")}. Envia: nombre, nombre del local y direccion.`,
        },
      ],
    };
  }

  const phoneNumber = messages[0]?.additional_kwargs?.sender as string | undefined;
  if (!phoneNumber) {
    return {
      messages: [
        {
          role: "ai",
          content: "No se pudo obtener el número de teléfono del remitente.",
        },
      ],
    };
  } 


  const created = await createClient({
    name: payload.name?.trim() ?? "",
    localName: payload.localName?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    phone:phoneNumber,
  });

  return {
    messages: [
      {
        role: "ai",
        content: `Cliente registrado: ${created.name ?? ""}.`,
      },
    ],
  };
};
