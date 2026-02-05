import { Client } from "@langchain/langgraph-sdk";
import {
  MessageChunk,
  ContentPart
}
from "@/types/types"
import {LANGGRAPH_API_URL} from "@/consts"
class ChatService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      apiUrl: LANGGRAPH_API_URL,
    });
  }

  async createThread(userId: string): Promise<string> {
    const thread = await this.client.threads.create({
      metadata: {
        userId: userId,
        createdAt: new Date().toISOString()
      }
    });
    return thread.thread_id;
  }

  async getUserThreads(userId: string): Promise<Array<{ thread_id: string; metadata: any }>> {
    try {
      const threads = await this.client.threads.search({
        metadata: { userId }
      });
      return threads;
    } catch (error) {
      console.error('Error fetching user threads:', error);
      return [];
    }
  }

  async *streamMessage(
    threadId: string,
    content: string,
    assistantId: string = "agent"
  ): AsyncGenerator<string, void, unknown> {
    const streamResponse = this.client.runs.stream(threadId, assistantId, {
      input: { messages: [{ role: "human", content }] },
      streamMode: "messages",
    });

    for await (const chunk of streamResponse) {
      if (chunk.event !== "messages/partial") continue;
      
      const messageChunks = chunk.data as MessageChunk[];
      const lastMessage = messageChunks?.at(-1);
      
      if (lastMessage?.type === "ai" && lastMessage.content) {
        const text = typeof lastMessage.content === "string"
          ? lastMessage.content
          : (lastMessage.content as ContentPart[]).map((c) => c.text || "").join("");
        
        yield text;
      }
    }
  }

  async getThreadState(threadId: string) {
    return await this.client.threads.getState(threadId);
  }

  async getThreadMessages(threadId: string): Promise<any[]> {
    try {
      const state = await this.client.threads.getState(threadId);
      const values = state.values as any;
      return values?.messages || [];
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();
