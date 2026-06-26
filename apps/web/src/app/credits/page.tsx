export const metadata = {
  title: "Credits & Sources — Hidden Hiqmah",
};

type Source = {
  name: string;
  detail: string;
  license: string;
  href?: string;
};

const sections: { heading: string; note?: string; sources: Source[] }[] = [
  {
    heading: "Qur'an",
    sources: [
      {
        name: "Arabic text (Uthmani script)",
        detail:
          "The Qur'anic Arabic text is provided by the Tanzil Project, an accurate verified Unicode Qur'an text.",
        license:
          "© Tanzil Project — redistributed verbatim, unmodified, with attribution as required by the Tanzil terms.",
        href: "https://tanzil.net",
      },
      {
        name: "Word-by-word data — transliteration, meanings, roots & morphology",
        detail:
          "Per-word transliteration, glosses, roots, lemmas and grammar derive from the Quranic Arabic Corpus (Kais Dukes).",
        license: "© corpus.quran.com — GNU General Public License. Used unmodified, with attribution.",
        href: "https://corpus.quran.com",
      },
    ],
  },
  {
    heading: "Recitation & timing",
    sources: [
      {
        name: "Recitation",
        detail:
          "Murattal recitation by Shaykh Mishary Rashid al-Afasy, streamed for listening.",
        license: "Recitation © the reciter; used for non-commercial listening.",
      },
      {
        name: "Word-highlight timestamps",
        detail:
          "Per-word audio segment timings that power the verse/word highlighting.",
        license:
          "Based on the quran-align dataset (cpfair) — Creative Commons Attribution 4.0 (CC BY 4.0).",
        href: "https://github.com/cpfair/quran-align",
      },
    ],
  },
  {
    heading: "Translation, tafsir & hadith",
    note: "Qur'an translation and tafsir are used under the redistribution terms of QuranEnc.com (attribution, displayed unmodified). Hadith English translations are being re-sourced under a clearly-licensed edition; this credit will be updated.",
    sources: [
      {
        name: "Qur'an English translation",
        detail:
          "“The Translation of the Meanings of the Noble Qur'an” by the Rowwad Translation Center (with IslamHouse.com), provided via QuranEnc.com and displayed unmodified.",
        license: "© Rowwad Translation Center / QuranEnc.com — redistributed with attribution per their terms.",
        href: "https://quranenc.com",
      },
      {
        name: "Tafsir (commentary)",
        detail:
          "“Al-Mukhtaṣar fī al-Tafsīr (The Concise Interpretation)” by the Tafsir Center for Qur'anic Studies, provided via QuranEnc.com and displayed unmodified.",
        license: "© Tafsir Center for Qur'anic Studies / QuranEnc.com — redistributed with attribution per their terms.",
        href: "https://quranenc.com",
      },
      {
        name: "Hadith collections",
        detail:
          "Arabic and English of the six books and Musnad Ahmad. The Arabic matn is from the public-domain tradition; English translations belong to their translators.",
        license: "© the respective translators.",
      },
    ],
  },
  {
    heading: "Typography",
    sources: [
      {
        name: "Amiri, Cinzel, Cormorant Garamond",
        detail: "Fonts bundled with the app.",
        license: "SIL Open Font License 1.1 (OFL-1.1).",
        href: "https://openfontlicense.org",
      },
    ],
  },
];

export default function CreditsPage() {
  return (
    <div className="max-w-2xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-themed mb-2">Credits & Sources</h1>
        <p className="text-themed-muted text-sm leading-relaxed">
          Hidden Hiqmah stands on the work of many people who have made the
          Qur&apos;an, hadith, and Islamic scholarship accessible. We are grateful
          to them, and we list our sources openly. If you believe something here
          is attributed incorrectly, please contact us.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.heading} className="mb-8">
          <h2 className="text-xl font-semibold text-gold mb-2">
            {section.heading}
          </h2>
          {section.note && (
            <p className="text-themed-muted text-xs leading-relaxed mb-4 italic">
              {section.note}
            </p>
          )}
          <ul className="space-y-4">
            {section.sources.map((s) => (
              <li
                key={s.name}
                className="card-bg rounded-xl border sidebar-border p-4"
              >
                <p className="text-sm font-semibold text-themed">{s.name}</p>
                <p className="text-themed-muted text-sm leading-relaxed mt-1">
                  {s.detail}
                </p>
                <p className="text-themed-muted text-xs leading-relaxed mt-2">
                  {s.license}
                </p>
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-xs underline mt-1 inline-block"
                  >
                    {s.href.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="text-themed-muted text-xs leading-relaxed">
        May Allah reward everyone whose effort made this knowledge available.
      </p>
    </div>
  );
}
