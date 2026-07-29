import type { Metadata } from "next";
import { AppPromo } from "@/components/landing/app-promo";
import { BenefitsGrid } from "@/components/landing/how-it-works";
import { FeatureTabs } from "@/components/landing/feature-tabs";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { Integrations } from "@/components/landing/integrations";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Pricing } from "@/components/landing/pricing";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { Testimonials } from "@/components/landing/testimonials";

export const metadata: Metadata = {
  title: "Prism — AI Image, Video & Prompt Generation",
  description:
    "Generate images, videos, and prompts with Prism. Creative search today, AI chatbot co-pilot coming soon.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <LandingHero />
      <LogoMarquee />
      <FeatureTabs />
      <BenefitsGrid />
      <ProductShowcase />
      <Integrations />
      <FinalCta />
      <Pricing />
      <Testimonials />
      <AppPromo />
      <LandingFooter />
    </div>
  );
}
