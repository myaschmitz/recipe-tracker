"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path is an auth page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // For auth pages, always show without navbar regardless of loading state
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For the homepage, never show navbar regardless of auth state
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  // For all other pages, always show navbar (these are app pages)
  return (
    <SidebarProvider>
      <Navbar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
