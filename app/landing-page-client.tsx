"use client";

import {
  organizationStructuredData,
  softwareStructuredData,
} from "@/components/landing/landing-data";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { AccuracyProof } from "@/components/landing/accuracy-proof";
import { KnowledgeEngine } from "@/components/landing/knowledge-engine";
import { Differentiation } from "@/components/landing/differentiation";
import { Testimonials } from "@/components/landing/testimonials";
import { ResourceCenter } from "@/components/landing/resource-center";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark text-light overflow-x-hidden">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareStructuredData),
        }}
      />
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Stats />
      <AccuracyProof />
      <KnowledgeEngine />
      <Differentiation />
      <Testimonials />
      <ResourceCenter />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
