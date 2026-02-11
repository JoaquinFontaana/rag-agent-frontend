import { LANGGRAPH_API_URL } from "@/consts";
import { ActiveThread, MyUIMessage } from "@/types/types";
import { LangSmithDeploymentTransport } from "@ai-sdk/langchain";
import { useChat } from "@ai-sdk/react";
import { useMemo, useState, SubmitEvent } from "react";
import { chatService } from "@/services/chatService";
import Message from "./Message";

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
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <Message key={message.id} message={message} />   
                ))}
                
                {error && (
                    <div className="text-red-500 text-sm">Error: {error.message}</div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                <input
                    className="flex-1 border p-2 rounded"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={status !== 'ready' && status !== 'error'}
                    placeholder="Say something..."
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
                    disabled={status !== 'ready' && status !== 'error'}
                >
                    {status === 'streaming' ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}   