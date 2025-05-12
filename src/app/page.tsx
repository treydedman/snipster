import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snipster - Code Snippet Manager",
  description: "Save, organize, and share code snippets with ease.",
  robots: "index, follow",
  openGraph: {
    title: "Snipster - Code Snippet Manager",
    description: "Save, organize, and share code snippets with ease.",
    url: "https://snipster.example.com",
    type: "website",
    images: [{ url: "https://snipster.example.com/snipster-logo.webp" }],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="py-20 md:py-24 flex items-center justify-center bg-background">
        <div className="max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
          <Image
            src="/snipster-logo.webp"
            alt="Snipster Logo"
            width={300}
            height={75}
            className="h-[75px] w-[300px] md:h-[100px] md:w-[400px] mb-6 mx-auto"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Save, Organize, and Share Code Snippets
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            A fast, intuitive code snippet manager built for developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent bg-accent/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600"
            >
              <Link href="/guest-sign-in">Try It Out</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16 bg-mutedCyan dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Why Snipster?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-zinc-800 border border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Save Snippets Fast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Store your code snippets securely with a single click.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground border-[1px] !border-cyan hover:shadow-md hover:shadow-cyan/50 transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Organize with Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use tags and languages to keep your snippets organized.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground border-[1px] !border-cyan hover:shadow-md hover:shadow-cyan/50 transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Try as Guest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore Snipster with a demo account, no sign-up needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <footer className="py-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            © {new Date().getFullYear()} Snipster. All rights reserved.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/auth/sign-up"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/guest-sign-in"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Try It Out
            </Link>
            <Link
              href="https://github.com/yourusername"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
