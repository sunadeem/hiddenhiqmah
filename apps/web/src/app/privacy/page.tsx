export const metadata = {
  title: "Privacy Policy — Hidden Hiqmah",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-themed mb-2">Privacy Policy</h1>
        <p className="text-xs text-themed-muted">
          Effective date: <span className="text-themed">June 18, 2026</span>
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">Introduction</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Hidden Hiqmah is an Islamic learning and worship companion app —
          Quran, hadith, prayer times, daily du&apos;as, Kids learning, and an
          AI chat assistant called Ask Hiqmah. The app is built and maintained
          by Subhan Nadeem as an independent project.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          We built Hidden Hiqmah to be useful without being invasive. We do not
          run ads, we do not sell data, and we do not track you across the
          internet. You can use the app fully without an account; signing in is
          optional and only enables a small set of extras. This policy explains
          what data the app handles and why.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          If anything here changes, we will update this page and the effective
          date above.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">
          Information we collect
        </h2>

        <h3 className="text-base font-semibold text-themed mt-4">
          Stored on your device only
        </h3>
        <p className="text-themed-muted text-sm leading-relaxed">
          Almost everything the app remembers lives in your phone&apos;s local
          storage and never leaves your device. This includes:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-1">
          <li>Bookmarks (verses, hadith, pages)</li>
          <li>Reading progress and last-read positions</li>
          <li>
            Streaks: current streak, last visit date, longest streak
          </li>
          <li>Font size and theme preference (light/dark)</li>
          <li>Dhikr counts</li>
          <li>Notification preferences</li>
          <li>
            Prayer settings: calculation method, Asr juristic method, location
            mode
          </li>
          <li>
            Kids learning progress (stars, badges, completed lessons)
          </li>
          <li>Auto-play preference for Quran audio</li>
          <li>Ask Hiqmah conversation history</li>
        </ul>
        <p className="text-themed-muted text-sm leading-relaxed">
          We do not have a copy of any of this. Clearing the app or
          uninstalling removes it.
        </p>

        <h3 className="text-base font-semibold text-themed mt-6">
          Sent to third parties
        </h3>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-2">
          <li>
            <strong className="text-themed">
              Location for prayer times — computed on your device.
            </strong>{" "}
            Your prayer times are calculated entirely on your device from your
            location; your GPS coordinates are <strong className="text-themed">not</strong> sent to
            any prayer-time server, and they work fully offline. Two optional
            exceptions: (1) to show your city&apos;s name, your coordinates are sent
            once to OpenStreetMap&apos;s geocoder (cosmetic only — prayer times don&apos;t
            need it); and (2) if you look up a <em>different</em> city&apos;s times,
            that city&apos;s coordinates are sent to{" "}
            <a
              href="https://aladhan.com"
              className="text-gold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aladhan.com
            </a>{" "}
            (which supplies that city&apos;s timezone). Your own location is never
            required to leave your device, and we never store it on any server of
            ours.
          </li>
          <li>
            <strong className="text-themed">
              Questions sent to Ask Hiqmah.
            </strong>{" "}
            When you ask a question, your message is sent to our backend at{" "}
            <code className="text-xs text-gold/80 bg-white/5 px-1 py-0.5 rounded">
              /api/search
            </code>
            , which forwards it to the Anthropic Claude API to generate an
            answer. The streamed response is returned to your device. We do not
            persistently log your queries or answers. Your conversation history
            is kept on your device.
          </li>
          <li>
            <strong className="text-themed">
              Account email + AI Chat usage (optional).
            </strong>{" "}
            If you choose to sign in, your email address is sent to{" "}
            <a
              href="https://supabase.com/privacy"
              className="text-gold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase
            </a>{" "}
            (our authentication and database provider, hosted on AWS) to create
            your account and send you sign-in links. We also log a timestamp
            and a one-way hash of your IP address each time you make an AI Chat
            request, used solely to enforce a daily request limit and to
            protect against abuse. We never store the content of your
            questions on our servers. You can delete your account and all
            related records at any time from Settings.
          </li>
        </ul>

        <h3 className="text-base font-semibold text-themed mt-6">
          What we do not collect
        </h3>
        <p className="text-themed-muted text-sm leading-relaxed">
          No name, no address, no phone number, no contacts, no analytics, no
          advertising identifiers, no tracking pixels, no crash telemetry tied
          to you, no marketing list. The only personal data we ever store
          server-side is your email address (only if you sign in) and AI Chat
          request timestamps (per-account or per-device, for quota only).
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">
          How we use information
        </h2>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-1">
          <li>
            <strong className="text-themed">Improve your experience:</strong>{" "}
            local settings (theme, font, bookmarks, streaks) make the app feel
            personal across sessions.
          </li>
          <li>
            <strong className="text-themed">Accurate prayer times:</strong>{" "}
            location is used solely to compute prayer times for where you are.
          </li>
          <li>
            <strong className="text-themed">AI Chat answers:</strong> your
            question is sent to Anthropic so Claude can generate a response
            with citations from Quran and hadith.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">Third parties</h2>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-2">
          <li>
            <a
              href="https://aladhan.com"
              className="text-gold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aladhan.com
            </a>{" "}
            — prayer times API. Receives your coordinates (if you opt in) to
            return prayer time calculations.
          </li>
          <li>
            <a
              href="https://www.anthropic.com/legal/privacy"
              className="text-gold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anthropic
            </a>{" "}
            — provider of the Claude model that powers Ask Hiqmah. Receives the
            text of your question for the duration needed to generate a reply,
            subject to Anthropic&apos;s own privacy policy.
          </li>
          <li>
            <a
              href="https://supabase.com/privacy"
              className="text-gold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase
            </a>{" "}
            — authentication and database provider (hosted on AWS). Stores your
            email address if you choose to sign in, plus per-request
            timestamps and a hashed IP for daily quota enforcement on Ask
            Hiqmah.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">Your rights</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Because nearly all your data stays on your device, you are in
          control:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-1">
          <li>
            <strong className="text-themed">Access:</strong> everything we
            store is visible inside the app.
          </li>
          <li>
            <strong className="text-themed">Delete:</strong> you can wipe it at
            any time (see below).
          </li>
          <li>
            <strong className="text-themed">Control:</strong> location and
            notifications are off until you turn them on, and can be revoked in
            iOS or Android system settings at any time.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">Data deletion</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          To remove your data:
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed pl-6 list-decimal space-y-1">
          <li>
            Open the app and go to{" "}
            <strong className="text-themed">
              Settings → Data → Clear local data
            </strong>
            , or
          </li>
          <li>Uninstall the app from your device.</li>
          <li>
            If you have an account, email{" "}
            <a
              href="mailto:subhan.s.nadeem@gmail.com"
              className="text-gold underline"
            >
              subhan.s.nadeem@gmail.com
            </a>{" "}
            from the email address you signed up with and we will delete your
            account record and AI Chat usage logs from Supabase within 7 days.
            (A self-serve &ldquo;Delete account&rdquo; button is on the
            roadmap.)
          </li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed">
          The local actions permanently remove bookmarks, streaks, settings,
          and chat history from your device. Server-side records (only relevant
          if you signed in) are removed via the email request above.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">Children</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Hidden Hiqmah includes a Kids section designed to be safe and
          educational. The app does not knowingly collect personal information
          from children under 13. The data described above (progress, stars,
          streaks) stays on the device. We recommend parents supervise younger
          children&apos;s use of Ask Hiqmah and review prayer-time location
          settings.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">Push notifications</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Push notifications (for prayer time reminders and daily reminders)
          are planned but not yet active. When they launch, they will be
          delivered through Apple Push Notification service (APNs) on iOS and
          Firebase Cloud Messaging (FCM) on Android. They are off by default.
          You can disable them at any time:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-1">
          <li>
            <strong className="text-themed">iOS:</strong> Settings →
            Notifications → Hidden Hiqmah → Allow Notifications (off)
          </li>
          <li>
            <strong className="text-themed">Android:</strong> Settings → Apps →
            Hidden Hiqmah → Notifications
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold text-gold">
          Changes to this policy
        </h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          If we change how the app handles data — for example when optional
          cross-device sync ships — we will update this page and the effective
          date. Material changes will also be flagged in the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gold">Contact</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Questions, concerns, or deletion requests:{" "}
          <a
            href="mailto:subhan.s.nadeem@gmail.com"
            className="text-gold underline"
          >
            subhan.s.nadeem@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
