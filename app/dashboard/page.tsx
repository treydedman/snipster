import { createServerClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import { User } from "@/lib/types";
import { Navbar } from "./components/Navbar";

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
  if (!user) redirect("/sign-in");

  await supabase.from("users").upsert({
    id: user.id,
    email: user.email!,
    username: user.user_metadata.login || user.email!.split("@")[0],
    github_username: user.user_metadata.login,
    avatar_url: user.user_metadata.avatar_url,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user as User} />
      <main className="max-w-7xl mx-auto p-4">
        {/* Placeholder for SnippetGrid, SearchBar, etc. */}
        Dashboard Content
      </main>
    </div>
  );
}
