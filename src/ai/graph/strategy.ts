import { StateGraph, START, END } from "@langchain/langgraph";
import { State } from "../state/schema.js";
import { listPriceNode, makeOrderNode, registerClientNode, userIntentNode } from "../intents/classifier.js";
import { toMessageText } from "../utils/message.js";

const conditionalEdge = (state: { messages: Array<{ content?: unknown }> }) => {
  const stateMessages = state.messages;
  const lastMessage = stateMessages[stateMessages.length - 1];
  const intent = toMessageText(lastMessage?.content as string | undefined)
    .trim()
    .toLowerCase();

  if (intent === "list_prices") {
    return "list_prices";
  }
  if (intent === "place_order") {
    return "place_order";
  }
  if(intent === "register_client"){
    return "register_client";
  }
  return "end";
};

export const graph = new StateGraph(State)
  .addNode("user_intent", userIntentNode)
  .addNode("list_prices", listPriceNode)
  .addNode("place_order", makeOrderNode)
  .addNode("register_client", registerClientNode)
  .addEdge(START, "user_intent")
  .addConditionalEdges("user_intent", conditionalEdge, {
    list_prices: "list_prices",
    register_client: "register_client",
    place_order: "place_order",
    end: END,
  })
  .addEdge("list_prices", END)
  .addEdge("place_order", END)
  .addEdge("register_client", END)
  .compile();
