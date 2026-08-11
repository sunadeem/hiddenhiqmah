"use client";

import { Search, X } from "lucide-react";

interface PageSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PageSearch({ value, onChange, placeholder = "Search this page...", className = "" }: PageSearchProps) {
  return (
    <div className={`relative max-w-md ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Return dismisses the keyboard. Without this iOS keeps the field
        // focused indefinitely — and since it only undoes its focus zoom on
        // blur, the page stays zoomed in with no way back out.
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl card-bg border sidebar-border text-sm text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
