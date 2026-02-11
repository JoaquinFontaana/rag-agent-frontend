import { Client } from "@langchain/langgraph-sdk";
import type { Thread as LangGraphThread} from "@langchain/langgraph-sdk";
import {
  ContentPart,
  Thread,
  MyUIMessage,
  Metadata
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

  // Map LangGraph message type to UIMessage role
  private mapMessageTypeToRole(type: string): 'user' | 'assistant' | 'system' {
    switch (type) {
      case 'human':
        return 'user';
      case 'ai':
        return 'assistant';
      default:
        return 'system';
    }
  }

  // Generate a title from the first user message
  generateTitle(firstMessage: string): string {
    const maxLength = 50
    const cleaned = firstMessage.trim().replaceAll(/\s+/g, ' ')
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    return cleaned.substring(0, maxLength - 3) + '...'
  }

  async createThread(userId: string): Promise<string> {
    const response = await this.client.threads.create({
      metadata: {
        userId: userId,
      },
    });

    return response.thread_id;
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
        const timeA = a.updated_at || a.created_at || ''
        const timeB = b.updated_at || b.created_at || ''
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

  async getThreadState(threadId: string) {
    return await this.client.threads.getState(threadId);
  }

  async getThreadMessages(threadId: string): Promise<MyUIMessage[]> {
    try {
      const state = await this.client.threads.getState(threadId);
      const values = state.values as { messages?: Array<{type: string; content: string | ContentPart[]}> };
      const messages = values?.messages || [];
      
      const metadata: Metadata = {
        userId: (state.metadata as any)?.userId || ''
      };
      
      // Transform LangGraph messages to MyUIMessage format
      return messages.map((msg, index) => {
        const role = this.mapMessageTypeToRole(msg.type);
        
        const parts = typeof msg.content === 'string' 
          ? [{ type: 'text' as const, text: msg.content }]
          : (msg.content).map(part => ({ 
              type: 'text' as const, 
              text: part.text || '' 
            }));

        return {
          id: `${threadId}-${index}`,
          role,
          parts,
          metadata
        };
      });
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();
