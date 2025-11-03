import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { StatsTicker } from '@/components/landing/stats-ticker';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsTicker />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </>
  );
}
