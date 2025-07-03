"use client";

import {
  Calendar,
  CookingPot,
  Home,
  Inbox,
  Search,
  Settings,
  CircleUser,
  Moon,
  Sun,
  SquareLibrary,
  UserCog
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
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("");
  const path = usePathname();

  const items = useMemo(
    () => [
      {
        title: "Dashboard",
        href: "/",
        icon: Home,
      },
    ],
    []
  );

  const recipeItems = useMemo(
    () => [
      {
        title: "View All",
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
        title: "View All",
        href: "/collections",
        icon: SquareLibrary,
      },
    ],
    []
  );

  const footerItems = useMemo(
    () => [
      {
        title: "Admin",
        href: "/admin",
        icon: UserCog,
      },
      {
        title: "Sign In",
        href: "/auth/login",
        icon: CircleUser,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
    []
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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <CookingPot />
          <span className="font-bold text-xl">recipehub</span>
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
      </SidebarFooter>
    </Sidebar>
  );
}
