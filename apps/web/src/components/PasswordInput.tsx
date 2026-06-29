"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password field with a built-in show/hide toggle. Shares the app's input
// styling; reserves right padding so the eye button never overlaps the text.
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 pr-11 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-themed-muted hover:text-gold transition-colors touch-manipulation"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
