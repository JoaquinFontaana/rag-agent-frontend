import { MyUIMessage } from "@/types/types";
import Message from "./Message";
import ThinkingIndicator from "./ThinkingIndicator";
import { useRef, useEffect } from "react";

interface MessageListProps {
    readonly messages: MyUIMessage[];
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
        <div className="space-y-6">
            {messages.map(message => (
                <Message key={message.id} message={message} />
            ))}

            {/* Thinking Indicator */}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <ThinkingIndicator />
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg animate-fade-in">
                    <strong>Error:</strong> {error.message}
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
