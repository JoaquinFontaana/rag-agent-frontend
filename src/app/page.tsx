import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Hero />
      <FeatureSection />
    </div>
  );
}
