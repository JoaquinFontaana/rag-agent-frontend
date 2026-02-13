import { Message as LangGraphMessage } from "@langchain/langgraph-sdk";
import { Bot, User, Wrench } from "lucide-react";
import { memo } from "react";

interface MessageProps {
  readonly message: LangGraphMessage;
}

function Message({ message }: MessageProps) {
  const isUser = message.type === "human";
  
  // 1. CRITICAL FIX: Check if this is a "Tool Call" message
  // An AI message with tool_calls usually has empty content, causing the "Thinking" bug.
  // We cast to 'any' because strict types might miss 'tool_calls' depending on SDK version.
  const hasToolCalls = (message as any).tool_calls?.length > 0;
  
  // 2. Hide Tool Calls & Tool Outputs
  // If you want to see them, remove this block. 
  // But to fix the "Double Thinking" glitch, we hide them.
  if (message.type === "tool" ) {
    return null; 
  }

  // 3. Handle Content
  const content = typeof message.content === 'string' ? message.content : '';
  
  // 4. Only show "Thinking" if it's AI, has NO content, and is NOT a tool call
  const showThinking = !isUser && !content && !hasToolCalls;

  return (
    <div className={`flex w-full gap-2 sm:gap-3 py-3 sm:py-4 ${isUser ? "bg-transparent" : "bg-gray-900/50 rounded-lg"}`}>
      <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 flex gap-2 sm:gap-4">
        
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isUser
            ? "bg-blue-600 shadow-lg"
            : "bg-purple-600 shadow-lg"
          }`}
        >
          {isUser ? <User size={14} className="text-white sm:w-4 sm:h-4" /> : <Bot size={14} className="text-white sm:w-4 sm:h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-semibold mb-1 text-gray-400">
            {isUser ? "You" : "Assistant"}
          </div>
          <div className="text-sm sm:text-base text-gray-100 whitespace-pre-wrap break-words">
            {showThinking ? (
                <span className="italic text-gray-500 animate-pulse">Thinking...</span>
            ) : (
                content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimization: Prevent re-renders unless ID/Content changes
export default memo(Message, (prev, next) => {
    return (
        prev.message.id === next.message.id && 
        prev.message.content === next.message.content &&
        prev.message.type === next.message.type
    );
});