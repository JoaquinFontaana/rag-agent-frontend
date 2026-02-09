"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/types/types";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import DocumentList from "@/components/documents/DocumentList";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initThread = async () => {
      if (!user || threadId || isInitialized.current) return;
      
      isInitialized.current = true;
      try {
        // First, try to load existing threads
        const existingThreads = await chatService.getUserThreads(user.id.toString());
        
        if (existingThreads.length > 0) {
          // Use the most recent thread
          const mostRecentThread = existingThreads[0]; // Already sorted by most recent
          setThreadId(mostRecentThread.thread_id);
          console.log("Loaded existing thread:", mostRecentThread.thread_id);
        } else {
          // Create a new thread only if none exist
          const newThreadId = await chatService.createThread(user.id.toString());
          setThreadId(newThreadId);
          console.log("Created new thread:", newThreadId);
        }
      } catch (error) {
        console.error("Error initializing thread:", error);
        isInitialized.current = false; // Reset on error to allow retry
      }
    };
    initThread();
  }, [user, threadId]);

  const handleSubmit = async (e: {preventDefault: () => void}) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const isFirstMessage = messages.length === 0;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      for await (const content of chatService.streamMessage(
        threadId, 
        userMessage.content,
        "agent",
        isFirstMessage
      )) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    if (!user) return;
    
    try {
      const newThreadId = await chatService.createThread(user.id.toString());
      setThreadId(newThreadId);
      setMessages([]);
      isInitialized.current = true; // Mark as initialized with new thread
    } catch (error) {
      console.error("Error creating new thread:", error);
    }
  };

  const handleThreadSelect = async (selectedThreadId: string) => {
    try {
      setThreadId(selectedThreadId);
      setMessages([]);
      setIsLoading(true);

      // Load thread messages
      const threadMessages = await chatService.getThreadMessages(selectedThreadId);
      
      // Convert to Message format
      const formattedMessages: Message[] = threadMessages.map((msg, idx: number) => ({
        id: `${selectedThreadId}-${idx}`,
        role: msg.type === "human" ? "user" : "assistant",
        content: typeof msg.content === "string" ? msg.content : msg.content?.[0]?.text || "",
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading thread:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadDeleted = async () => {
    if (!user) return;
    
    try {
      // Check if there are remaining threads
      const remainingThreads = await chatService.getUserThreads(user.id.toString());
      
      if (remainingThreads.length > 0) {
        // Select the most recent remaining thread
        const nextThread = remainingThreads[0];
        await handleThreadSelect(nextThread.thread_id);
      } else {
        // Only create a new chat if no threads remain
        startNewChat();
      }
    } catch (error) {
      console.error("Error handling thread deletion:", error);
      // Fallback to creating new chat on error
      startNewChat();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar
        userId={user.id.toString()}
        currentThreadId={threadId}
        onThreadSelect={handleThreadSelect}
        onNewChat={startNewChat}
        onThreadDeleted={handleThreadDeleted}
      />
      
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
          <h1 className="text-lg font-semibold text-white">RAG Agent Chat</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/documents")}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Manage Documents
            </button>
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              {showDocuments ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
        </div>
        
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          onNewChat={startNewChat}
        />
      </div>

      {showDocuments && (
        <div className="w-96 border-l border-gray-700 bg-gray-800">
          <DocumentList />
        </div>
      )}
    </div>
  );
}