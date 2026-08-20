export const metadata = {
  title: "Privacy Policy — Hidden Hiqmah",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-themed mb-2">Privacy Policy</h1>
        <p className="text-xs text-themed-muted">
          Effective date: <span className="text-themed">August 20, 2026</span>
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">Introduction</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Hidden Hiqmah is an Islamic learning and worship companion app —
          Quran, hadith, prayer times, daily du&apos;as, Kids learning, and an
          AI chat assistant called Ask Hiqmah. The Service is operated by{" "}
          Hidden Hiqmah LLC (&ldquo;we,&rdquo; &ldquo;us&rdquo;).
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
            Streaks, dhikr counts and Kids learning progress &mdash; on your
          device while you are signed out; synced to your account if you sign in
          (see below)
          </li>
          <li>Font size and theme preference (light/dark)</li>
          <li>Notification preferences</li>
          <li>
            Prayer settings: calculation method, Asr juristic method, location
            mode
          </li>
          <li>Auto-play preference for Quran audio</li>
          <li>Ask Hiqmah conversation history</li>
        </ul>
        <p className="text-themed-muted text-sm leading-relaxed">
          While you are signed out we have no copy of any of this &mdash;
          clearing the app or uninstalling removes it.
        </p>

        <h3 className="text-base font-semibold text-themed mt-6">
          Synced to your account (only if you sign in)
        </h3>
        <p className="text-themed-muted text-sm leading-relaxed">
          Signing in is optional. If you do, these are stored on our servers
          (Supabase) against your account so they survive a reinstall and follow
          you between devices:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed pl-6 list-disc space-y-1">
          <li>Your email address</li>
          <li>Display name and profile icon, if you set one</li>
          <li>
            Journal entries &mdash; the reflections you write are stored as you
            wrote them
          </li>
          <li>
            Daily checklist completions, including which of the five prayers you
            marked, plus dhikr counts and streaks
          </li>
          <li>Hifz memorisation plans, cards and review history</li>
          <li>Saved reminders and custom dhikr</li>
          <li>
            Circles: the groups you join, your progress in them, and the
            messages you send. Deleted messages are hidden from the group but
            retained in our database
          </li>
          <li>
            If you enable push notifications: a device token from Apple and your
            device&apos;s timezone, so a notification can reach you at the right
            local hour
          </li>
          <li>
            AI Chat request timestamps and token counts, for your daily quota
            and our cost accounting
          </li>
        </ul>
        <p className="text-themed-muted text-sm leading-relaxed">
          We do not sell any of it, and we do not use it for advertising. You can
          delete your account and everything above at any time &mdash; see
          &ldquo;Data deletion&rdquo; below.
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
            is kept on your device. The one exception is if you tap Report on an
            answer &mdash; see &ldquo;Reporting an AI answer&rdquo; below.
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
            questions on our servers, unless you choose to report an answer
            &mdash; the only case where a question and answer are saved. You can
            delete your account and all related records at any time from
            Settings.
          </li>
        </ul>

        <h3 className="text-base font-semibold text-themed mt-6">
          What we do not collect
        </h3>
        <p className="text-themed-muted text-sm leading-relaxed">
          No name, no address, no phone number, no contacts, no analytics, no
                advertising identifiers, no tracking pixels, no crash telemetry tied
                to you, no marketing list. If you never sign in, nothing you do in
                the app is stored on our servers at all &mdash; with one
                exception: if you choose to report an AI answer, that report is
                stored so we can review it. What we do store for signed-in
                accounts is listed in full above.
        </p>
      </section>

      {/* Reporting is the ONE path that stores a question and an answer, and the
          three statements above each carve out an exception pointing here. If
          the report feature is ever removed, remove those carve-outs with it —
          a policy that claims to store more than it does is its own problem. */}
      <section id="reporting-an-ai-answer" className="space-y-3 mb-8 scroll-mt-24">
        <h2 className="text-xl font-semibold text-gold">Reporting an AI answer</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Ask Hiqmah&apos;s answers are generated by AI and can be wrong. Every
          answer has a small flag button next to Copy, so you can tell us when
          one is offensive, incorrect, or badly sourced.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          Nothing is sent until you confirm, and the screen shows you exactly
          what will be sent before you do. A report contains three things: the
          answer you are reporting, the single question that produced it, and
          the reason and note you write. We ask for the question because a
          reviewer cannot otherwise tell a genuine model failure from an answer
          that was deliberately provoked. Nothing else from your conversation is
          included.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          If you are signed in, the report is linked to your account so we can
          follow up. If you are not, it is linked only to a random identifier
          generated on your device, which is not tied to you.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          Reports are used solely to review and improve Ask Hiqmah. They are
          never used for advertising or profiling, never shared outside Hidden
          Hiqmah, and are deleted within 90 days.
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

      {/* id + scroll margin because Google Play's Data safety form takes a
          "delete account" and a "delete data" URL and checks that the steps are
          PROMINENT at that link. Both point here with #data-deletion; without
          the anchor the reviewer lands at the top of a long policy and has to
          hunt for this section. scroll-mt keeps the heading clear of the header
          it would otherwise land under. */}
      <section id="data-deletion" className="space-y-3 mb-8 scroll-mt-24">
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
            If you have an account, open{" "}
            <strong className="text-themed">
              Settings → Account → Delete account
            </strong>{" "}
            to permanently delete your account and all associated data — Hifz
            progress, daily checklist &amp; streaks, Circles you own, saved
            reflections, any AI answers you reported, and AI-chat usage logs. You can also email{" "}
            <a
              href="mailto:support@hiddenhiqmah.com"
              className="text-gold underline"
            >
              support@hiddenhiqmah.com
            </a>{" "}
            from the address you signed up with.
          </li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed">
          The local actions permanently remove bookmarks, streaks, settings,
          and chat history from your device. Server-side records (only relevant
          if you signed in) are removed via the email request above.
        </p>
        {/* Play asks separately whether data can be deleted WITHOUT closing the
            account, and the answer given there is yes — so it has to be stated
            here, at the URL that answer points to. Every item listed is one we
            actually delete on request, not merely hide. */}
        <p className="text-themed-muted text-sm leading-relaxed">
          You do not have to delete your account to remove individual data. A
          reflection in your Journal, a message you sent in a Circle, and any
          custom dhikr you created can each be deleted where they appear, and
          you can leave a Circle at any time from its detail screen. Deleting
          your account removes everything at once; deleting an item removes only
          that item. Neither is recoverable afterwards, and we keep no separate
          copy once the deletion completes.
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
        <h2 className="text-xl font-semibold text-gold">Notifications</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          There are two kinds, and they work differently.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          <strong className="text-themed">Local reminders</strong> — adhan and
          prayer-time alerts, daily checklist and du&apos;a reminders, and
          Islamic-event reminders — are scheduled on your device and computed
          on-device from your prayer settings. Nothing about them leaves your
          phone, and they work with no connection.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          <strong className="text-themed">Push notifications</strong> — the
          weekly du&apos;a, occasional re-engagement nudges, and Circles chat
          alerts if you opt in — are sent from our servers through Apple&apos;s
          Push Notification service. To deliver them we store a push token
          issued by Apple for your device, and your device&apos;s timezone so
          the weekly du&apos;a arrives at the right local hour. Each channel has
          its own switch in Settings, and turning push off stops them.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          All notifications stay off until you enable them, and you can turn
          them off at any time:
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
            href="mailto:support@hiddenhiqmah.com"
            className="text-gold underline"
          >
            support@hiddenhiqmah.com
          </a>
        </p>
      </section>
    </div>
  );
}
