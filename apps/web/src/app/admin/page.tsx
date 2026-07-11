"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import AdminShell from "./AdminShell";
import { postAdmin, type Creds } from "./useAdminSection";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [creds, setCreds] = useState<Creds | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const c = { email, password1, password2 };
    try {
      // Validate creds with a cheap section fetch before entering the shell.
      await postAdmin("/api/admin/stats", c, { section: "system" });
      setCreds(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCreds(null);
    setEmail("");
    setPassword1("");
    setPassword2("");
    setError(null);
  };

  if (creds) return <AdminShell creds={creds} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 border sidebar-border mb-3">
            <Lock size={20} className="text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-themed font-display">Admin</h1>
          <p className="text-themed-muted text-sm mt-1">Restricted access</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
          autoFocus
          required
          className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40"
        />
        <PasswordInput value={password1} onChange={setPassword1} placeholder="Password" autoComplete="off" required />
        <PasswordInput value={password2} onChange={setPassword2} placeholder="Second password" autoComplete="off" required />
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email || !password1 || !password2}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold rounded-xl px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Enter"}
        </button>
      </form>
    </div>
  );
}
