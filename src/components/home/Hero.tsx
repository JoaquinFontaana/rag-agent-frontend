import LinkButton from "@/components/ui/LinkButton";
import Icon, { ICON_PATHS } from "@/components/ui/Icon";

export default function Hero() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8">
          <Icon path={ICON_PATHS.message} className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
          AI Customer Service Assistant
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
          Experience intelligent customer support powered by RAG technology. Get
          instant, accurate answers from your company&apos;s knowledge base.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <LinkButton href="/chat">Start Chatting</LinkButton>
          <LinkButton href="/login" variant="secondary">
            Sign In
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
