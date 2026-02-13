import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";

export default function Home() {
  return (
    <div className="h-full bg-gray-950 flex flex-col overflow-y-auto">
      <Hero />
      <FeatureSection />
    </div>
  );
}
