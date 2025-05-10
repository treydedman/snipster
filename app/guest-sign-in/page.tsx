"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCode } from "@fortawesome/free-solid-svg-icons";

export default function GuestSignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signInAsGuest = async () => {
    setLoading(true);
    setError(null);
    console.log("Client cookies before sign-in:", document.cookie);
    try {
      const response = await fetch("/api/auth/guest-sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("API response status:", response.status, response.statusText);
      const data = await response.json();
      if (!response.ok) {
        console.error("Guest sign-in error:", data.error);
        setError(data.error || "Failed to sign in");
        setLoading(false);
        return;
      }
      console.log("Sign-in response:", data);
      console.log("Client cookies after sign-in:", document.cookie);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
      router.push("/dashboard");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error during sign-in");
      setLoading(false);
    }
  };

  useEffect(() => {
    signInAsGuest();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="flex items-center justify-center mb-6">
            <FontAwesomeIcon
              icon={faCode}
              className="h-8 w-8 text-primary mr-2"
            />
            <h1 className="text-3xl font-bold text-white">Snipster</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Guest Sign-In Failed
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={signInAsGuest}
            disabled={loading}
            className="dashboard-button border-white/20 text-white hover:bg-white/10"
          >
            {loading ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
          <Button
            variant="link"
            onClick={() => router.push("/")}
            className="mt-4 text-white hover:text-primary"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex items-center justify-center mb-6">
          <FontAwesomeIcon
            icon={faCode}
            className="h-8 w-8 text-primary mr-2"
          />
          <h1 className="text-3xl font-bold text-white">Snipster</h1>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Signing in as Guest
        </h2>
        <Button className="dashboard-button bg-indigo-600 text-white">
          <FontAwesomeIcon
            icon={faSpinner}
            className="mr-2 h-4 w-4 animate-spin"
          />
          Please wait...
        </Button>
      </div>
    </div>
  );
}
