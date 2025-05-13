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
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    console.log("Resolved theme:", resolvedTheme);
  }, [resolvedTheme]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-blue-600 hover:underline hover:font-bold  dark:text-blue-600 dark:hover:font-bold "
          >
            Home
          </Link>
          <span className="text-zinc-500 cursor-not-allowed">Dashboard</span>
          <span className="text-zinc-500 cursor-not-allowed">Profile</span>

          {/* Theme Toggle */}
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
