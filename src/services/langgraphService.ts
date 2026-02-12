import { Client } from "@langchain/langgraph-sdk";
import type { Thread as LangGraphThread } from "@langchain/langgraph-sdk";
import {
  Thread,
  Metadata
}
  from "@/types/types"
import { LANGGRAPH_API_URL } from "@/consts"

class ChatService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      apiUrl: LANGGRAPH_API_URL
    });
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


  /**
   * Get all threads that have active interrupts (waiting for human approval)
   */
  async getInterruptedThreads(): Promise<Thread[]> {
    try {
      // Use status filter to get only interrupted threads - much more efficient!
      const interruptedThreads = await this.client.threads.search({
        status: "interrupted",
        sortBy: "updated_at",
        sortOrder: "desc"
      });

      // Map to our Thread type
      return interruptedThreads.map((t: LangGraphThread) => ({
        thread_id: t.thread_id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        metadata: t.metadata as Thread['metadata'],
        values: t.values
      }));
    } catch (error) {
      console.error('Error fetching interrupted threads:', error);
      return [];
    }
  }

  /**
   * Resume a thread that's paused at an interrupt by updating the state
   * @param threadId The thread to resume
   * @param resolve If true, sends "resolve" (ends conversation). If false, sends "continue" (keeps human active)
   * @param response The admin's response message to the user
   */
  async resumeThread(threadId: string, resolve: boolean, response?: string): Promise<void> {
    try {
      // Prepare state updates matching backend expectations
      const stateUpdates = {
        human_response: response || "Response from administrator.",
        human_action: resolve ? "resolve" : "continue", // resolve = end, continue = keep active
      };
      console.info(stateUpdates)
      // Trigger the graph to continue execution with updated state
      await this.client.runs.create(
        threadId,
        "agent",
        {
          command: {
            resume: stateUpdates  // Resume from interrupt point
          }
        }
      );

      console.log(`Thread ${threadId} state updated with action=${stateUpdates.human_action}`);
    } catch (error) {
      console.error(`Error resuming thread ${threadId}:`, error);
      throw error;
    }
  }
}

export const langgraphService = new ChatService();
