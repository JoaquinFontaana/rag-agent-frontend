import { Thread } from "@/types/types";

//Sidebar con todos los threads del usuario
interface ChatListProps{
    readonly threads:Thread[]
    readonly onSelect: (threadId: string) => void
    readonly activeId:string
    readonly onNewChat: () => void;
}
export default function ChatList({threads, onSelect,activeId, onNewChat}:ChatListProps){
    return (
        <div className="flex flex-col w-64 border-r border-gray-200 bg-gray-50 h-full">
        
            {/* Header / New Chat Button */}
            <div className="p-4 border-b border-gray-200">
                <button
                onClick={onNewChat}
                className="w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                <Plus size={16} />
                New Chat
                </button>
            </div>

            {/* Scrollable Thread List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {threads.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10">
                    No history yet
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
                            ? "bg-white shadow-sm border border-gray-200" 
                            : "hover:bg-gray-200/50 text-gray-600"
                        }
                        `}
                    >
                        {/* Title Row */}
                        <div className="flex items-center gap-2 w-full">
                        <MessageSquare 
                            size={14} 
                            className={isActive ? "text-blue-500" : "text-gray-400"} 
                        />
                        <span className={`text-sm font-medium truncate w-full ${isActive ? "text-gray-900" : ""}`}>
                            {thread.title || "Untitled Conversation"}
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