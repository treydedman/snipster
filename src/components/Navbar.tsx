"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut } from "lucide-react";

type User = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

type NavbarProps = {
  user: User | null;
  onLogout: () => void;
};

export default function Navbar({ user, onLogout }: NavbarProps) {
  const { setTheme, resolvedTheme } = useTheme();

  const handleLogoutWithConfirm = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  };

  // Fallback avatar (initials)
  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <nav className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/snipster-logo.webp"
            alt="Snipster Logo"
            width={200}
            height={50}
            className="h-10 w-auto"
          />
        </Link>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Avatar/Initials */}
          {user && (
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.username}'s avatar`}
                  className="w-8 h-8 rounded-full object-cover avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-white text-sm avatar avatar-initials">
                  {getInitials(user.username)}
                </div>
              )}
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            size="icon"
            className="border-zinc-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
            onClick={handleLogoutWithConfirm}
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>

          {/* Theme Toggle (Far Right) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-800 text-white dark:bg-zinc-800 dark:text-white"
            >
              <DropdownMenuItem
                className="hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white focus:bg-blue-600 focus:text-white dark:focus:bg-blue-600 dark:focus:text-white"
                onClick={() => setTheme("light")}
              >
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white focus:bg-blue-600 focus:text-white dark:focus:bg-blue-600 dark:focus:text-white"
                onClick={() => setTheme("dark")}
              >
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white focus:bg-blue-600 focus:text-white dark:focus:bg-blue-600 dark:focus:text-white"
                onClick={() => setTheme("system")}
              >
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
