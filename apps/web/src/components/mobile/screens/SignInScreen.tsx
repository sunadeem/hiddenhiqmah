"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function Bismillah() {
  return (
    <div className="text-center mb-8">
      <p className="text-gold/70 font-arabic text-2xl mb-3 leading-relaxed">
        بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      <div className="mx-auto h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
    </div>
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, verifyOtp } = useAuth();

  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorParam === "callback_failed"
      ? "We couldn't complete sign-in from the email link. Try the 6-digit code instead."
      : null
  );

  const trimmedEmail = email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError(null);
    const result = await signInWithEmail(trimmedEmail);
    setSending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep("verify");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setVerifying(true);
    setError(null);
    const result = await verifyOtp(trimmedEmail, code);
    setVerifying(false);
    if (result.error) {
      setError(result.error);
    } else {
      // Onboarding complete — mark Welcome seen so it doesn't paint on the
      // landing page. (Welcome only sets this flag on Continue-as-guest;
      // sign-in path defers it to here so backing out of signin keeps
      // showing Welcome.)
      try {
        localStorage.setItem("hiqmah-seen-welcome", "1");
      } catch {
        // ignore
      }
      // replace (not push) so the back button doesn't return to signin
      router.replace("/");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResendNotice(null);
    const result = await signInWithEmail(trimmedEmail);
    setResending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResendNotice("New code sent. Check your inbox.");
    }
  };

  if (step === "email") {
    return (
      <div className="max-w-md mx-auto pt-6 pb-12 px-4">
        <Bismillah />
        <h1 className="text-3xl font-bold text-themed mb-2 text-center">
          Sign in
        </h1>
        <p className="text-themed-muted text-sm leading-relaxed text-center mb-8">
          We&apos;ll email you a sign-in link and a 6-digit code.
          <br />
          No password required.
        </p>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !isValidEmail}
            className="w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {sending ? "Sending..." : "Send sign-in link"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-6 pb-12 px-4">
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
          setResendNotice(null);
        }}
        className="text-sm text-themed-muted mb-6 flex items-center gap-1.5 active:text-themed touch-manipulation"
      >
        <ArrowLeft size={14} /> Change email
      </button>

      <Bismillah />

      <h1 className="text-2xl font-bold text-themed mb-2 text-center">
        Check your inbox
      </h1>
      <p className="text-themed-muted text-sm leading-relaxed text-center mb-6">
        We sent a sign-in link and a 6-digit code to
        <br />
        <strong className="text-themed">{email}</strong>
      </p>

      <p className="text-xs text-themed-muted text-center mb-3">
        Enter the code from your email:
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="••••••"
            autoFocus
            autoComplete="one-time-code"
            className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-4 text-themed text-3xl tracking-[0.3em] text-center font-mono focus:outline-none focus:border-[var(--color-gold)]/40"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {resendNotice && !error && (
          <div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 p-3">
            <p className="text-sm text-gold">{resendNotice}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={verifying || code.length < 6}
          className="w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {verifying ? "Verifying..." : "Verify & sign in"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || verifying}
          className="w-full text-xs text-themed-muted active:text-themed py-2 touch-manipulation disabled:opacity-50"
        >
          {resending ? "Resending..." : "Resend code"}
        </button>
      </form>
    </div>
  );
}
