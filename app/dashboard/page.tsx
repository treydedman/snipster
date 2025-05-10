import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(
    "sb-hpnigpphcxzmxtfvrlyz-auth-token"
  )?.value;
  console.log("Server  Auth token cookie:", authToken);
  console.log(
    "Server  All cookies:",
    (await cookieStore.getAll()).map((c) => `${c.name}=${c.value}`)
  );

  const supabase = await createServerClient();
  // Try refreshing session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.refreshSession();
  console.log("Server  Refresh session data:", sessionData);
  console.log("Server  Refresh session error:", sessionError);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log("Server  Dashboard user:", user);
  console.log("Server  Dashboard auth error:", error);

  if (!user) {
    console.log("Server  Redirecting to /auth/sign-in due to no user");
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Snipster Dashboard
        </h1>
        <p className="text-white">Hello, {user.email}!</p>
      </div>
    </div>
  );
}
