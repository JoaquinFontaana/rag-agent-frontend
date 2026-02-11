import { Thread } from "@/types/types";
import { Plus, MessageSquare } from 'lucide-react'
//Sidebar con todos los threads del usuario
interface ChatListProps{
    readonly threads:Thread[]
    readonly onSelect: (threadId: string) => void
    readonly activeId:string
    readonly onNewChat: () => void;
}
export default function ChatList({threads, onSelect,activeId, onNewChat}:ChatListProps){
    return (
        <div className="flex flex-col w-72 border-r border-gray-800 bg-gray-900 h-full">
        
            {/* Header / New Chat Button */}
            <div className="p-4 border-b border-gray-800">
                <button
                onClick={onNewChat}
                className="w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                <Plus size={18} />
                New Chat
                </button>
            </div>

            {/* Scrollable Thread List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {threads.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">
                    No chat history yet
                </div>
                ) : (
                threads.map((thread) => {
                    const isActive = activeId === thread.thread_id;
                    
                    return (
                    <button
                        key={thread.thread_id}
                        onClick={() => onSelect(thread.thread_id)}
                        className={`
                        w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-all
                        ${isActive 
                            ? "bg-gray-800 shadow-md border border-gray-700" 
                            : "hover:bg-gray-800/50 text-gray-400 hover:text-gray-300"
                        }
                        `}
                    >
                        {/* Title Row */}
                        <div className="flex items-center gap-2 w-full">
                        <MessageSquare 
                            size={16} 
                            className={isActive ? "text-blue-500" : "text-gray-500"} 
                        />
                        <span className={`text-sm font-medium truncate w-full ${isActive ? "text-white" : ""}`}>
                            {thread.metadata?.title || "New conversation"}
                        </span>
                        </div>
                    </button>
                    );
                })
                )}
            </div>
        </div>
  );
}