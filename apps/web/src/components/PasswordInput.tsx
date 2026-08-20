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
      {/* The three keyboard-assist attributes are load-bearing ONLY while the
          field is revealed. At type="password" the platform suppresses
          capitalisation, autocorrect and spellcheck by itself; the moment the
          eye is tapped it becomes an ordinary text input and Android's keyboard
          starts treating a password like prose — capitalising the first
          character and offering corrections. People tap the eye precisely when
          a sign-in has just failed, so the silent edit lands at the worst
          possible moment and reads as "my password stopped working". */}
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
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
