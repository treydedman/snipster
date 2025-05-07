"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function GuestSignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signInAsGuest = async () => {
    setLoading(true);
    setError(null);
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Env vars:",
      process.env.NEXT_PUBLIC_GUEST_EMAIL,
      process.env.NEXT_PUBLIC_GUEST_PASSWORD
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
      password: process.env.NEXT_PUBLIC_GUEST_PASSWORD!,
    });
    if (error) {
      console.error("Guest sign-in error:", error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
    console.log("Sign-in data:", data);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Post-sign-in user:", user);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
    setLoading(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    signInAsGuest();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Guest Sign-In Failed
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={signInAsGuest}
            disabled={loading}
            className="dashboard-button"
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
            className="mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Signing in as Guest
        </h2>
        <Button variant="outline" disabled className="dashboard-button">
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
