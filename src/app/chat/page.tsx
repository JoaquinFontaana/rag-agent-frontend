'use client'
import ChatList from "@/components/chat/ChatList";
import Conversation from "@/components/chat/Conversation";
import { useAuth } from "@/context/AuthContext";
import { langgraphService } from "@/services/langgraphService";
import { ActiveThread, Thread } from "@/types/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Button from "@/components/ui/Button"; // Added import for Button component

export default function Chat() {
    const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()
    const [threads, setThreads] = useState<Thread[]>([])
    const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
    const [isSwitching, setIsSwitching] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed for mobile
    const router = useRouter()

    // Open sidebar by default on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        // Listen for resize
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Only redirect if we are DONE loading AND not authenticated
        if (!isAuthLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!user || !isAuthenticated) {
            return
        }
        const initChat = async () => {
            try {
                // 1. Fetch Threads
                const userThreads = await langgraphService.getUserThreads(user.id.toString());
                setThreads(userThreads);

                // 2. Decide: Load Existing or Create New
                if (userThreads.length > 0) {
                    const lastThread = userThreads[0];

                    setActiveThread({
                        id: lastThread.thread_id,
                        newConversation: false
                    });
                } else {
                    const newId = await langgraphService.createThread(user.id.toString());
                    setActiveThread({
                        id: newId,
                        newConversation: true
                    });
                }
            } catch (error) {
                console.error("Failed to init chat", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        initChat();
    }, [user, isAuthenticated])

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleThreadSelect = async (threadId: string) => {
        // Optimization: Don't reload if already active
        if (activeThread?.id === threadId) return;

        setIsSwitching(true);
        try {
            setActiveThread({
                id: threadId,
                newConversation: false
            });
            // Close sidebar on mobile after selection
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSwitching(false);
        }
    }

    const handleNewChat = async () => {
        setIsSwitching(true);
        try {
            if (!user) return
            // Create new thread on the server immediately
            const newId = await langgraphService.createThread(user.id.toString());

            // Refresh thread list
            const updatedThreads = await langgraphService.getUserThreads(user.id.toString());
            setThreads(updatedThreads);

            // Select the new empty thread
            setActiveThread({
                id: newId,
                newConversation: true
            });
            // Close sidebar on mobile after creating new chat
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSwitching(false);
        }
    };

    const handleDeleteThread = async (threadId: string) => {
        try {
            await langgraphService.deleteThread(threadId);

            // Update local thread list
            const updatedThreads = threads.filter(t => t.thread_id !== threadId);
            setThreads(updatedThreads);

            // If we deleted the active thread, switch to another or create new
            if (activeThread?.id === threadId) {
                if (updatedThreads.length > 0) {
                    const newActiveThread = updatedThreads[0];
                    setActiveThread({
                        id: newActiveThread.thread_id,
                        newConversation: false
                    });
                } else {
                    // No threads left, create a new one
                    await handleNewChat();
                }
            }
        } catch (error) {
            console.error("Failed to delete thread:", error);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-950">
                {/* Ensure this background matches your app theme to avoid white flash */}
                <div className="animate-spin text-blue-600">...</div>
            </div>
        )
    }

    return (
        <div className="flex h-full bg-gray-950 relative overflow-hidden">
            {/* Hamburger Menu Button - positioned better for mobile */}
            <Button
                variant="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                icon={<Menu size={20} />}
                className="fixed top-20 left-2 z-50 lg:hidden bg-gray-800"
                title="Toggle sidebar"
            />

            {isAuthenticated && user && activeThread && (
                <>
                    <ChatList
                        onNewThread={handleNewChat}
                        activeThreadId={activeThread.id}
                        onThreadSelect={handleThreadSelect}
                        threads={threads}
                        onDelete={handleDeleteThread}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                    <Conversation key={activeThread.id} threadData={activeThread} />
                </>
            )}
        </div>
    )
}