"use client";

import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import type { Message } from "@/types/types";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initThread = async () => {
      try {
        const newThreadId = await chatService.createThread();
        setThreadId(newThreadId);
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };
    initThread();
  }, []);

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
    try {
      const newThreadId = await chatService.createThread();
      setThreadId(newThreadId);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new thread:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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
  );
}