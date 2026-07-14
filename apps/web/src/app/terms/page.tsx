export const metadata = {
  title: "Terms of Use — Hidden Hiqmah",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-themed mb-2">Terms of Use</h1>
        <p className="text-xs text-themed-muted">
          Effective date: <span className="text-themed">July 2026</span>
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">1. Agreement</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          These Terms of Use (the &ldquo;Terms&rdquo;) are a legal agreement between you
          and <span className="text-themed">Hidden Hiqmah LLC</span> (&ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;Hidden Hiqmah&rdquo;), the operator of the Hidden
          Hiqmah app and website (the &ldquo;Service&rdquo;). By creating an account or
          using the Service, you agree to these Terms and to our{" "}
          <a href="/privacy" className="text-gold underline">Privacy Policy</a>. If you do
          not agree, please do not use the Service.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">2. Who can use it</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          You must be able to form a binding contract to use account features. If you are
          under the age of majority where you live, you may use the Service only with the
          involvement of a parent or guardian. Features that involve messaging other people
          (Circles) are intended for users 13 and older.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">3. Your licence to use the app</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          We grant you a personal, non-exclusive, non-transferable, revocable licence to
          use the Service for your own worship and learning. You may not copy, resell,
          reverse-engineer, or redistribute the app, and you may not use it to break the
          law or infringe anyone&rsquo;s rights.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">4. Your account</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          You are responsible for keeping your account secure and for activity under it.
          You can delete your account at any time from{" "}
          <span className="text-themed">Settings → Account → Delete account</span>, which
          permanently removes your account and associated data.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">5. Community &amp; user content</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Circles feature lets you share progress and send messages within private,
          invite-only groups (&ldquo;User Content&rdquo;). You keep ownership of what you
          post; you grant us a limited licence to store and display it to the members of
          your Circle so the feature works.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          <span className="text-themed font-semibold">There is zero tolerance for
          objectionable content or abusive behaviour.</span> You agree not to post content
          that is unlawful, hateful, harassing, threatening, sexually explicit, or otherwise
          objectionable, and not to impersonate or abuse others.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          You can <span className="text-themed">report</span> a message and{" "}
          <span className="text-themed">block</span> a user from within any Circle chat
          (long-press a message). We review reports and will remove content and/or suspend
          or terminate accounts that violate these Terms, typically within 24 hours of a
          report. Circle owners can also remove members from their Circles.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">6. Religious content</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          We work to present the Qur&apos;an, hadith, prayer times, and other content
          accurately and from reputable sources, but the Service is a study aid, not a
          substitute for a qualified scholar. Prayer times are calculated estimates that
          depend on your location and chosen method. Please verify anything you rely on for
          worship, and consult a knowledgeable person for religious rulings.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">7. Disclaimers &amp; liability</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Service is provided &ldquo;as is,&rdquo; without warranties of any kind. To
          the fullest extent permitted by law, Hidden Hiqmah LLC is not liable for any
          indirect, incidental, or consequential damages arising from your use of the
          Service, including reliance on prayer times or other content.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">8. Termination</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          You may stop using the Service and delete your account at any time. We may
          suspend or terminate access if you violate these Terms or to protect the Service
          and its users.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">9. Changes</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          We may update these Terms from time to time. If we make material changes, we will
          update this page and the effective date above. Continued use after changes means
          you accept the updated Terms.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gold">10. Contact</h2>
        <p className="text-themed-muted text-sm leading-relaxed">
          Questions about these Terms? Email{" "}
          <a href="mailto:support@hiddenhiqmah.com" className="text-gold underline">
            support@hiddenhiqmah.com
          </a>
          . Hidden Hiqmah LLC.
        </p>
      </section>
    </div>
  );
}
