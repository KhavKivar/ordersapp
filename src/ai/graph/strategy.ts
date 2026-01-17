import { StateGraph, START, END } from "@langchain/langgraph";
import { State } from "../state/schema.js";
import { userIntent } from "../intents/classifier.js";

export const graph = new StateGraph(State)
  .addNode("user_intent", userIntent)
  .addEdge(START, "user_intent")
  .addEdge("user_intent", END)
  .compile();
