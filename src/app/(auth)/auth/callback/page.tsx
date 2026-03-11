"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Auth callback page — handles both implicit flow (hash fragment) and PKCE (code query param).
 *
 * Implicit flow (default for OAuth):
 *   Supabase redirects here with #access_token=...&refresh_token=...
 *   The browser Supabase client auto-detects the hash and sets the session.
 *
 * PKCE flow (fallback):
 *   Supabase redirects here with ?code=xxx
 *   We exchange the code client-side using the browser's cookies (which have code_verifier).
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const next = searchParams.get("next") || "/projects";
    const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
    const oauthError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (oauthError) {
      setError(errorDescription || oauthError);
      setProcessing(false);
      return;
    }

    const handleAuth = async () => {
      try {
        const supabase = createClient();

        // Check if there's a code in the query params (PKCE flow)
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[Auth Callback] Code exchange failed:", error.message);
            setError(error.message);
            setProcessing(false);
            return;
          }
          window.location.href = safePath;
          return;
        }

        // For implicit flow, Supabase client auto-detects hash fragment
        // on initialization. We just need to wait for the session to be set.
        // Give it a moment to process the hash fragment.
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          window.location.href = safePath;
          return;
        }

        // If no session yet, wait a bit and try again (hash processing can be async)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const { data: { session: retrySession } } = await supabase.auth.getSession();

        if (retrySession) {
          window.location.href = safePath;
          return;
        }

        // Still no session — something went wrong
        setError("Không nhận được phiên đăng nhập. Vui lòng thử lại.");
        setProcessing(false);
      } catch (err) {
        console.error("[Auth Callback] Error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
        setProcessing(false);
      }
    };

    handleAuth();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center max-w-md">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="th-text-danger text-sm mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <p className="th-text-secondary text-sm">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return null;
}
