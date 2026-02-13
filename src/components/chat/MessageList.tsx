import { Message } from "@langchain/langgraph-sdk";
import MessageComponent from "./Message";
import ThinkingIndicator from "./ThinkingIndicator";
import { useRef, useEffect } from "react";

interface MessageListProps {
    readonly messages: Message[];
    readonly isStreaming: boolean;
    readonly error: Error | undefined;
}

export default function MessageList({ messages, isStreaming, error }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {messages.map(message => (
                <MessageComponent key={message.id} message={message} />
            ))}

            {/* Thinking Indicator - show when streaming and last message is from human */}
            {isStreaming && messages[messages.length - 1]?.type !== 'ai' && (
                <ThinkingIndicator />
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg animate-fade-in">
                    <strong>Error:</strong> {error.message}
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
