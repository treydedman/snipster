"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!usernamePattern.test(username)) {
      setError(
        "Username must be between 3 and 20 characters and can only contain letters, numbers, and underscores."
      );
      return;
    }

    // Validate password match
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    // Create user with Supabase Auth
    const { user, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      // Insert username into the user table
      await supabase.from("profiles").upsert({
        user_id: user?.id,
        username,
      });

      console.log("User signed up:", user);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign Up</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="w-full p-3 bg-black/30 rounded border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition text-white py-3 rounded font-semibold"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-indigo-400 hover:underline hover:font-bold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
