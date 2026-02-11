import { LANGGRAPH_API_URL } from "@/consts";
import { ActiveThread, MyUIMessage } from "@/types/types";
import { LangSmithDeploymentTransport } from "@ai-sdk/langchain";
import { useChat } from "@ai-sdk/react";
import { useMemo, useState } from "react";
import { chatService } from "@/services/chatService";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import EmptyState from "./EmptyState";

interface ConversationProps {
    readonly threadData: ActiveThread
    readonly userId: number
}

export default function Conversation({ threadData, userId }: ConversationProps) {
    const { id, newConversation: isInitiallyNew, messages: initialMessages } = threadData

    const [input, setInput] = useState<string>('');
    const [isNew, setIsNew] = useState(isInitiallyNew);

    const transport = useMemo(() => new LangSmithDeploymentTransport({
        url: LANGGRAPH_API_URL,
        graphId: "agent",
    }), []);

    const { messages, error, clearError, sendMessage, stop, status } = useChat<MyUIMessage>({
        transport,
        id: id,
        messages: initialMessages,
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() && (status === 'ready' || status === 'error')) {
            if (isNew) {
                const generatedTitle = chatService.generateTitle(input);
                chatService.updateThreadTitle(id, generatedTitle).catch(console.error);
                setIsNew(false);
            }
            clearError();
            sendMessage({
                text: input,
                metadata: {
                    userId: userId.toString()
                }
            });
            setInput('');
        }
    };

    const isStreaming = status === 'streaming';

    return (
        <div className="flex flex-col h-full flex-1 bg-gray-950 animate-fade-in">
            {/* Messages Area - ChatGPT Style Center Aligned */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <MessageList
                            messages={messages}
                            isStreaming={isStreaming}
                            error={error}
                        />
                    )}
                </div>
            </div>

            {/* Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isStreaming={isStreaming}
                onStop={stop}
            />
        </div>
    );
}