"use client"

import { useState, useEffect } from "react";
import { chatService } from "@/services/chatService";
import type { Thread } from "@/types/types";

interface ChatSidebarProps {
  readonly userId: string;
  readonly currentThreadId: string | null;
  readonly onThreadSelect: (threadId: string) => void;
  readonly onNewChat: () => void;
  readonly onThreadDeleted?: () => void;
}

export default function ChatSidebar({
  userId,
  currentThreadId,
  onThreadSelect,
  onNewChat,
  onThreadDeleted,
}: ChatSidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  useEffect(() => {
    loadThreads();
  }, [userId]);

  // Reload threads when current thread changes (to get updated title)
  useEffect(() => {
    if (currentThreadId) {
      loadThreads();
    }
  }, [currentThreadId]);

  const formatDate = (dateString: string) => {
    try {
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
    } catch {
      return "";
    }
  };

  const getThreadTitle = (thread: Thread): string => {
    return thread.metadata?.title || "New Chat";
  };

  const handleRename = (thread: Thread) => {
    setEditingThreadId(thread.thread_id);
    setEditTitle(getThreadTitle(thread));
  };

  const handleSaveRename = async (threadId: string) => {
    try {
      await chatService.updateThreadTitle(threadId, editTitle);
      await loadThreads();
      setEditingThreadId(null);
    } catch (error) {
      console.error("Error renaming thread:", error);
      alert("Failed to rename conversation");
    }
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditTitle("");
  };

  const handleDelete = async (threadId: string) => {
    if (!confirm("Delete this conversation?")) return;

    try {
      await chatService.deleteThread(threadId);
      await loadThreads();
      if (currentThreadId === threadId && onThreadDeleted) {
        onThreadDeleted();
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Failed to delete conversation");
    }
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
        {isLoading && (
          <div className="p-4 text-gray-400 text-sm text-center">
            Loading chats...
          </div>
        )}
        
        {!isLoading && threads.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">
            No chats yet
          </div>
        )}
        
        {!isLoading && threads.length > 0 && (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.thread_id}
                className={`group relative rounded-lg transition-colors ${
                  currentThreadId === thread.thread_id
                    ? "bg-gray-800"
                    : "hover:bg-gray-800/50"
                }`}
              >
                {editingThreadId === thread.thread_id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(thread.thread_id);
                        if (e.key === "Escape") handleCancelRename();
                      }}
                      className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleSaveRename(thread.thread_id)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onThreadSelect(thread.thread_id)}
                      className="w-full text-left px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-300 truncate flex-1">
                          {getThreadTitle(thread)}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(thread.metadata?.updatedAt || thread.metadata?.createdAt || "")}
                        </span>
                      </div>
                    </button>
                    <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(thread);
                        }}
                        className="p-1 text-xs text-gray-400 hover:text-white bg-gray-700 rounded"
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(thread.thread_id);
                        }}
                        className="p-1 text-xs text-gray-400 hover:text-white bg-gray-700 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
