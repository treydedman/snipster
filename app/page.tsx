import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "Snipster - Code Snippet Manager",
  description:
    "Save, manage, and share your code snippets with ease. Built for developers, by developers.",
  robots: "index, follow",
  openGraph: {
    title: "Snipster - Code Snippet Manager",
    description:
      "Save, manage, and share your code snippets with ease. Built for developers, by developers.",
    url: "https://snipster.example.com",
    type: "website",
    images: [{ url: "https://snipster.example.com/snipster-logo2.png" }],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Hero Section */}
      <section className="py-20 md:py-24 flex items-center justify-center bg-gradient-to-b from-background to-card/50">
        <div className="max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
          <Image
            src="/snipster-logo2.png"
            alt="Snipster Logo"
            width={371}
            height={105}
            className="h-[75px] w-[265px] md:h-[105px] md:w-[371px] mb-6 mx-auto shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Code Snippets, Simplified
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            Save, manage, and share your code snippets with ease. Built for
            developers, by developers. Try as a guest and explore the dashboard
            with limited features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-500 text-foreground focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 px-6 py-3 text-lg mt-6 md:mt-8"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              className="border-1 border-zinc-700 text-foreground bg-zinc-800 hover:border-1 hover:border-indigo-600 hover:bg-indigo-600 focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 px-6 py-3 text-lg mt-4 md:mt-8"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              className="border-1 border-zinc-700 text-foreground bg-zinc-800 hover:border-1 hover:border-indigo-600 hover:bg-indigo-600 focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 px-6 py-3 text-lg mt-4 md:mt-8"
            >
              <Link href="/guest-sign-in">Try as Guest</Link>
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
              <h3 className="text-xl font-semibold mb-4">Organize Snippets</h3>
              <p className="text-muted-foreground">
                Store and organize your code snippets securely with tags and
                categories for easy access.
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
            <Link
              href="/guest-sign-in"
              className="text-indigo-400 hover:underline hover:font-bold"
            >
              Try as Guest
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
