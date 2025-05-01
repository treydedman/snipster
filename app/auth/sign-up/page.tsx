"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [pulse, setPulse] = useState(false);

  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  const router = useRouter();

  // Ensure useRouter is only used on the client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!usernamePattern.test(username)) {
      setError(
        "Username must be between 3 and 20 characters and can only contain letters, numbers, and underscores."
      );
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    // Validate password match
    if (password !== confirm) {
      setError("Passwords do not match.");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    setError("");

    // Check if username already exists
    const { data: existing, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      setError("Error checking username. Please try again.");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    if (existing) {
      setError("Username is already taken.");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    // Create user with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    const user = data.user;

    // Insert username into the profiles table
    const { error: dbError } = await supabase.from("profiles").upsert({
      user_id: user?.id,
      username,
    });

    if (dbError) {
      setError("Error creating user profile. Please try again.");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
      return;
    }

    console.log("User signed up:", user);

    // Only navigate client-side
    if (isClient) {
      router.push("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 dark">
      <div className="w-full max-w-md bg-card backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign Up</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-destructive text-center animate-slide-in">
              {error}
            </p>
          )}

          <Input
            className={`w-full bg-input border-border focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 ${
              pulse ? "animate-pulse-border" : ""
            }`}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className={`w-full bg-input border-border focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 ${
              pulse ? "animate-pulse-border" : ""
            }`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <Input
            className={`w-full bg-input border-border focus:ring-indigo-500 focus:shadow-glow transition-all duration-200 ${
              pulse ? "animate-pulse-border" : ""
            }`}
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition text-foreground"
          >
            Create Account
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-indigo-400 hover:underline hover:font-bold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
