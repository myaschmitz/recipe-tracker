"use client";

import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  // Always show the landing page - it will handle auth state internally
  return <LandingPage />;
}
