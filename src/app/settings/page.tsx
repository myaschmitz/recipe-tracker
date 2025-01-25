"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { UserRound, Settings2, Bell, Lock } from "lucide-react";
import { useState, useEffect } from "react";

const sidebarItems = [
  {
    title: "Account",
    url: "#",
    icon: UserRound,
    content: "Test1",
  },
  {
    title: "Preferences",
    url: "#",
    icon: Settings2,
    content: "Test2",
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
    content: "Test3",
  },
  {
    title: "Privacy",
    url: "#",
    icon: Lock,
    content: "Test4",
  },
];

const Settings = () => {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeTab") || sidebarItems[0].title;
    }
    return sidebarItems[0].title;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  });

  if (!isClient) {
    return null; // render nothing on the server
  }

  const renderContent = () => {
    const activeItem = sidebarItems.find((item) => item.title === activeTab);
    return activeItem ? activeItem.content : null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <SidebarProvider className="max-w-fit">
        {/* <Sidebar> */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        // href={item.url}
                        onClick={() => setActiveTab(item.title)}
                      >
                        <item.icon />
                        <span
                          className={`${
                            activeTab === item.title ? "font-bold" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Separator className="py-4 h-full" orientation="vertical" />
        <div className="p-4">{renderContent()}</div>
        {/* </Sidebar> */}
      </SidebarProvider>
      {/* <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div>
            <h1>Name</h1>
            <h1>Username</h1>
            <h1>Email</h1>
            <h1>Change password</h1>
          </div>
          <Separator className="my-4" />
          <div>
            <h1 className="text-lg font-bold">Danger Zone</h1>
            <Button variant="destructive">Delete account</Button>
          </div>
        </TabsContent>
        <TabsContent value="preferences">
          <div>
            <h1>Default measurements units</h1>
          </div>
        </TabsContent>
        <TabsContent value="notifications">Notifications</TabsContent>
      </Tabs> */}
    </div>
  );
};

export default Settings;
