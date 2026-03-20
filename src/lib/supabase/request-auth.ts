import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export async function createRequestSupabase(request: NextRequest) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("SUPABASE_NOT_CONFIGURED");
    }

    return createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createServerSupabase();
}

export async function getRequestUser(request: NextRequest) {
  const supabase = await createRequestSupabase(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { supabase, user: null, error };
  }

  return { supabase, user };
}
