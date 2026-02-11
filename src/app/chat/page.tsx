import ChatList from "@/components/chat/ChatList";
import Conversation from "@/components/chat/Conversation";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/services/chatService";
import { ActiveThread, Thread } from "@/types/types";
import { useEffect, useState } from "react";

export default function Chat() {
    const {isAuthenticated,user} = useAuth()
    const [threads,setThreads] = useState<Thread[]>([])
    
    const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
    const [isLoading,setIsLoading] = useState(false)

    useEffect(()=>{
        if (!user || !isAuthenticated){
            return
            //TODO redirect to login
        }
        
       const initChat = async () => {
            setIsLoading(true);
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
                setIsLoading(false);
            }
        };

        initChat();
    },[user, isAuthenticated])

    const handleThreadSelect = async (threadId: string) => {
        // Optimization: Don't reload if already active
        if (activeThread?.id === threadId) return;

        setIsLoading(true);
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
            setIsLoading(false);
        }
    }
    
    return(
        <>
        {isAuthenticated && user && activeThread &&(
            <>
                <ChatList onSelect={handleThreadSelect} threads={threads}></ChatList>
                <Conversation key={activeThread.id} threadData={activeThread} userId={user.id}></Conversation>
            </>
        )}
        </>
    )
}