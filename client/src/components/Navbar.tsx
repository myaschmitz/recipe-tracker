"use client";

import * as React from "react";
import Link from "next/link";
import { Moon, Sun, CookingPot } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { setTheme } = useTheme();

  return (
    <div className="top-0 sticky border-b flex justify-between w-full items-center">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent focus:outline-none outline-none hover:outline-none m-4"
      >
        <Link href="/">
          <CookingPot strokeWidth={3} />
        </Link>
      </Button>
      <NavigationMenu className="flex-1">
        <NavigationMenuList>
          <div className="flex items-center gap-2 justify-between px-4 md:px-6">
            <NavigationMenuItem>
              <Link href="/recipe/create" legacyBehavior passHref>
                <NavigationMenuLink className="hover:font-bold">
                  Create Recipe
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="focus:outline-none outline-none hover:outline-none hover:bg-transparent hover:text-sky-600 dark:hover:text-sky-600 text-black shadow-none bg-transparent dark:text-white"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="border-none hover:bg-transparent"
              >
                <button className="p-0 m-0 border-none bg-transparent outline-none hover:bg-transparent focus:outline-none">
                  <Avatar className="mr-4">
                    <AvatarImage src="https://media.timeout.com/images/106150176/1024/768/image.webp" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/settings">Settings</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
