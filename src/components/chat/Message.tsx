import { MyUIMessage } from "@/types/types";
import { Bot, User } from "lucide-react";

interface MessageProps{
    readonly message:MyUIMessage
}
export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  // 1. Extract content safely (Supports simple string or Vercel's 'parts' array)
  const content =
        message.parts
            ?.filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") || "";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* 2. Avatar Circle */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* 3. Message Bubble */}
      <div
        className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm shadow-lg" // User Styles
            : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm shadow-lg" // AI Styles
        }`}
      >
        {/* Name Label */}
        <span
          className={`text-[10px] font-bold uppercase mb-1 block ${
            isUser ? "text-blue-200" : "text-purple-400"
          }`}
        >
          {isUser ? "You" : "AI Assistant"}
        </span>

        {/* Content Rendering */}
        <div className="whitespace-pre-wrap break-words">
          {content || <span className="italic opacity-50">Thinking...</span>}
        </div>
      </div>
    </div>
  );
}