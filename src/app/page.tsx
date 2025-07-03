"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardPage from "@/components/DashboardPage";
import LandingPage from "@/components/LandingPage";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!user) {
    return <LandingPage />;
  }
  
  return <DashboardPage />;
}
