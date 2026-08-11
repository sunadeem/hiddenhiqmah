"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * One-time consent before the first Ask Hiqmah question.
 *
 * Ask is a bottom-tab destination reachable on first launch, and the question a
 * user types goes to Anthropic to be answered. Consent was previously only
 * captured on the sign-in screen — which a signed-out user never sees — so a
 * first-time user could send a question about a health problem or a marriage
 * difficulty to a third party without ever being told. Religious questions carry
 * that kind of detail routinely, which is exactly the case App Store guideline
 * 5.1.2(i) is about.
 *
 * Stored per-device rather than per-account, because the people this protects
 * are precisely the ones who have not signed in.
 */

const CONSENT_KEY = "hiqmah-ask-consent-v1";

export function hasAskConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "1";
  } catch {
    // Private mode / storage disabled: fail OPEN would be the wrong default for
    // a consent gate, so treat it as not-yet-agreed and ask again next time.
    return false;
  }
}

export function recordAskConsent(): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, "1");
  } catch {
    /* nothing to persist to — the sheet simply shows again next launch */
  }
}

export default function AskConsentSheet({
  onApprove,
  onReject,
}: {
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-consent-title"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* max-h + flex column + a min-h-0 scroller: the DIALOG scrolls, the page
          behind it never does. overscroll-contain stops the scroll chaining out
          to the shell when the list hits its end. */}
      <div className="relative w-full max-w-md max-h-[82vh] flex flex-col card-bg border sidebar-border rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="shrink-0 px-5 pt-5 pb-3 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-gold" />
          </span>
          <h2 id="ask-consent-title" className="text-lg font-bold text-themed">
            Before you ask
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-4 space-y-3.5">
          <p className="text-sm text-themed-muted leading-relaxed">
            Ask Hiqmah searches this app&apos;s own Qur&apos;an and hadith
            collections, then uses AI to put the answer together. A few things
            worth knowing:
          </p>

          <ul className="text-sm text-themed-muted leading-relaxed space-y-2.5 pl-4 list-disc marker:text-gold/60">
            <li>
              <strong className="text-themed">
                Your question leaves your device.
              </strong>{" "}
              It is sent to an AI to run the search and write the answer. Our
              Privacy Policy names the provider.
            </li>
            <li>
              <strong className="text-themed">Keep it general.</strong> Please
              leave out names, health details, or anything identifying &mdash;
              about you or anyone else. You will get the same answer either way.
            </li>
            <li>
              <strong className="text-themed">
                We do not keep your questions.
              </strong>{" "}
              Your conversation stays on this device. We record only a timestamp
              and a token count, for the daily limit.
            </li>
            <li>
              <strong className="text-themed">
                It is a study aid, not a mufti.
              </strong>{" "}
              Answers can be incomplete or wrong. For anything binding, ask a
              qualified scholar.
            </li>
          </ul>

          <p className="text-sm text-themed-muted leading-relaxed">
            Only Ask Hiqmah needs this &mdash; the rest of the app works without
            it. Full detail is in our{" "}
            <Link href="/privacy" className="text-gold underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="shrink-0 border-t sidebar-border p-4 flex gap-3">
          <button
            type="button"
            onClick={onReject}
            className="flex-1 py-3 rounded-xl border sidebar-border text-themed text-sm font-semibold touch-manipulation active:scale-[0.98] transition-transform"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 py-3 rounded-xl bg-gold text-[#14100a] text-sm font-bold touch-manipulation active:scale-[0.98] transition-transform"
          >
            Agree &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}
