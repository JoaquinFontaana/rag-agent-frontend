import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Thread } from "@/types/types";
import Button from "../ui/Button";

interface ChatListProps {
    readonly threads: Thread[];
    readonly activeThreadId: string;
    readonly onThreadSelect: (id: string) => void;
    readonly onNewThread: () => void;
    readonly onDelete: (id: string) => void;
    readonly isOpen: boolean;
    readonly onToggle: () => void;
}

export default function ChatList({ threads, activeThreadId, onThreadSelect, onNewThread, onDelete, isOpen, onToggle }: ChatListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (deletingId) {
            const timeout = setTimeout(() => setDeletingId(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [deletingId]);

    const handleDelete = (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation();
        if (deletingId === threadId) {
            onDelete(threadId);
            setDeletingId(null);
        } else {
            setDeletingId(threadId);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-50
                flex flex-col w-72 border-r border-gray-800 bg-gray-900 h-full
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Chats</h2>
                    <Button
                        variant="icon"
                        size="sm"
                        onClick={onToggle}
                        icon={<X size={20} />}
                        className="lg:hidden"
                        title="Close sidebar"
                    />
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <Button
                        variant="gradient"
                        size="lg"
                        onClick={onNewThread}
                        icon={<Plus size={18} />}
                        className="w-full"
                    >
                        New Chat
                    </Button>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {threads.map(thread => (
                        <div
                            key={thread.thread_id}
                            onClick={() => onThreadSelect(thread.thread_id)}
                            className={`
                                group relative flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-all
                                ${activeThreadId === thread.thread_id
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                }
                            `}
                        >
                            <MessageSquare size={16} className="flex-shrink-0" />
                            <span className="flex-1 truncate text-sm">{thread.metadata?.title || "New conversation"}</span>

                            {/* Delete Button - appears on hover */}
                            <Button
                                variant={deletingId === thread.thread_id ? "danger" : "icon"}
                                size="sm"
                                onClick={(e) => handleDelete(e, thread.thread_id)}
                                icon={<Trash2 size={14} />}
                                className={`
                                    opacity-0 group-hover:opacity-100 transition-opacity
                                    ${deletingId === thread.thread_id ? 'opacity-100' : ''}
                                `}
                                title={deletingId === thread.thread_id ? "Click again to confirm" : "Delete chat"}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}