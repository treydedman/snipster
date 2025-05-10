import { createServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const authToken = (
    await cookieStore.get("sb-hpnigpphcxzmxtfvrlyz-auth-token")
  )?.value;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return NextResponse.json({ authToken, user });
}
