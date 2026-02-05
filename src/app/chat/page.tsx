"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/types/types";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      if (!user) return;
      
      try {
        const newThreadId = await chatService.createThread(user.id.toString());
        setThreadId(newThreadId);
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };
    initThread();
  }, [user]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      for await (const content of chatService.streamMessage(threadId, userMessage.content)) {
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
      const formattedMessages: Message[] = threadMessages.map((msg: any, idx: number) => ({
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
      />
      <div className="flex flex-col flex-1">
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
    </div>
  );
}