"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error in auth callback:", error);
        router.push("/auth/sign-in");
      } else if (data.session) {
        const user = data.session.user;

        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile && !profileError) {
          const username =
            user.user_metadata.preferred_username || `user_${user.id}`; // Fallback username
          const githubUsername = user.user_metadata.preferred_username || null;
          const avatarUrl = user.user_metadata.avatar_url || null;

          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            username,
            github_username: githubUsername,
            avatar_url: avatarUrl,
          });

          if (!insertError) {
            // Create default folder
            await supabase
              .from("folders")
              .insert({ owner: user.id, name: "Inbox" });
          }
        }

        router.push("/dashboard");
      } else {
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
