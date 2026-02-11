'use client'
import ChatList from "@/components/chat/ChatList";
import Conversation from "@/components/chat/Conversation";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/services/chatService";
import { ActiveThread, Thread } from "@/types/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function Chat() {
    const {isAuthenticated,user, isLoading:isAuthLoading} = useAuth()
    const [threads,setThreads] = useState<Thread[]>([])
    const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
    const [isSwitching,setIsSwitching] = useState(false)
    const [isInitialLoading,setIsInitialLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
    // Only redirect if we are DONE loading AND not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push("/login");
    }
    }, [isAuthLoading, isAuthenticated, router]);

    useEffect(()=>{
        if (!user || !isAuthenticated){
            return
        }
        const initChat = async () => {
            try {
                // 1. Fetch Threads
                const userThreads = await chatService.getUserThreads(user.id.toString());
                setThreads(userThreads);

                // 2. Decide: Load Existing or Create New
                if (userThreads.length > 0) {
                    const lastThread = userThreads[0]; // Or find most recent
                    const msgs = await chatService.getThreadMessages(lastThread.thread_id);
                    
                    setActiveThread({
                        id: lastThread.thread_id,
                        messages: msgs,
                        newConversation:false
                    });
                } else {
                    const newId = await chatService.createThread(user.id.toString());
                    setActiveThread({
                        id: newId,
                        messages: [],
                        newConversation:true
                    });
                }
            } catch (error) {
                console.error("Failed to init chat", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        initChat();
    },[user, isAuthenticated])

    if (!isAuthenticated || !user) {
    return null; 
    } 

    const handleThreadSelect = async (threadId: string) => {
        // Optimization: Don't reload if already active
        if (activeThread?.id === threadId) return;

        setIsSwitching(true);
        try {
            const msgs = await chatService.getThreadMessages(threadId);
            setActiveThread({
                id: threadId,
                messages: msgs,
                newConversation: false
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSwitching(false);
        }
    }
    const handleNewChat = async () => {
        setIsSwitching(true);
        try {
            if(!user) return
            // Create new thread on the server immediately
            const newId = await chatService.createThread(user.id.toString());
            
            // Refresh thread list
            const updatedThreads = await chatService.getUserThreads(user.id.toString());
            setThreads(updatedThreads);

            // Select the new empty thread
            setActiveThread({
                id: newId,
                messages: [],
                newConversation: true
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSwitching(false);
        }
    };
    if (isInitialLoading) {
        return (
                <div className="flex h-screen items-center justify-center bg-gray-950">
                {/* Ensure this background matches your app theme to avoid white flash */}
                <div className="animate-spin text-blue-600">...</div>
                </div>
        )
    }

    return(
        <div className="flex h-screen bg-gray-950 ">
            {isAuthenticated && user && activeThread &&(
                <>
                    <ChatList onNewChat={handleNewChat} activeId={activeThread.id} onSelect={handleThreadSelect} threads={threads}></ChatList>
                    <Conversation key={activeThread.id} threadData={activeThread} userId={user.id}></Conversation>
                </>
            )}
        </div>
    )
}