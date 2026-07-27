import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /auth/callback?code=xxx
 *
 * Supabase sends the user here after clicking the magic link.
 * Exchange the one-time code for a session, then redirect to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If no code or exchange failed, redirect to login with an error
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(loginUrl);
}
