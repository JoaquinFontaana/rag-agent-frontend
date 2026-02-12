import { Send, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import Button from "../ui/Button";

interface ChatInputProps {
    readonly input: string;
    readonly setInput: (value: string) => void;
    readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    readonly isStreaming: boolean;
    readonly onStop: () => void;
    readonly isInterrupted: boolean;
}

export default function ChatInput({ input, setInput, onSubmit, isStreaming, onStop, isInterrupted }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e as any);
        }
    };

    return (
        <div className="border-t border-gray-800 bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <form onSubmit={onSubmit}>
                    {/* Flex container with styles */}
                    <div className="flex items-center gap-3 bg-gray-900 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <textarea
                            ref={textareaRef}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none no-resize max-h-[200px] resize-none"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isStreaming || isInterrupted}
                            placeholder={isInterrupted ? "Waiting for human intervention..." : "Message AI Assistant..."}
                            rows={1}
                        />

                        {/* Stop/Send Button */}
                        {isStreaming ? (
                            <Button
                                type="button"
                                variant="danger"
                                size="md"
                                onClick={onStop}
                                icon={<Square size={18} fill="currentColor" />}
                                title="Stop generating"
                                className="flex-shrink-0"
                            />
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={!input.trim() || isStreaming || isInterrupted}
                                icon={<Send size={18} />}
                                title={isInterrupted ? "Waiting for approval" : "Send message"}
                                className="flex-shrink-0"
                            />
                        )}
                    </div>
                </form>

                <p className="text-xs text-gray-500 text-center mt-2">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    );
}
