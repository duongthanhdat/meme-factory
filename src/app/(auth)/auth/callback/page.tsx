"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Auth callback — client-side only.
 *
 * Supabase always uses PKCE flow (response_type=code).
 * The code_verifier is stored in the browser by @supabase/ssr createBrowserClient.
 * This page exchanges the code using the SAME browser client that initiated the flow,
 * so it has access to the code_verifier in localStorage/cookies.
 *
 * IMPORTANT: This must be a client component, NOT a server route,
 * because Vercel serverless functions cannot access the browser's code_verifier cookie.
 */
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Parse URL — code comes as query param from Supabase PKCE redirect
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const next = params.get("next") || "/projects";
        const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
        const oauthError = params.get("error");
        const errorDescription = params.get("error_description");

        if (oauthError) {
          setError(errorDescription || oauthError);
          return;
        }

        if (code) {
          // Exchange code for session using browser client (has code_verifier)
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[Auth Callback] Exchange failed:", error.message);
            setError(error.message);
            return;
          }
          // Success — hard navigate to dashboard
          window.location.href = safePath;
          return;
        }

        // No code and no error — check if session already exists (e.g. hash fragment)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = next;
          return;
        }

        // Also check hash fragment for implicit flow fallback
        if (window.location.hash) {
          // Supabase client auto-processes hash on init, wait a tick
          await new Promise((r) => setTimeout(r, 1000));
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2) {
            window.location.href = next;
            return;
          }
        }

        setError("Không nhận được mã xác thực. Vui lòng thử đăng nhập lại.");
      } catch (err) {
        console.error("[Auth Callback] Error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      }
    };

    handleCallback();
  }, []);

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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
        <p className="th-text-secondary text-sm">Đang xác thực...</p>
      </div>
    </div>
  );
}
