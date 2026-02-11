export default function ThinkingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500">Thinking...</span>
                </div>
            </div>
        </div>
    );
}
