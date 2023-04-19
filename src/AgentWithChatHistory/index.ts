import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  VectorStoreToolkit,
  createVectorStoreAgent,
  VectorStoreInfo,
} from "langchain/agents";

export default class AgentWithChatHistory {

  model = new OpenAI({ temperature: 0 });

  textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

  messages: { by: "AGENT" | "USER", body: string }[] = []

  agent: any = null

  constructor(history: { by: "AGENT" | "USER", body: string }[] = []) {
    this.messages = history

  }
  async init() {
    const docs = await this.textSplitter.createDocuments(this.messages.map(i => i.body));

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const vectorStoreInfo: VectorStoreInfo = {
      name: "terminal_chat_history",
      description: "the history of this conversation. your messages are prefixed by AGENT, while the users messages are prefixed by USER.",
      vectorStore,
    };
    const toolkit = new VectorStoreToolkit(vectorStoreInfo, this.model);

    this.agent = createVectorStoreAgent(this.model, toolkit);
  }
  async call(input: string) {

    const result = await this.agent.call({ input });

    const output = result.output

    this.messages.push({
      by: "USER",
      body: input,
    })
    this.messages.push({
      by: "AGENT",
      body: output,
    })

    const docs = await this.textSplitter.createDocuments(this.messages.map(i => `${i.by}: ${i.body}`));

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const vectorStoreInfo: VectorStoreInfo = {
      name: "terminal_chat_history",
      description: "the history of this conversation.",
      vectorStore,
    };
    const toolkit = new VectorStoreToolkit(vectorStoreInfo, this.model);

    this.agent = createVectorStoreAgent(this.model, toolkit);

    return output
  }
}