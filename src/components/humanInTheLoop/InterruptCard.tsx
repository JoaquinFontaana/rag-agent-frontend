import { Thread } from "@/types/types";
import { Clock, User, MessageSquare, CheckCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

interface InterruptCardProps {
    readonly thread: Thread;
    readonly onRespond: (threadId: string, response: string, resolve: boolean) => Promise<void>;
}

export default function InterruptCard({ thread, onRespond }: InterruptCardProps) {
    const [response, setResponse] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRespond = async (resolve: boolean) => {
        if (!response.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            await onRespond(thread.thread_id, response.trim(), resolve);
        } finally {
            setIsProcessing(false);
        }
    };

    // Extract interrupt info from thread values
    const messages = (thread.values as any)?.messages || [];

    // Format timestamp
    const timestamp = thread.updated_at
        ? new Date(thread.updated_at).toLocaleString()
        : 'Unknown';

    return (
        <div className="bg-gray-900 border border-yellow-700/50 rounded-lg p-6 shadow-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <MessageSquare className="text-yellow-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">User Needs Help</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock size={14} />
                            <span>{timestamp}</span>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                    WAITING
                </div>
            </div>

            {/* User Info */}
            {thread.metadata?.userId && (
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                    <User size={14} />
                    <span>User ID: {thread.metadata.userId}</span>
                </div>
            )}

            {/* Thread Title */}
            {thread.metadata?.title && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Conversation</p>
                    <p className="text-gray-300">{thread.metadata.title}</p>
                </div>
            )}

            {/* Conversation History */}
            {messages.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Conversation History</p>
                    <div className="bg-gray-800/50 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3">
                        {messages.map((msg: any, idx: number) => (
                            <div key={idx} className={`flex ${msg.type === 'human' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-2 ${msg.type === 'human'
                                    ? 'bg-blue-600/20 text-blue-100'
                                    : 'bg-gray-700/50 text-gray-200'
                                    }`}>
                                    <p className="text-xs text-gray-400 mb-1">
                                        {msg.type === 'human' ? 'User' : 'Assistant'}
                                    </p>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Response Input */}
            <div className="mt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Your Response</p>
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response to the user..."
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={isProcessing}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-3">
                    <Button
                        type="button"
                        variant="success"
                        size="md"
                        onClick={() => handleRespond(true)}
                        disabled={!response.trim() || isProcessing}
                        icon={<CheckCircle size={18} />}
                        className="flex-1"
                    >
                        {isProcessing ? 'Sending...' : 'Resolve'}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => handleRespond(false)}
                        disabled={!response.trim() || isProcessing}
                        icon={<MessageCircle size={18} />}
                        className="flex-1"
                    >
                        {isProcessing ? 'Sending...' : 'Continue Chat'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
