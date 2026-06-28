"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Settings2, Bell, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import AccountSettings from "./AccountSettings";
import PreferencesSettings from "./PreferencesSettings";
import NotificationsSettings from "./NotificationsSettings";
import PrivacySettings from "./PrivacySettings";

const sidebarItems = [
  {
    title: "Account",
    url: "#",
    icon: UserRound,
    content: <AccountSettings />,
  },
  {
    title: "Preferences",
    url: "#",
    icon: Settings2,
    content: <PreferencesSettings />,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
    content: <NotificationsSettings />,
  },
  {
    title: "Privacy",
    url: "#",
    icon: Lock,
    content: <PrivacySettings />,
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
      <Tabs value={activeTab}>
        <TabsList>
          {sidebarItems.map((item) => (
            <TabsTrigger
              key={item.title}
              value={item.title}
              onClick={() => setActiveTab(item.title)}
            >
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="p-4">{renderContent()}</div>

        {/* <TabsContent value="account">
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
        <TabsContent value="notifications">Notifications</TabsContent> */}
      </Tabs>
    </div>
  );
};

export default Settings;
