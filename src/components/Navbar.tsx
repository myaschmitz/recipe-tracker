"use client";

import {
  Calendar,
  CookingPot,
  Home,
  Inbox,
  Settings,
  CircleUser,
  Moon,
  Sun,
  SquareLibrary,
  UserCog,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const path = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const items = useMemo(
    () => [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
    []
  );

  const recipeItems = useMemo(
    () => [
      {
        title: "View All Recipes",
        href: "/recipes",
        icon: Inbox,
      },
      {
        title: "Create Recipe",
        href: "/recipes/create",
        icon: Calendar,
      }
    ],
    []
  );

  const collectionItems = useMemo(
    () => [
      {
        title: "View All Collections",
        href: "/collections",
        icon: SquareLibrary,
      },
    ],
    []
  );

  const footerItems = useMemo(
    () => {
      const items = [];
      
      // Only show admin link for admin users
      if (profile?.role === 'admin') {
        items.push({
          title: "Admin",
          href: "/admin",
          icon: UserCog,
        });
      }
      
      items.push({
        title: user ? "Profile" : "Sign In",
        href: user ? "/profile" : "/auth?mode=login",
        icon: CircleUser,
      });
      
      items.push({
        title: "Settings",
        href: "/settings",
        icon: Settings,
      });
      
      // Add sign out button for authenticated users
      if (user) {
        items.push({
          title: "Sign Out",
          href: "#",
          icon: LogOut,
          onClick: handleSignOut,
        });
      }
      
      return items;
    },
    [user, profile, handleSignOut]
  );

  useEffect(() => {
    const allItems = [...items, ...recipeItems, ...collectionItems, ...footerItems];
    const activeItem = allItems.find((item) => item.href === path);
    if (activeItem) {
      setActiveTab(activeItem.title);
    }
  }, [items, recipeItems, collectionItems, footerItems, path]);

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row gap-2 ml-4 mt-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <CookingPot className="opacity-60" />
          <span className="font-bold text-xl text-foreground/60">recipehub</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={`flex hover:font-bold items-center gap-2 ${
                        activeTab === item.title ? "font-bold" : ""
                      }`}
                      onClick={() => setActiveTab(item.title)}
                      href={item.href}
                      passHref
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recipes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recipeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={`flex hover:font-bold items-center gap-2 ${
                        activeTab === item.title ? "font-bold" : ""
                      }`}
                      onClick={() => setActiveTab(item.title)}
                      href={item.href}
                      passHref
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collectionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={`flex hover:font-bold items-center gap-2 ${
                        activeTab === item.title ? "font-bold" : ""
                      }`}
                      onClick={() => setActiveTab(item.title)}
                      href={item.href}
                      passHref
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle>
              <SidebarMenuButton>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </SidebarMenuButton>
            </ThemeToggle>
          </SidebarMenuItem>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton
                  className={`flex hover:font-bold items-center gap-2 ${
                    activeTab === item.title ? "font-bold" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(item.title);
                    item.onClick?.();
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <Link
                    className={`flex hover:font-bold items-center gap-2 ${
                      activeTab === item.title ? "font-bold" : ""
                    }`}
                    onClick={() => setActiveTab(item.title)}
                    href={item.href}
                    passHref
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
