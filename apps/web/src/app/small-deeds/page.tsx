"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard, { type SourceRef } from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { HADITH, AYAH, SAY } from "@/data/small-deeds-quotes.generated";
import {
  PAGE_TITLE,
  PAGE_TITLE_AR,
  PAGE_SUBTITLE,
} from "@/data/small-deeds-meta";
import {
  tabs,
  groups,
  deeds,
  HERO_QUOTE,
  SECONDS_LEAD,
  CLOSING_QUOTE,
  ISTIGHFAR_COUNTS,
  type TabKey,
  type SmallDeed,
} from "@/data/small-deeds";

/* ───────────────────────── helpers ─────────────────────────
 *
 * Nothing below authors a quotation. Text comes out of HADITH / AYAH / SAY,
 * which is generated from the verifier's output; the page only decides where to
 * put it.
 */

/** One narration, verbatim, with its reference linked into the hadith reader.
 *
 *  `collectorNotes` is set by the generator when the stored entry carries the
 *  collector's own apparatus after the matn — Abu Isa's grading, a mawquf route,
 *  a chapter cross-reference. Saying so on every such narration is the only way
 *  the page's claim about Sunan weighting is kept honest automatically; a
 *  hand-maintained list of "the places where it matters" drifts the moment a
 *  narration is added. */
function Narration({ hadithKey }: { hadithKey: string }) {
  const h = HADITH[hadithKey];
  return (
    <blockquote className="border-l-2 border-[var(--color-gold)]/40 pl-4 py-0.5">
      <p className="text-themed text-sm leading-relaxed">{h.english}</p>
      <p className="text-xs text-themed-muted mt-2">
        <HadithRefText text={h.citation} />
        {h.collectorNotes && (
          <span className="text-themed-muted/80">
            {" "}
            · the collector&rsquo;s own notes on this report follow the text in the entry
          </span>
        )}
      </p>
    </blockquote>
  );
}

/** The words to say.
 *
 *  ⛔ A "Say" block never renders a whole matn segment. A matn segment is the
 *  NARRATION — "whoever says X a hundred times, his sins are forgiven" — and
 *  putting all of it under a heading that reads Say tells a reader who cannot
 *  read Arabic to recite the reward clause. SAY[id] is a word-range cut out of
 *  a narration by the generator and asserted there to be the corpus' own bytes.
 *  Where no narration on the page quotes the formula, there is no Say block. */
