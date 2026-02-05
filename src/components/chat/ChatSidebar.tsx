import { useState, useEffect } from "react";
import { chatService } from "@/services/chatService";

interface Thread {
  thread_id: string;
  metadata: {
    userId: string;
    createdAt: string;
  };
}

interface ChatSidebarProps {
  userId: string;
  currentThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  userId,
  currentThreadId,
  onThreadSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoading(true);
        const userThreads = await chatService.getUserThreads(userId);
        setThreads(userThreads);
      } catch (error) {
        console.error("Error loading threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThreads();
  }, [userId, currentThreadId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + New Chat
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-gray-400 text-sm text-center">
            Loading chats...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm text-center">
            No chats yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <button
                key={thread.thread_id}
                onClick={() => onThreadSelect(thread.thread_id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentThreadId === thread.thread_id
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    Chat
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(thread.metadata.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
