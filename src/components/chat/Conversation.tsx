import { LANGGRAPH_API_URL } from "@/consts";
import { ActiveThread } from "@/types/types";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { ChatState, ChatBag } from "@/types/stream";
import { useState } from "react";
import { langgraphService } from "@/services/langgraphService";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import EmptyState from "./EmptyState";

interface ConversationProps {
    readonly threadData: ActiveThread;
}

export default function Conversation({ threadData }: ConversationProps) {
    const { id, newConversation: isInitiallyNew } = threadData;  // Removed initialMessages

    const [input, setInput] = useState<string>('');
    const [isNew, setIsNew] = useState(isInitiallyNew);

    // Use useStream instead of useChat
    const stream = useStream<ChatState, ChatBag>({
        assistantId: "agent",
        apiUrl: LANGGRAPH_API_URL,
        threadId: id,
        fetchStateHistory: true,  // Fetch all history from thread
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (input.trim() && !stream.isLoading && !stream.interrupt) {
            if (isNew) {
                const generatedTitle = langgraphService.generateTitle(input);
                langgraphService.updateThreadTitle(id, generatedTitle).catch(console.error);
                setIsNew(false);
            }

            // Submit new message using stream.submit()
            stream.submit(
                {
                    messages: [{
                        type: "human",
                        content: input
                    }]
                }
            );

            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full flex-1 bg-gray-950 animate-fade-in">
            {/* Messages Area - ChatGPT Style Center Aligned */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {stream.messages.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <MessageList
                            messages={stream.messages}
                            isStreaming={stream.isLoading}
                            error={undefined}  // No error handling needed - interrupts are separate
                        />
                    )}

                    {/* Show interrupt UI if graph is paused */}
                    {stream.interrupt && (
                        <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg mt-4">
                            <p className="text-yellow-200 font-semibold">
                                Waiting for human intervention
                            </p>
                            <p className="text-sm text-yellow-300 mt-1">
                                {stream.interrupt.value?.reason || stream.interrupt.value?.instruction || 'The agent is waiting for approval to proceed.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isStreaming={stream.isLoading}
                onStop={stream.stop}
                isInterrupted={!!stream.interrupt}
            />
        </div>
    );
}