function SayThis({ deed }: { deed: SmallDeed }) {
  if (!deed.say) return null;

  if (deed.say.kind === "matn") {
    const line = SAY[deed.say.id];
    // True for every current card, but computed rather than asserted: the
    // caption must not promise a translation the card does not carry.
    const translated = deed.quotes.includes(line.hadith);
    return (
      <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
        <p className="text-[11px] uppercase tracking-wider text-themed-muted mb-3">
          {deed.say.label ?? "Say"}
        </p>
        <p className="text-2xl font-arabic text-gold text-right leading-loose">{line.arabic}</p>
        <p className="text-xs text-themed-muted mt-3 leading-relaxed">
          The words alone, taken from <HadithRefText text={line.citation} />
          {translated ? ", which is quoted in full below with its translation." : "."}
        </p>
      </div>
    );
  }

  const { label, note, keys } = deed.say;
  return (
    <div className="rounded-lg p-4 mb-4 space-y-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-themed-muted">
          {label ?? "Recite"}
        </p>
        {note && <p className="text-xs text-themed-muted mt-1.5 leading-relaxed">{note}</p>}
      </div>
      {keys.map((k) => {
        const a = AYAH[k];
        return (
          <div key={k}>
            <p className="text-2xl font-arabic text-gold text-right leading-loose mb-2">
              {a.textAr}
            </p>
            <p className="text-themed-muted italic text-sm mb-1">{a.textTranslit}</p>
            <p className="text-themed text-sm">{a.textEn}</p>
            <p className="text-xs text-themed-muted mt-1.5">
              <HadithRefText text={a.citation} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Every citation a card carries, in the order the card presents them. */
function deedRefs(deed: SmallDeed): SourceRef[] {
  const out: SourceRef[] = [];
  for (const k of [...deed.quotes, ...(deed.also ?? [])]) {
    out.push({ ref: HADITH[k].citation, desc: HADITH[k].practice });
  }
  if (deed.say?.kind === "ayat") {
    for (const k of deed.say.keys) out.push({ ref: AYAH[k].citation, desc: AYAH[k].practice });
  }
  // Defensive: today every Say block is spliced from a narration the card also
  // quotes, but a Sources list that could silently omit the source of the words
  // on the card is the wrong shape for this page.
  if (deed.say?.kind === "matn") {
    const h = HADITH[SAY[deed.say.id].hadith];
    out.push({ ref: h.citation, desc: h.practice });
  }
  return out;
}

/** Free text a page search should look inside — including the narrations themselves. */
function deedHaystack(deed: SmallDeed): string[] {
  const fields = [deed.action, deed.cost, deed.caveat, deed.link?.label];
  for (const k of [...deed.quotes, ...(deed.also ?? [])]) {
    fields.push(HADITH[k].english, HADITH[k].citation, HADITH[k].practice);
  }
  if (deed.say?.kind === "ayat") {
    for (const k of deed.say.keys) fields.push(AYAH[k].textEn, AYAH[k].textTranslit, AYAH[k].citation);
    fields.push(deed.say.label, deed.say.note);
  }
  if (deed.say?.kind === "matn") fields.push(deed.say.label, SAY[deed.say.id].citation);
  return fields.filter((f): f is string => Boolean(f));
}

/** Cards carrying at least one narration whose entry holds the collector's own
 *  notes. Counted rather than written down, so the How-to-Read tab cannot drift
 *  out of step with the data the moment a narration is added or swapped. */
const markedCards = deeds.filter((d) => d.quotes.some((k) => HADITH[k].collectorNotes)).length;

function dedupeRefs(refs: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const r of refs) {
    if (seen.has(r.ref)) continue;
    seen.add(r.ref);
    out.push(r);
  }
  return out;
}

/* ───────────────────────── page ───────────────────────── */

function SmallDeedsContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read ?tab= in the initializer, not an effect — an effect would flash the
  // default tab first on every deep link into the page.
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    if (t && tabs.some((x) => x.key === t)) return t as TabKey;
    // A ?section= link points at one card, and that card only exists inside its
    // own tab — open the tab that holds it, or the scroll finds nothing.
    const s = searchParams.get("section");
    const target = s ? deeds.find((d) => d.id === s) : undefined;
    return target ? target.tab : "seconds";
  });
  const [search, setSearch] = useState("");

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  };

  const matches = (deed: SmallDeed) => textMatch(search, ...deedHaystack(deed));

  const renderDeed = (deed: SmallDeed, i: number) => (
    <ContentCard key={deed.id} id={`section-${deed.id}`} delay={Math.min(i * 0.04, 0.3)}>
      {/* rounded-lg, not rounded-full: the longest cost lines wrap to two lines on a
          390px screen, and a two-line stadium reads as a layout bug. */}
      <span className="inline-block text-[11px] px-2.5 py-1 rounded-lg border bg-[var(--color-gold)]/10 text-gold border-[var(--color-gold)]/30 mb-3 leading-relaxed">
        {deed.cost}
      </span>

      <h3 className="text-lg font-semibold text-themed mb-4 leading-snug">{deed.action}</h3>

      <SayThis deed={deed} />

      <div className="space-y-4">
        {deed.quotes.map((k) => (
          <Narration key={k} hadithKey={k} />
        ))}
      </div>

      {deed.also && deed.also.length > 0 && (
        <p className="text-xs text-themed-muted mt-4">
          Also narrated:{" "}
          <HadithRefText text={deed.also.map((k) => HADITH[k].citation).join("; ")} />
        </p>
      )}

      {deed.caveat && (
        <p className="text-xs text-themed-muted leading-relaxed mt-4 pt-3 border-t sidebar-border">
          <span className="text-themed font-medium">What this does not say. </span>
          {deed.caveat}
        </p>
      )}

      {deed.link && (
        <div className="mt-4">
          <Link
            href={deed.link.href}
            className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
          >
            {deed.link.label} →
          </Link>
        </div>
      )}
    </ContentCard>
  );

  /** A list tab: its items, grouped where the tab uses headings, then sources. */
  const renderList = (tab: Exclude<TabKey, "how">, lead?: React.ReactNode) => {
    const visible = deeds.filter((d) => d.tab === tab && matches(d));
    const groupKeys = Array.from(new Set(visible.map((d) => d.group ?? "")));
    let n = 0;

    return (
      <>
        {lead}

        {visible.length === 0 && (
          <p className="text-sm text-themed-muted py-8 text-center">
            Nothing on this tab matches &ldquo;{search}&rdquo;.
          </p>
        )}

        {groupKeys.map((g) => (
          <div key={g || "ungrouped"} className="space-y-5">
            {g && (
              <h2 className="text-xs font-semibold uppercase tracking-wider text-themed-muted pt-2">
                {groups[g]}
              </h2>
            )}
            {visible.filter((d) => (d.group ?? "") === g).map((d) => renderDeed(d, n++))}
          </div>
        ))}

        {visible.length > 0 && (
          <>
            <ContentCard delay={0.25}>
              <h3 className="font-semibold text-themed mb-2">Small and constant beats big and once</h3>
              <Narration hadithKey={CLOSING_QUOTE} />
            </ContentCard>
            <SourcesCard
              sources={dedupeRefs([
                ...visible.flatMap(deedRefs),
                { ref: HADITH[CLOSING_QUOTE].citation, desc: HADITH[CLOSING_QUOTE].practice },
              ])}
            />
          </>
        )}
      </>
    );
  };

  const panel = (key: string, children: React.ReactNode) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );

  return (
    <div>
      <PageHeader title={PAGE_TITLE} titleAr={PAGE_TITLE_AR} subtitle={PAGE_SUBTITLE} />

      {/* Opening quote — the Prophet's own image for this whole category of deed. */}
      <VerseHero
        label="The Hadith"
        arabic={HADITH[HERO_QUOTE].matn[0]}
        text={HADITH[HERO_QUOTE].english}
        reference={HADITH[HERO_QUOTE].citation}
      />

      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search deeds, promises, sources..."
        className="mb-4"
      />

      {/* Kept above the tabs on purpose: it is true of every tab, and a reader who
          never opens "How to Read This" still has to meet it. */}
      <p className="text-xs text-themed-muted leading-relaxed mb-5 max-w-2xl">
        Every promise below is quoted from the narration itself and linked to its source, so you
        can check it. The Scale is Allah&rsquo;s — these are gifts He has promised for small
        things, not a system with a loophole in it.{" "}
        <button
          onClick={() => handleTabChange("how")}
          className="text-gold hover:text-gold/80 underline underline-offset-2"
        >
          How to read this page →
        </button>
      </p>

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {activeTab === "seconds" &&
          panel(
            "seconds",
            renderList(
              "seconds",
              <ContentCard delay={0.05}>
                <Narration hadithKey={SECONDS_LEAD} />
                <p className="text-xs text-themed-muted leading-relaxed mt-3">
                  In this narration the answer he gives is dhikr — the remembrance of Allah — which
                  is what almost everything on this tab is. Nothing here needs wudu, a direction, a
                  time of day, or anyone&rsquo;s permission.
                </p>
              </ContentCard>
            )
          )}

        {activeTab === "day" && panel("day", renderList("day"))}
        {activeTab === "moments" && panel("moments", renderList("moments"))}
        {activeTab === "calendar" && panel("calendar", renderList("calendar"))}

        {activeTab === "how" &&
          panel(
            "how",
            <>
              <ContentCard delay={0.05}>
                <h2 className="text-xl font-semibold text-themed mb-4">
                  What this page is, and what it is not
                </h2>
                <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                  <p>
                    Every item here is a practice the Prophet ﷺ attached an unusually large reward
                    to, for an unusually small cost. That disproportion is the whole point of the
                    page — but it is a disproportion in <em>His</em> generosity, not a flaw in the
                    accounting. The Scale on the Day of Judgement is real and it is Allah&rsquo;s;
                    what these narrations describe is what <em>He</em> has said He will weigh
                    heavily. Nothing on this page is a trick, a hack, or a way around Him.
                  </p>
                  <p>
                    Which is also why you will not find a counter, a checkbox, or a score anywhere
                    on it. Counting lives on the{" "}
                    <Link
                      href="/dhikr"
                      className="text-gold hover:text-gold/80 underline underline-offset-2"
                    >
                      dhikr
                    </Link>{" "}
                    page, where counting belongs.
                  </p>
                </div>
              </ContentCard>

              <ContentCard delay={0.1}>
                <h2 className="text-xl font-semibold text-themed mb-4">A promise is not a receipt</h2>
                <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                  <p>
                    Several narrations here promise forgiveness, a house in Paradise, or entry into
                    Paradise. They are quoted exactly as narrated and they are not summarised into
                    headlines, because the moment &ldquo;a house will be built for him in
                    Paradise&rdquo; becomes &ldquo;you get a house,&rdquo; a gift has been turned
                    into a purchase.
                  </p>
                  <p>
                    Where a promise is easy to over-read, the card says so under{" "}
                    <span className="text-themed font-medium">What this does not say</span>. Where
                    scholars differ — what al-Ikhlas equalling a third of the Qur&rsquo;an means,
                    what &ldquo;sufficient for him&rdquo; means in the al-Baqarah narration,
                    whether fasting <em>fi sabil Allah</em> means any day given to Him or a day on
                    campaign, whether paying toward a masjid earns what building one is promised —
                    the page states that they differ and takes no side. This app has no named
                    reviewing scholar yet, which is exactly why that bar is set where it is.
                  </p>
                </div>
              </ContentCard>

              <ContentCard delay={0.15}>
                <h2 className="text-xl font-semibold text-themed mb-4">
                  Where the references come from
                </h2>
                <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                  <p>
                    Every narration on this page was matched, word for word, against the seven
                    hadith collections this app ships — Bukhari, Muslim, Abu Dawud, Tirmidhi,
                    Nasai, Ibn Majah and Musnad Ahmad — and every reference links into the
                    app&rsquo;s own reader so you can read the entry in full, in context, with its
                    Arabic. Qur&rsquo;anic text is taken byte-for-byte from the app&rsquo;s own
                    Qur&rsquo;an. Nothing on the page is quoted from Musnad Ahmad: it was searched
                    like the rest, but its references are stored in a form the reader cannot open,
                    and a citation you cannot click is not a citation this page will print.
                  </p>
                  <p>
                    Not all of them carry the same weight. Most are from the two Sahihs. Where a
                    narration comes from a collection whose compiler recorded his own remarks on
                    the report — a grading, a competing chain, a note that some narrators reported
                    it as a Companion&rsquo;s own words — that is marked on the reference line
                    itself, on every narration it applies to. {markedCards} of the {deeds.length}{" "}
                    cards on this page carry that mark. Open the reference and the app&rsquo;s
                    reader shows you those remarks in the entry, in Arabic, where they were
                    written.
                  </p>
                  <p>
                    That marking is generated from the stored entries, not from a list someone
                    keeps up to date, because a hand-kept list of &ldquo;the places where it
                    matters&rdquo; goes stale the first time a narration is added. What the page
                    does <em>not</em> do is assert a grade: no grader is named, and none of these
                    narrations is called sound or weak in this app&rsquo;s voice.
                  </p>
                </div>
              </ContentCard>

              <ContentCard delay={0.2}>
                <h2 className="text-xl font-semibold text-themed mb-4">
                  Four things you may expect to find here, and why they are not
                </h2>
                <ul className="space-y-4 text-themed-muted text-sm leading-relaxed list-none">
                  <li>
                    <span className="text-themed font-medium">
                      Ayat al-Kursi after every obligatory prayer.
                    </span>{" "}
                    A very widely taught practice, but the narration for it is not in any of the
                    collections this app carries, so no reference could be given for it. Ayat
                    al-Kursi <em>before sleep</em> is narrated in Sahih al-Bukhari and is on the
                    &ldquo;In Your Day&rdquo; tab instead.
                  </li>
                  <li>
                    <span className="text-themed font-medium">Surah al-Kahf on Friday.</span>{" "}
                    Likewise reported outside these collections. What is here is the narration that
                    is in them — the first ten verses, and protection from the Dajjal. For the
                    Friday practice see{" "}
                    <Link
                      href="/salah?tab=prayers&sub=jumuah"
                      className="text-gold hover:text-gold/80 underline underline-offset-2"
                    >
                      Jumu&rsquo;ah
                    </Link>
                    .
                  </li>
                  <li>
                    <span className="text-themed font-medium">
                      Ten thousand istighfar in a day.
                    </span>{" "}
                    A contemporary practice, and people find it useful. But there is no narration
                    fixing that number and none promising anything for it, so it is not written up
                    here as though there were. The only counts that <em>are</em> narrated are
                    descriptions of the Prophet&rsquo;s ﷺ own habit, and they do not agree with
                    each other:
                    <div className="space-y-3 mt-3">
                      {ISTIGHFAR_COUNTS.map((k) => (
                        <Narration key={k} hadithKey={k} />
                      ))}
                    </div>
                    <div className="mt-3">
                      Seventy in one, a hundred in another. Neither is a target he set for anyone
                      else, which is the point: a number reported about him is not a number
                      prescribed to you.
                    </div>
                  </li>
                  <li>
                    <span className="text-themed font-medium">
                      Reciting al-Ikhlas three times as a completed Qur&rsquo;an.
                    </span>{" "}
                    An inference people draw from the &ldquo;a third of the Qur&rsquo;an&rdquo;
                    narration. The narration does not say it, so neither does this page.
                  </li>
                </ul>
              </ContentCard>

              <ContentCard delay={0.25}>
                <h3 className="font-semibold text-themed mb-2">Where these live in full</h3>
                <p className="text-themed-muted text-sm leading-relaxed">
                  This page is an index of disproportion, not a replacement for the pages that
                  teach each practice properly.
                </p>
                <div className="flex gap-3 flex-wrap mt-3">
                  {[
                    { href: "/dhikr", label: "Dhikr" },
                    { href: "/salah", label: "Salah" },
                    { href: "/muslim-daily", label: "Muslim Daily" },
                    { href: "/tawbah", label: "Tawbah" },
                    { href: "/duas", label: "Duas" },
                    { href: "/ramadan", label: "Ramadan" },
                    { href: "/islamic-calendar", label: "Islamic Calendar" },
                    { href: "/death-rites", label: "Death & Janazah" },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                    >
                      {l.label} →
                    </Link>
                  ))}
                </div>
              </ContentCard>

              <ContentCard delay={0.3}>
                <h3 className="font-semibold text-themed mb-3">The last word</h3>
                <Narration hadithKey={CLOSING_QUOTE} />
              </ContentCard>

              <SourcesCard
                sources={dedupeRefs(
                  [CLOSING_QUOTE, SECONDS_LEAD, HERO_QUOTE, ...ISTIGHFAR_COUNTS].map((k) => ({
                    ref: HADITH[k].citation,
                    desc: HADITH[k].practice,
                  }))
                )}
              />
            </>
          )}
      </AnimatePresence>
    </div>
  );
}

export default function SmallDeedsPage() {
  return (
    <Suspense>
      <SmallDeedsContent />
    </Suspense>
  );
}
