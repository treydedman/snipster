"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          throw new Error("Failed to retrieve session");
        }

        if (sessionData.session) {
          const user = sessionData.session.user;

          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("username")
            .eq("id", user.id)
            .single();

          if (profileError || !profile) {
            throw new Error(
              "User profile not found. Please try signing up again."
            );
          }

          toast.success(`Signed in successfully as ${profile.username}!`);
          router.push("/dashboard");
        } else {
          throw new Error("No session found");
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in";
        toast.error(message);
        router.push("/auth/sign-in");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground">Loading...</p>
    </div>
  );
}
