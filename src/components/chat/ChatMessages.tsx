import type { Message } from "@/services/chatService";
import ChatMessage from "./ChatMessage";
import EmptyChat from "./EmptyChat";

interface ChatMessagesProps {
  readonly messages: Message[];
  readonly isLoading: boolean;
  readonly messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({
  messages,
  isLoading,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLoading={isLoading}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
