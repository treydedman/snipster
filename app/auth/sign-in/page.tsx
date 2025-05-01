"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [pulse, setPulse] = useState(false);

  const router = useRouter();

  // Ensure useRouter is only used on the client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate if email or username is provided
    if (!identifier || !password) {
      setError("Both fields are required.");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600); // Reset after two pulses (1.6s)
      return;
    }

    setError("");

    // Check if the identifier is a username or email
    let email = identifier;
    if (!email.includes("@")) {
      // If a username, fetch associated email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (userError || !userData) {
        setError("Username not found.");
        setPulse(true);
        setTimeout(() => setPulse(false), 1600);
        return;
      }
      email = userData.email;
    }

    // Sign in with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
    } else {
      console.log("User signed in:", data.user);

      // Only navigate client-side
      if (isClient) {
        router.push("/dashboard");
      }
    }
  };

  const handleGitHubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 dark">
      <div className="w-full max-w-md bg-card backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-8 text-center">Sign In</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-destructive text-center animate-slide-in">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={handleGitHubSignIn}
            className="w-full bg-zinc-700 hover:bg-zinc-600 cursor-pointer text-foreground my-8 flex items-center justify-center gap-2"
          >
            <FaGithub className="w-5 h-5" />
            GitHub
          </Button>
          <div className="flex items-center gap-x-4 mb-8">
            <hr className="flex-1 border-t border-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <hr className="flex-1 border-t border-border" />
          </div>
          <Input
            className={`w-full bg-input border-border focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 ${
              pulse ? "animate-pulse-border" : ""
            }`}
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Input
            className={`w-full bg-input border-border focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 ${
              pulse ? "animate-pulse-border" : ""
            }`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition text-foreground"
          >
            Sign In
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-indigo-400 hover:underline hover:font-bold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
