export default function EmptyChat() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-400 max-w-md mx-auto">
        I&apos;m your AI customer service assistant. Ask me about products, policies, orders, or any questions you have!
      </p>
    </div>
  );
}
