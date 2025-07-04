"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Check if current path is an auth page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // For auth pages, always show without navbar regardless of loading state
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For the homepage, wait for auth to load before deciding layout
  if (pathname === '/') {
    if (loading) {
      // While loading, don't show navbar to prevent flash
      return <>{children}</>;
    }
    
    // Once loaded, show navbar only if user is authenticated
    if (user) {
      return (
        <SidebarProvider>
          <Navbar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      );
    } else {
      // Landing page - no navbar
      return <>{children}</>;
    }
  }
  
  // For all other pages, always show navbar (these are app pages)
  return (
    <SidebarProvider>
      <Navbar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
