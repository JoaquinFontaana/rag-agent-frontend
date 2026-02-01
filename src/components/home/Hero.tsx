import LinkButton from "@/components/ui/LinkButton";
import Icon, { ICON_PATHS } from "@/components/ui/Icon";

export default function Hero() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8">
          <Icon path={ICON_PATHS.message} className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-5xl font-bold text-white mb-6">
          AI Customer Service Assistant
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Experience intelligent customer support powered by RAG technology. Get
          instant, accurate answers from your company&apos;s knowledge base.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <LinkButton href="/chat">Start Chatting</LinkButton>
          <LinkButton href="/login" variant="secondary">
            Sign In
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
