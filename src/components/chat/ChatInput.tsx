import Button from "@/components/ui/Button";

interface ChatInputProps {
  readonly input: string;
  readonly isLoading: boolean;
  readonly onInputChange: (value: string) => void;
  readonly onSubmit: (e: React.SubmitEvent) => void;
  readonly onNewChat: () => void;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onNewChat,
}: ChatInputProps) {
  return (
    <div className="border-t border-gray-800 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={onSubmit} className="flex items-center space-x-4">
          <Button
            type="button"
            onClick={onNewChat}
            variant="ghost"
            className="p-3 rounded-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
