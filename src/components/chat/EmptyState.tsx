import { Send } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center min-h-[60vh]">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h3>
            <p className="text-gray-400 max-w-md">Ask me anything about your documents. I&apos;m here to help!</p>
        </div>
    );
}
