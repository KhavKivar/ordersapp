import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../ai/graph/index.js";

export async function runAiIntent(message: string, sender: string) {
  const respond = await graph.invoke({
    messages: [
      new HumanMessage({
        content: message,
        additional_kwargs: { sender },
      }),
    ],
  });

  const last = respond.messages[respond.messages.length - 1];
  const content = last?.content ?? "";

  return typeof content === "string" ? content : JSON.stringify(content);
}
