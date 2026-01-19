import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { toMessageText } from "../../utils/message.js";
import { getClientByPhone, OptionalClient } from "../../../services/clients.js";

type MakeOrderNodeOptions = {
  systemInstructionOrder: string;
};

export const makeOrderNode = ({
  systemInstructionOrder,
}: MakeOrderNodeOptions): GraphNode<typeof State> => {
  return async (state) => {
    const messages = state.messages;
    const stateMessage = messages[messages.length - 1].content;
    const sender: string =
      typeof messages[0]?.additional_kwargs?.sender === "string"
        ? messages[0].additional_kwargs.sender
        : "";

    if (sender.trim() === "") {
      return {
        messages: [
          {
            role: "ai",
            content:
              "Para hacer un pedido necesitas registrarte, escribre regristarte para saber mas",
          },
        ],
      };
    }
    const clientExist: OptionalClient = await getClientByPhone(sender);
    if (!clientExist) {
      return {
        messages: [
          {
            role: "ai",
            content:
              "No se encontró un cliente asociado a este número. Por favor, regístrate antes de realizar un pedido.",
          },
        ],
      };
    }

    await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: { systemInstruction: systemInstructionOrder },
      contents: toMessageText(stateMessage),
    });
    return {
      messages: [
        {
          role: "ai",
          content: "Funcionalidad de realizar pedido no implementada aún.",
        },
      ],
    };
  };
};
