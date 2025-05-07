import { createServerClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import { User, Snippet } from "@/lib/types";
import { Navbar } from "./components/Navbar";
import { Button } from "@/components/ui/button";

export const metadata = {
  robots: "noindex, nofollow",
  title: "Snipster Dashboard",
  description: "Manage your code snippets",
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("Dashboard user:", user);
  if (!user) redirect("/auth/sign-in");

  await supabase.from("users").upsert({
    id: user.id,
    email: user.email!,
    username: user.user_metadata.login || user.email!.split("@")[0],
    github_username: user.user_metadata.login,
    avatar_url: user.user_metadata.avatar_url,
  });

  const isGuest = user.email === "guest@example.com";
  const snippetsQuery = isGuest
    ? supabase
        .from("snippets")
        .select("*, shares(share_token)")
        .eq(
          "owner",
          (
            await supabase
              .from("users")
              .select("id")
              .eq("email", "demo@example.com")
              .single()
          ).data!.id
        )
    : supabase
        .from("snippets")
        .select("*, shares(share_token)")
        .eq("owner", user.id);
  const { data: snippets } = await snippetsQuery;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user as User} />
      <main className="max-w-7xl mx-auto p-4">
        {!isGuest && (
          <div className="mb-4">
            <Button variant="default">Create Snippet</Button>
          </div>
        )}
        <div>
          {snippets?.map((snippet: Snippet) => (
            <div key={snippet.id} className="p-4 border rounded">
              <h3>{snippet.title}</h3>
              <p>{snippet.language}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
