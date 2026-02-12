import FeatureCard from "@/components/ui/FeatureCard";
import Icon, { ICON_PATHS } from "@/components/ui/Icon";

const features = [
  {
    icon: <Icon path={ICON_PATHS.upload} />,
    title: "Knowledge Base",
    description:
      "Upload FAQs, product docs, and policies. Your data stays secure.",
    color: "blue" as const,
  },
  {
    icon: <Icon path={ICON_PATHS.lightbulb} />,
    title: "Instant Answers",
    description:
      "RAG technology retrieves accurate responses in milliseconds.",
    color: "purple" as const,
  },
  {
    icon: <Icon path={ICON_PATHS.chat} />,
    title: "24/7 Support",
    description: "Always available to help customers with their inquiries.",
    color: "green" as const,
  },
  {
    icon: <Icon path={ICON_PATHS.users} />,
    title: "Human in the Loop",
    description: "Complex queries escalate to human agents for expert assistance.",
    color: "orange" as const,
  },
];

export default function FeatureSection() {
  return (
    <div className="border-t border-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
}
