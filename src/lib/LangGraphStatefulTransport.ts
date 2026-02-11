import { LangSmithDeploymentTransport, toUIMessageStream } from '@ai-sdk/langchain';
import type { UIMessage, UIMessageChunk, ChatRequestOptions } from 'ai';

/**
 * Custom transport that extends LangSmithDeploymentTransport to use
 * stateful LangGraph streaming (client.runs.stream) instead of graph.stream.
 * This ensures messages are persisted to the thread state.
 */
export class LangGraphStatefulTransport<UI_MESSAGE extends UIMessage> extends LangSmithDeploymentTransport<UI_MESSAGE> {
    private threadId: string;

    constructor(apiUrl: string, threadId: string, graphId: string = "agent") {
        // Call parent constructor with graph configuration
        super({ url: apiUrl, graphId: graphId });
        this.threadId = threadId;
    }

    /**
     * Override sendMessages to use client.runs.stream instead of graph.stream.
     * This uses the stateful /threads/{thread_id}/runs/stream endpoint.
     */
    async sendMessages(options: {
        trigger: 'submit-message' | 'regenerate-message';
        chatId: string;
        messageId: string | undefined;
        messages: UI_MESSAGE[];
        abortSignal: AbortSignal | undefined;
    } & ChatRequestOptions): Promise<ReadableStream<UIMessageChunk>> {
        // Only send the NEW message (last one), not the entire history
        // The thread state already contains previous messages
        const lastMessage = options.messages[options.messages.length - 1];

        const newMessage = {
            role: lastMessage.role === 'user' ? 'human' : lastMessage.role === 'assistant' ? 'ai' : lastMessage.role,
            content: lastMessage.parts.map(part => {
                if (part.type === 'text') {
                    return part.text;
                }
                return '';
            }).join('')
        };

        // Use parent's graph.stream with thread_id in config for stateful persistence
        const stream = await this.graph.stream(
            { messages: [newMessage] },  // Only send the new message
            {
                streamMode: ["values", "messages"],
                configurable: { thread_id: this.threadId }
            }
        );

        // Reuse parent class's toUIMessageStream for parsing
        return toUIMessageStream(stream);
    }
}
