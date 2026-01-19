import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { UserIntentType } from "../types.js";
import { toMessageText } from "../../utils/message.js";

type UserIntentNodeOptions = {
  systemInstructionUserIntent: string;
};

export const userIntentNode = ({
  systemInstructionUserIntent,
}: UserIntentNodeOptions): GraphNode<typeof State> => {
  return async (state) => {
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
};
