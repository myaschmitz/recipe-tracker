"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardPage from "@/components/DashboardPage";
import LandingPage from "@/components/LandingPage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <LandingPage />;
  }
  
  return <DashboardPage />;
}
