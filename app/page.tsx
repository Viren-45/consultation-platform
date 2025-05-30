import HeroSection from "@/components/sections/hero-section";
import EasyStartSection from "@/components/sections/easy-start-section";
import ForClientsSection from "@/components/sections/for-clients-section";
import ExpertsByCategorySection from "@/components/sections/experts-by-category-section";
import ForExpertsSection from "@/components/sections/for-experts-section";
import ExpertOpportunitiesSection from "@/components/sections/expert-opportunities-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <EasyStartSection />
      <ForClientsSection />
      <ExpertsByCategorySection />
      <ForExpertsSection />
      <ExpertOpportunitiesSection />
    </div>
  );
}
