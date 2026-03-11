import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/projects";
  const oauthError = searchParams.get("error");

  // Prevent open redirect — only allow relative paths
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/projects";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  const errorCode = oauthError ? "oauth_failed" : "auth_failed";
  return NextResponse.redirect(`${origin}/login?error=${errorCode}&next=${encodeURIComponent(safePath)}`);
}
