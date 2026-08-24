import { BookingConflictDemo } from "@/components/landing/booking-conflict-demo";
import { CapabilityStrip } from "@/components/landing/capability-strip";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { FinalCTA } from "@/components/landing/final-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { RolesSection } from "@/components/landing/roles-section";
import { SecuritySection } from "@/components/landing/security-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CoWork - Workspace Management Without the Scheduling Chaos",
  description: "Manage rooms, desks, members and bookings from one secure workspace built for modern coworking teams. Conflict-safe booking and role-based access control.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <LandingNavbar />
      <HeroSection />
      <CapabilityStrip />
      <FeatureShowcase />
      <BookingConflictDemo />
      <RolesSection />
      <HowItWorksSection />
      <SecuritySection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
