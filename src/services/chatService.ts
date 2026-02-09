import { Client } from "@langchain/langgraph-sdk";
import type { Thread as LangGraphThread} from "@langchain/langgraph-sdk";
import {
  MessageChunk,
  ContentPart,
  Thread
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

  // Generate a title from the first user message
  private generateTitle(firstMessage: string): string {
    const maxLength = 50
    const cleaned = firstMessage.trim().replaceAll(/\s+/g, ' ')
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    return cleaned.substring(0, maxLength - 3) + '...'
  }

  async createThread(userId: string): Promise<string> {
    const thread = await this.client.threads.create({
      metadata: {
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    return thread.thread_id;
  }

  async getUserThreads(userId: string): Promise<Thread[]> {
    try {
      const threads = await this.client.threads.search({
        metadata: { userId }
      });
      
      // Sort by updated time (most recent first)
      const mapped: Thread[] = threads.map((t: LangGraphThread) => ({
        thread_id: t.thread_id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        metadata: t.metadata as Thread['metadata'],
        values: t.values
      }));
      
      return mapped.sort((a, b) => {
        const timeA = a.metadata?.updatedAt || a.metadata?.createdAt || ''
        const timeB = b.metadata?.updatedAt || b.metadata?.createdAt || ''
        return timeB.localeCompare(timeA)
      })
    } catch (error) {
      console.error('Error fetching user threads:', error);
      return [];
    }
  }

  async updateThreadTitle(threadId: string, title: string): Promise<void> {
    try {
      const currentState = await this.client.threads.getState(threadId)
      await this.client.threads.update(threadId, {
        metadata: {
          ...currentState.metadata,
          title,
          updatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error updating thread title:', error)
      throw error
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    try {
      await this.client.threads.delete(threadId)
    } catch (error) {
      console.error('Error deleting thread:', error)
      throw error
    }
  }

  async *streamMessage(
    threadId: string,
    content: string,
    assistantId: string = "agent",
    isFirstMessage: boolean = false
  ): AsyncGenerator<string, void, unknown> {
    const streamResponse = this.client.runs.stream(threadId, assistantId, {
      input: { 'messages':[content] },
      streamMode: "messages",
    });
    for await (const chunk of streamResponse) {
      if (chunk.event !== "messages/partial") continue;
      
      const messageChunks = chunk.data as MessageChunk[];
      const lastMessage = messageChunks?.at(-1);
      
      if (lastMessage?.type === "ai" && lastMessage.content) {
        const text = typeof lastMessage.content === "string"
          ? lastMessage.content
          : (lastMessage.content as unknown as ContentPart[]).map((c) => c.text || "").join("");
        
        yield text;
      }
    }

    // Auto-generate title for first message
    if (isFirstMessage) {
      try {
        const title = this.generateTitle(content)
        await this.updateThreadTitle(threadId, title)
      } catch (error) {
        console.error('Error auto-generating title:', error)
      }
    }
  }

  async getThreadState(threadId: string) {
    return await this.client.threads.getState(threadId);
  }

  async getThreadMessages(threadId: string): Promise<Array<{type: string; content: string | ContentPart[]}>> {
    try {
      const state = await this.client.threads.getState(threadId);
      const values = state.values as { messages?: Array<{type: string; content: string | ContentPart[]}> };
      return values?.messages || [];
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();
