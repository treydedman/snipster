"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate if email or username is provided
    if (!identifier || !password) {
      setError("Both fields are required.");
      return;
    }

    setError("");

    // Check if the identifier is a username or email
    let email = identifier;
    if (!email.includes("@")) {
      // It’s a username, fetch associated email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (userError || !userData) {
        setError("Username not found.");
        return;
      }
      email = userData.email;
    }

    // Sign in with Supabase
    const { user, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      console.log("User signed in:", user);
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
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign In</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            onClick={handleGitHubSignIn}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 mb-6 rounded font-semibold"
          >
            Sign In with GitHub
          </button>
          <div className="flex items-center gap-x-4 mb-6">
            <hr className="flex-1 border-t border-neutral-700" />
            <span className="text-sm text-neutral-200">or</span>
            <hr className="flex-1 border-t border-neutral-700" />
          </div>
          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition text-white py-3 rounded font-semibold"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-indigo-400 hover:underline hover:font-bold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
