import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: "blue" | "purple" | "green" | "orange";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
};

export default function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="text-center p-6">
      <div className={`w-14 h-14 mx-auto ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
        <div className={`w-7 h-7 ${colors.text}`}>{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
