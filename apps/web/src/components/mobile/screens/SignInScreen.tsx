"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PasswordStrength from "@/components/PasswordStrength";
import PasswordInput from "@/components/PasswordInput";

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

const inputClass =
  "w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40";
const primaryBtn =
  "w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";

type Mode = "signin" | "signup" | "magic" | "forgot";

export default function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signInWithEmail,
    verifyOtp,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
  } = useAuth();

  const errorParam = searchParams.get("error");
  const nextParam = searchParams.get("next");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [magicStep, setMagicStep] = useState<"email" | "verify">("email");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorParam === "callback_failed"
      ? "We couldn't complete sign-in from the email link. Try again below."
      : null
  );

  const trimmedEmail = email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);

  const finish = () => {
    try {
      localStorage.setItem("hiqmah-seen-welcome", "1");
    } catch {
      // ignore
    }
    // replace (not push) so back doesn't return to sign-in; honor ?next= so the
    // soft-gate returns the user to the page they were on.
    router.replace(nextParam || "/");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setCode("");
    setMagicStep("email");
  };

  // ─── handlers ───
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    setBusy(true);
    setError(null);
    const { error } = await signInWithPassword(trimmedEmail, password);
    setBusy(false);
    if (error) setError(error);
    else finish();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim())
      return setError("Please enter your first and last name.");
    if (!isValidEmail) return setError("Please enter a valid email address.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    setBusy(true);
    setError(null);
    const { error, needsConfirmation, alreadyExists } = await signUpWithPassword(
      trimmedEmail,
      password,
      { firstName: firstName.trim(), lastName: lastName.trim() }
    );
    setBusy(false);
    if (error) return setError(error);
    if (alreadyExists) {
      setMode("signin");
      setPassword("");
      setNotice(
        `An account already exists for ${trimmedEmail}. Please sign in below.`
      );
      return;
    }
    if (needsConfirmation) {
      setMode("signin");
      setPassword("");
      setNotice(
        `Account created. We sent a confirmation link to ${trimmedEmail} — confirm it, then sign in.`
      );
    } else {
      finish();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return setError("Please enter a valid email address.");
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error } = await resetPassword(trimmedEmail);
    setBusy(false);
    if (error) setError(error);
    else
      setNotice(
        `If an account exists for ${trimmedEmail}, a password-reset link is on its way.`
      );
  };

  const handleSendMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return setError("Please enter a valid email address.");
    setBusy(true);
    setError(null);
    const { error } = await signInWithEmail(trimmedEmail);
    setBusy(false);
    if (error) setError(error);
    else setMagicStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    setError(null);
    const { error } = await verifyOtp(trimmedEmail, code);
    setBusy(false);
    if (error) setError(error);
    else finish();
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setNotice(null);
    const { error } = await signInWithEmail(trimmedEmail);
    setResending(false);
    if (error) setError(error);
    else setNotice("New code sent. Check your inbox.");
  };

  // ─── shared blocks ───
  const errorBox = error ? (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  ) : null;
  const noticeBox =
    notice && !error ? (
      <div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 p-3">
        <p className="text-sm text-gold">{notice}</p>
      </div>
    ) : null;

  const emailField = (
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
        className={inputClass}
        required
      />
    </div>
  );

  // ─── magic-link verify step ───
  if (mode === "magic" && magicStep === "verify") {
    return (
      <div className="max-w-md mx-auto pt-6 pb-12 px-4">
        <button
          type="button"
          onClick={() => {
            setMagicStep("email");
            setCode("");
            setError(null);
            setNotice(null);
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
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="••••••"
            autoFocus
            autoComplete="one-time-code"
            className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-4 text-themed text-3xl tracking-[0.3em] text-center font-mono focus:outline-none focus:border-[var(--color-gold)]/40"
          />
          {errorBox}
          {noticeBox}
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className={primaryBtn}
          >
            {busy ? "Verifying..." : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || busy}
            className="w-full text-xs text-themed-muted active:text-themed py-2 touch-manipulation disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-6 pb-12 px-4">
      {(mode === "forgot" || mode === "magic") && (
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="text-sm text-themed-muted mb-6 flex items-center gap-1.5 active:text-themed touch-manipulation"
        >
          <ArrowLeft size={14} /> Back to sign in
        </button>
      )}

      <Bismillah />

      {/* ─── Sign in (email + password) ─── */}
      {mode === "signin" && (
        <>
          <h1 className="text-3xl font-bold text-themed mb-2 text-center">
            Sign in
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            Welcome back to Hidden Hiqmah.
          </p>
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            {emailField}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-themed-muted">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-gold/80 hover:text-gold touch-manipulation"
                >
                  Forgot?
                </button>
              </div>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {errorBox}
            {noticeBox}
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-6 space-y-3 text-center">
            <button
              type="button"
              onClick={() => switchMode("magic")}
              className="text-sm text-themed-muted hover:text-themed touch-manipulation"
            >
              Email me a sign-in code instead
            </button>
            <p className="text-sm text-themed-muted">
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-gold font-medium hover:underline touch-manipulation"
              >
                Create an account
              </button>
            </p>
          </div>
        </>
      )}

      {/* ─── Create account ─── */}
      {mode === "signup" && (
        <>
          <h1 className="text-3xl font-bold text-themed mb-2 text-center">
            Create your account
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            Save your progress, bookmarks, and memorization across devices.
          </p>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  autoComplete="given-name"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  autoComplete="family-name"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            {emailField}
            <div>
              <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={password} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
                Confirm password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
              {confirmPassword.length > 0 && (
                <p
                  className={`text-[11px] mt-1 ${
                    confirmPassword === password
                      ? "text-green-500"
                      : "text-red-400"
                  }`}
                >
                  {confirmPassword === password
                    ? "Passwords match"
                    : "Passwords don't match"}
                </p>
              )}
            </div>
            {errorBox}
            {noticeBox}
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-themed-muted text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="text-gold font-medium hover:underline touch-manipulation"
            >
              Sign in
            </button>
          </p>
        </>
      )}

      {/* ─── Forgot password ─── */}
      {mode === "forgot" && (
        <>
          <h1 className="text-2xl font-bold text-themed mb-2 text-center">
            Reset your password
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            Enter your email and we&apos;ll send a link to set a new password.
          </p>
          <form onSubmit={handleForgot} className="space-y-4">
            {emailField}
            {errorBox}
            {noticeBox}
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}

      {/* ─── Magic-link (email step) ─── */}
      {mode === "magic" && (
        <>
          <h1 className="text-2xl font-bold text-themed mb-2 text-center">
            Sign in with a code
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            We&apos;ll email you a sign-in link and a 6-digit code — no password
            needed.
          </p>
          <form onSubmit={handleSendMagic} className="space-y-4">
            {emailField}
            {errorBox}
            {noticeBox}
            <button
              type="submit"
              disabled={busy || !isValidEmail}
              className={primaryBtn}
            >
              {busy ? "Sending..." : "Email me a code"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
