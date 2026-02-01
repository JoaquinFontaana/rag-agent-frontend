import { Client } from "@langchain/langgraph-sdk";

const LANGGRAPH_API_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || "http://localhost:8000";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface StreamChunk {
  event: string;
  data: MessageChunk[];
}

export interface MessageChunk {
  type: string;
  content: string | ContentPart[];
}

export interface ContentPart {
  text?: string;
}

class ChatService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      apiUrl: LANGGRAPH_API_URL,
    });
  }

  async createThread(): Promise<string> {
    const thread = await this.client.threads.create();
    return thread.thread_id;
  }

  async *streamMessage(
    threadId: string,
    content: string,
    assistantId: string = "agent"
  ): AsyncGenerator<string, void, unknown> {
    const streamResponse = this.client.runs.stream(threadId, assistantId, {
      input: {
        messages: [{ role: "human", content }],
      },
      streamMode: "messages",
    });

    for await (const chunk of streamResponse) {
      if (chunk.event === "messages/partial") {
        const messageChunks = chunk.data as MessageChunk[];
        if (messageChunks && messageChunks.length > 0) {
          const lastMessage = messageChunks[messageChunks.length - 1];
          if (lastMessage.type === "ai" && lastMessage.content) {
            const content = typeof lastMessage.content === "string"
              ? lastMessage.content
              : (lastMessage.content as ContentPart[])
                  .map((c) => c.text || "")
                  .join("");
            yield content;
          }
        }
      }
    }
  }

  async getThreadState(threadId: string) {
    return await this.client.threads.getState(threadId);
  }
}

export const chatService = new ChatService();
