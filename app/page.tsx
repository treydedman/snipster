"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Hero Section */}
      <section className="py-20 md:py-32 flex items-center justify-center bg-gradient-to-b from-background to-card/50">
        <div className="max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
          <img
            src="/snipster.png"
            alt="Snipster Logo"
            className="h-12 w-[169px] md:h-16 md:w-[226px] mb-6 mx-auto shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Code Snippets, Simplified
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Save, manage, and share your code snippets with ease. Built for
            developers, by developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-12 justify-center">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-500 text-foreground focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 px-6 py-3 text-lg mt-8"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-indigo-500/20 focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 px-6 py-3 text-lg mt-8"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Why Choose Snipster?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border shadow-lg">
              <h3 className="text-xl font-semibold mb-4">GitHub Integration</h3>
              <p className="text-muted-foreground">
                Sign in with GitHub for a seamless developer experience.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Save Snippets</h3>
              <p className="text-muted-foreground">
                Store your code snippets securely with tags and categories for
                easy access.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Share Easily</h3>
              <p className="text-muted-foreground">
                Generate shareable links to collaborate with teams or showcase
                your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            © {new Date().getFullYear()} Snipster. All rights reserved.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/auth/sign-up"
              className="text-indigo-400 hover:underline hover:font-bold"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-indigo-400 hover:underline hover:font-bold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
