import { GraphNode } from "@langchain/langgraph";
import { State } from "../state/schema.js";
import { ai } from "../providers/gemini.js";
import { UserIntentType } from "./types.js";
import { toMessageText } from "../utils/message.js";
import { readFileSync } from "node:fs";

const systemInstruction = readFileSync(
  new URL("./prompts/user-intent.xml", import.meta.url),
  "utf8"
);

export const userIntent: GraphNode<typeof State> = async (state) => {
  const userMsg = state.messages.find((msg) => msg._getType?.() === "human");
  const userMessage = toMessageText(userMsg?.content);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction },
    contents: userMessage,
  });

  const label = (response.text ?? "not_related").trim().toLowerCase();
  const allowed = Object.values(UserIntentType);
  const intent: UserIntentType = allowed.includes(label as UserIntentType)
    ? (label as UserIntentType)
    : UserIntentType.NOT_RELATED;

  return { messages: [{ role: "ai", content: intent }] };
};
