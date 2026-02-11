import { LANGGRAPH_API_URL } from "@/consts";
import { ActiveThread, MyUIMessage } from "@/types/types";
import { LangSmithDeploymentTransport } from "@ai-sdk/langchain";
import { useChat } from "@ai-sdk/react";
import { useMemo, useState, SubmitEvent } from "react";
import { chatService } from "@/services/chatService";
import Message from "./Message";
import { Send, Loader2 } from "lucide-react";

interface ConversationProps {
    readonly threadData:ActiveThread
    readonly userId:number

}
export default function Conversation({threadData,userId}:ConversationProps){
    const {id,newConversation:isInitiallyNew ,messages: initialMessages} = threadData

    const [input, setInput] = useState<string>('');
    const [isNew, setIsNew] = useState(isInitiallyNew);

    const transport = useMemo(() => new LangSmithDeploymentTransport({
        url: LANGGRAPH_API_URL, 
        graphId: "agent", 
    }), []);

    const {messages, error, clearError, sendMessage, status } = useChat<MyUIMessage>({
        transport,
        id: id, 
        messages:initialMessages,
    });

     const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            if (isNew) {
                const generatedTitle = chatService.generateTitle(input); 
                chatService.updateThreadTitle(id, generatedTitle).catch(console.error);
                setIsNew(false);
            }
            clearError()
            sendMessage({ 
                text: input, 
                metadata:{
                    userId:userId.toString()
                }
            });
            setInput('');
        }
    } 

    return (
        <div className="flex flex-col h-full flex-1 bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Chat Assistant</h2>
                <p className="text-sm text-gray-400 mt-1">Powered by RAG Technology</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                        <p className="text-gray-400 max-w-md">Ask me anything about your documents. I&apos;m here to help!</p>
                    </div>
                ) : (
                    messages.map(message => (
                        <Message key={message.id} message={message} />   
                    ))
                )}
                
                {status === 'streaming' && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">
                        <strong>Error:</strong> {error.message}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={status !== 'ready' && status !== 'error'}
                        placeholder="Type your message here..."
                    />
                    <button 
                        type="submit" 
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 disabled:shadow-none"
                        disabled={status !== 'ready' && status !== 'error' || !input.trim()}
                    >
                        {status === 'streaming' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}   