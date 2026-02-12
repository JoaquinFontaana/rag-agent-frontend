import { Message as LangGraphMessage } from "@langchain/langgraph-sdk";
import { Bot, User } from "lucide-react";

interface MessageProps {
  readonly message: LangGraphMessage;
}
export default function Message({ message }: MessageProps) {
  const isUser = message.type === "human";

  // LangGraph messages have content as string, not parts[]
  const content = typeof message.content === 'string'
    ? message.content
    : '';

  return (
    <div className={`flex w-full gap-3 py-4 ${isUser ? "bg-transparent" : "bg-gray-900/50 rounded-lg"}`}>
      <div className="max-w-3xl mx-auto w-full px-4 flex gap-4">
        {/* Avatar Circle */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
            : "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
            }`}
        >
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-1 text-gray-300">
            {isUser ? "You" : "Assistant"}
          </div>
          <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
            {content || <span className="italic text-gray-500">Thinking...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}