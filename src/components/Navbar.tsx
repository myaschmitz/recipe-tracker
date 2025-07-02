// "use client";

// import * as React from "react";
// import Link from "next/link";
// import { Moon, Sun, CookingPot } from "lucide-react";
// import { useTheme } from "next-themes";

// import { cn } from "@/lib/utils";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
// } from "@/components/ui/navigation-menu";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// export function Navbar() {
//   const { setTheme } = useTheme();

//   return (
//     <div className="bg-inherit top-0 sticky border-b flex justify-between w-full items-center h-16">
//       <Button
//         variant="ghost"
//         size="icon"
//         className="hover:bg-transparent focus:outline-none outline-none hover:outline-none m-4 w-fit"
//       >
//         <Link className="flex items-center space-x-2" href="/">
//           <CookingPot className="!w-5 !h-5" size={36} strokeWidth={3} />
//           <span className="font-bold text-xl">recipehub</span>
//         </Link>
//       </Button>
//       <NavigationMenu className="flex-1">
//         <NavigationMenuList>
//           <div className="flex items-center gap-2 justify-between px-4 md:px-6">
//             <NavigationMenuItem>
//               <Link href="/recipes" legacyBehavior passHref>
//                 <NavigationMenuLink className="hover:font-bold">
//                   Recipes
//                 </NavigationMenuLink>
//               </Link>
//             </NavigationMenuItem>
//           </div>
//           <div className="flex items-center gap-2 justify-between px-4 md:px-6">
//             <NavigationMenuItem>
//               <Link href="/recipes/create" legacyBehavior passHref>
//                 <NavigationMenuLink className="hover:font-bold">
//                   Create Recipe
//                 </NavigationMenuLink>
//               </Link>
//             </NavigationMenuItem>
//           </div>

//           <div className="flex items-center space-x-4">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   size="icon"
//                   className="focus:outline-none outline-none hover:outline-none hover:bg-transparent hover:text-sky-600 dark:hover:text-sky-600 text-black shadow-none bg-transparent dark:text-white"
//                 >
//                   <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//                   <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//                   <span className="sr-only">Toggle theme</span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem onClick={() => setTheme("light")}>
//                   Light
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setTheme("dark")}>
//                   Dark
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setTheme("system")}>
//                   System
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <DropdownMenu>
//               <DropdownMenuTrigger
//                 asChild
//                 className="border-none hover:bg-transparent"
//               >
//                 <button className="p-0 m-0 border-none bg-transparent outline-none hover:bg-transparent focus:outline-none">
//                   <Avatar className="mr-4">
//                     <AvatarImage src="https://media.timeout.com/images/106150176/1024/768/image.webp" />
//                     <AvatarFallback>MS</AvatarFallback>
//                   </Avatar>
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem>Profile</DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <a href="/settings">Settings</a>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </NavigationMenuList>
//       </NavigationMenu>
//     </div>
//   );
// }

// const ListItem = React.forwardRef<
//   React.ElementRef<"a">,
//   React.ComponentPropsWithoutRef<"a">
// >(({ className, title, children, ...props }, ref) => {
//   return (
//     <li>
//       <NavigationMenuLink asChild>
//         <a
//           ref={ref}
//           className={cn(
//             "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
//             className
//           )}
//           {...props}
//         >
//           <div className="text-sm font-medium leading-none">{title}</div>
//           <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//             {children}
//           </p>
//         </a>
//       </NavigationMenuLink>
//     </li>
//   );
// });
// ListItem.displayName = "ListItem";
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
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        title: "All",
        href: "/recipes",
        icon: Inbox,
      },
      {
        title: "Collections",
        href: "/collections",
        icon: SquareLibrary,
      },
      {
        title: "Create Recipe",
        href: "/recipes/create",
        icon: Calendar,
      }
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
        title: "Profile",
        href: "",
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
    const allItems = [...items, ...recipeItems, ...footerItems];
    const activeItem = allItems.find((item) => item.href === path);
    if (activeItem) {
      setActiveTab(activeItem.title);
    }
  }, [items, recipeItems, footerItems, path]);

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row gap-2">
        {/* <SidebarMenuItem key={"Home"}> */}
        <CookingPot />
        <span className="font-bold text-xl">recipehub</span>
        {/* </SidebarMenuItem> */}
      </SidebarHeader>
      {/* <Separator className="my-2" /> */}
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {/* <Button
                    size="icon"
                    className="focus:outline-none outline-none hover:outline-none hover:bg-transparent hover:text-sky-600 dark:hover:text-sky-600 text-black shadow-none dark:text-white"
                  > */}
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                  {/* </Button> */}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-[-100%]">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {/* <Button className="focus:outline-none outline-none hover:outline-none hover:bg-inherit bg-transparent p-0 m-0 text-black shadow-none dark:text-white"> */}
                  Light
                  {/* </Button> */}
                </DropdownMenuItem>
                <DropdownMenuItem className="" onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  className=""
                  onClick={() => setTheme("system")}
                >
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
