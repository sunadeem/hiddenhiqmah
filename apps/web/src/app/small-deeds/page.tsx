"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard, { type SourceRef } from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { HADITH, AYAH, SAY } from "@/data/small-deeds-quotes.generated";
import { SAY_TRANSLIT } from "@/data/small-deeds-translit";
import { PAGE_TITLE, PAGE_TITLE_AR, PAGE_SUBTITLE } from "@/data/small-deeds-meta";
import {
  tabs,
  sections,
  groups,
  deeds,
  HERO_QUOTE,
  WORDS_LEAD,
  CLOSING_QUOTE,
  type TabKey,
  type SectionKey,
  type SmallDeed,
} from "@/data/small-deeds";

/* ───────────────────────── helpers ─────────────────────────
 *
 * Nothing below authors a quotation. Text comes out of HADITH / AYAH / SAY,
 * which is generated from the verifier's output; the page only decides where to
 * put it.
 *
 * ⛔ A DEED ROW NEVER PRINTS HADITH[k].english. The founder's instruction was
 * "doesn't have to show the source wording, just the hadith/quran reference" —
 * so the narration text lives one tap away, in the app's own reader, where the
 * full entry, its Arabic and the collector's remarks already are. The quotes
 * module stays exactly as generated: it is what the citation verifier asserts
 * against, and deleting it would delete the proof, not just the prose.
 */

/** One narration, verbatim. Used only for the page's two framing quotes — the
 *  lead over "Words you say" and the closing narration on the How tab. Rows
 *  never render it. */
function Narration({ hadithKey }: { hadithKey: string }) {
  const h = HADITH[hadithKey];
  return (
    <blockquote className="border-l-2 border-[var(--color-gold)]/40 pl-4 py-0.5">
      <p className="text-themed text-sm leading-relaxed">{h.english}</p>
      <p className="text-xs text-themed-muted mt-2">
        <HadithRefText text={h.citation} />
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
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
        <p className="text-[11px] uppercase tracking-wider text-themed-muted mb-3">
          {deed.say.label ?? "Say"}
        </p>
        <p className="text-2xl font-arabic text-gold text-right leading-loose mb-2">
          {line.arabic}
        </p>
        {/* Pronunciation, in /duas' own three-part stack — Arabic, then the
            Latin, muted and italic and two steps down in size so it reads as an
            aid to the Arabic rather than a second version of it. A matn block
            has no English third part: the narration text is deliberately not on
            the row (see the header of this file), so the citation line closes
            the stack instead. */}
        <p className="text-themed-muted italic text-sm leading-relaxed">
          {SAY_TRANSLIT[deed.say.id]}
        </p>
        <p className="text-xs text-themed-muted mt-3 leading-relaxed">
          The words alone, taken from <HadithRefText text={line.citation} /> — open the reference to
          read the narration in full.
        </p>
      </div>
    );
  }

  const { label, note, keys } = deed.say;
  return (
    <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: "var(--color-bg)" }}>
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

/** Free text a page search should look inside.
 *
 *  ⛔ HADITH[k].english stays in the haystack even though no row prints it. The
 *  `effect` lines deliberately carry the narration's own memorable images —
 *  "foam of the sea", "each qirat like Mount Uhud" — so a hit found through the
 *  narration still reads as a hit on the row that surfaces. */
function deedHaystack(deed: SmallDeed): string[] {
  const fields = [deed.action, deed.effect, deed.cost, deed.caveatLead, deed.caveat, deed.link?.label];
  for (const k of [...deed.quotes, ...(deed.also ?? [])]) {
    fields.push(HADITH[k].english, HADITH[k].citation, HADITH[k].practice);
  }
  if (deed.say?.kind === "ayat") {
    for (const k of deed.say.keys)
      fields.push(AYAH[k].textEn, AYAH[k].textTranslit, AYAH[k].citation);
    fields.push(deed.say.label, deed.say.note);
  }
  // The transliteration joins the haystack for the same reason the ayat branch
  // already puts textTranslit in it: it is the only searchable form of these
  // words on the page (the Arabic itself is in neither branch's haystack), so
  // without it "bihamdihi" finds the Qur'an rows and none of the dhikr ones.
  if (deed.say?.kind === "matn")
    fields.push(deed.say.label, SAY[deed.say.id].citation, SAY_TRANSLIT[deed.say.id]);
  return fields.filter((f): f is string => Boolean(f));
}

/** True when the row has anything at all behind the chevron. Two rows do not
 *  (fajr-sunnah, isha-fajr-congregation) and they render flat, with no
 *  affordance — an expander that opens onto nothing is a broken promise about
 *  the interface. */
function hasDetail(deed: SmallDeed): boolean {
  return Boolean(deed.say || deed.caveat || (deed.also && deed.also.length) || deed.link);
}

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

/* ───────────────────────── the row ─────────────────────────
 *
 * The house dense-row idiom: Accordion's visual grammar (card-bg rounded-xl
 * border sidebar-border, px-4 py-3, gold chevron rotating on open) cloned
 * locally rather than imported, because this row must do three things Accordion
 * cannot — carry tappable reference links at rest, carry a caveat line at rest,
 * and own the DOM id `section-<id>` that ?section= deep links scroll to.
 */

/** The reference line: citations only, then the cost. This is ask #2 — what the
 *  founder wants to see is "Bukhari 80:100", not the narration.
 *
 *  The † is the page's one automatic honesty mechanism: it is derived from the
 *  stored entry (HADITH[k].collectorNotes), not from a hand-kept list, so it
 *  cannot drift out of step the moment a narration is added or swapped. It used
 *  to sit on the printed narration's reference line; with narrations gone it
 *  moves here, or it silently disappears. */
function RefLine({ deed }: { deed: SmallDeed }) {
  return (
    <p className="text-[11px] leading-relaxed">
      {deed.quotes.map((k, i) => (
        <span key={k}>
          {i > 0 && <span className="text-themed-muted/50"> · </span>}
          <HadithRefText text={HADITH[k].citation} />
          {HADITH[k].collectorNotes && <span className="text-gold/70">&#8224;</span>}
        </span>
      ))}
      <span className="text-themed-muted/50"> · </span>
      <span className="text-themed-muted">{deed.cost}</span>
    </p>
  );
}

function DeedRow({
  deed,
  isOpen,
  onToggle,
}: {
  deed: SmallDeed;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const expandable = hasDetail(deed);

  const head = (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-semibold leading-snug ${
            isOpen ? "text-gold" : "text-themed"
          }`}
        >
          {deed.action}
        </p>
        <p className="text-xs text-themed-muted leading-relaxed mt-1">{deed.effect}</p>
      </div>
      {expandable && (
        <ChevronDown
          size={16}
          className={`shrink-0 mt-0.5 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      )}
    </div>
  );

  return (
    <div
      id={`section-${deed.id}`}
      className="card-bg rounded-xl border sidebar-border overflow-hidden"
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="w-full flex px-4 pt-3 pb-1.5 text-left touch-manipulation"
        >
          {head}
        </button>
      ) : (
        <div className="w-full flex px-4 pt-3 pb-1.5">{head}</div>
      )}

      {/* Outside the button on purpose: a <button> may not contain links, and
          these references are links into the app's own reader. */}
      <div className="px-4 pb-3">
        <RefLine deed={deed} />

        {/* A row whose plain reading would overclaim is corrected ON the row —
            never only behind a tap. See caveatVisible in the data file.

            Hidden while the row is open, because the full caveat below opens
            with the same correction in longer form and a reader met the précis
            twice, ~400px apart, on every one of these rows. Nothing is lost:
            the expansion is strictly the larger statement. */}
        {deed.caveatVisible && deed.caveatLead && !(isOpen && expandable && deed.caveat) && (
          <p className="mt-2 border-l-2 border-[var(--color-gold)]/40 pl-2.5 text-xs text-themed leading-relaxed">
            <span className="text-themed-muted">Note — </span>
            {deed.caveatLead}
          </p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* ⛔ ORDER IS FIXED: Say → caveat → also → link. Several caveats read
                against the words directly above them, and the "also" line is the
                second set of references the caveats keep pointing at. */}
            <div className="mx-4 mb-4 pt-3 space-y-3 border-t sidebar-border">
              <SayThis deed={deed} />

              {deed.caveat && (
                <p className="text-xs text-themed-muted leading-relaxed">
                  <span className="text-themed font-medium">What this does not say. </span>
                  {deed.caveat}
                </p>
              )}

              {deed.also && deed.also.length > 0 && (
                <p className="text-xs text-themed-muted">
                  Also narrated:{" "}
                  <HadithRefText text={deed.also.map((k) => HADITH[k].citation).join("; ")} />
                </p>
              )}

              {deed.link && (
                <Link
                  href={deed.link.href}
                  className="inline-block text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  {deed.link.label} →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

const LIST_SECTIONS = sections.filter((s) => s.key !== "all");

/** The rail. "All" carries a count because it is the default and the answer to
 *  "how much is on this page"; the five sections do not, because SubTabLayout
 *  takes no count prop and this page does not get to grow one into the shared
 *  component. Their sizes show as a count beside each heading inside All. */
const RAIL: { key: SectionKey; label: string }[] = [
  { key: "all", label: `All (${deeds.length})` },
  ...LIST_SECTIONS.map((s) => ({ key: s.key as SectionKey, label: s.label })),
];

function SmallDeedsContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read the URL in the initializers, not an effect — an effect would flash the
  // default tab first on every deep link into the page.
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    searchParams.get("tab") === "how" ? "how" : "deeds"
  );

  const [activeSub, setActiveSub] = useState<SectionKey>(() => {
    // ?section=<id> ALWAYS resolves to All. All holds every item, so no id →
    // section lookup table is needed and no future regrouping can break a link
    // the founder has already shared.
    if (searchParams.get("section")) return "all";
    const t = searchParams.get("tab");
    // Legacy ?tab=seconds|day|moments|calendar. They do not map one-to-one onto
    // the new sections ("day" splits into prayers + quran), so they land on All
    // — an approximate landing beats a silent fallback to the wrong list.
    if (t && t !== "deeds" && t !== "how") return "all";
    const s = searchParams.get("sub");
    return s && sections.some((x) => x.key === s) ? (s as SectionKey) : "all";
  });

  // Multi-expand: comparing two rows is the normal reason to open one, and
  // single-expand would close the row you were comparing against.
  const [openRows, setOpenRows] = useState<Set<string>>(() => {
    const s = searchParams.get("section");
    // A shared link to a qualified item must land showing the qualification.
    return new Set(s && deeds.some((d) => d.id === s) ? [s] : []);
  });

  const [search, setSearch] = useState("");

  const toggleRow = (id: string) =>
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const replaceUrl = (tab: TabKey, sub?: SectionKey) => {
    router.replace(`${pathname}?tab=${tab}${tab === "deeds" && sub ? `&sub=${sub}` : ""}`, {
      scroll: false,
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    replaceUrl(key as TabKey, activeSub);
  };

  const handleSubChange = (sub: SectionKey) => {
    setActiveSub(sub);
    replaceUrl("deeds", sub);
  };

  // Search is global, matching /duas: filtering inside the active section would
  // silently hide matches, and the reader has no way to know it happened. While
  // a search is running the rail is not rendered at all — see the deeds panel.
  const searching = search.trim().length >= 2;
  const effectiveSub: SectionKey = searching ? "all" : activeSub;

  const matches = (deed: SmallDeed) => textMatch(search, ...deedHaystack(deed));
  const visible = deeds.filter(
    (d) => (effectiveSub === "all" || d.section === effectiveSub) && matches(d)
  );

  const renderRow = (deed: SmallDeed) => (
    <DeedRow
      key={deed.id}
      deed={deed}
      isOpen={openRows.has(deed.id)}
      onToggle={() => toggleRow(deed.id)}
    />
  );

  /** The † footnote, printed only where a † is actually on screen. */
  const collectorFootnote = (rows: SmallDeed[]) => {
    if (!rows.some((d) => d.quotes.some((k) => HADITH[k].collectorNotes))) return null;
    return (
      <p className="text-[11px] text-themed-muted leading-relaxed pt-1">
        <span className="text-gold/70">&#8224;</span> The collector recorded his own remarks on that
        report inside the entry — a grading, a competing chain, or a note that some narrators
        reported it as a Companion&rsquo;s own words. Open the reference to read them. This page
        never calls a narration sound or weak in its own voice.
      </p>
    );
  };

  /** All: five labelled blocks, one flick. Group headings are suppressed here —
   *  section labels are already doing that work, and two levels of heading in a
   *  43-row list is the "all over the place" the founder was describing. */
  const renderAll = () => (
    <div className="space-y-6">
      {LIST_SECTIONS.map((sec) => {
        const rows = visible.filter((d) => d.section === sec.key);
        if (rows.length === 0) return null;
        return (
          <div key={sec.key}>
            <h2 className="text-sm font-semibold text-themed">
              {sec.label}{" "}
              <span className="text-themed-muted font-normal">({rows.length})</span>
            </h2>
            <p className="text-xs text-themed-muted mb-3">{sec.blurb}</p>
            <div className="space-y-2">{rows.map(renderRow)}</div>
          </div>
        );
      })}
    </div>
  );

  /** One section: its headings, its rows, its own sources. */
  const renderSection = (key: Exclude<SectionKey, "all">) => {
    const rows = visible.filter((d) => d.section === key);
    const groupKeys = Array.from(new Set(rows.map((d) => d.group ?? "")));
    return (
      <div className="space-y-5">
        {/* The lead. A compact line, not a card: a fourteen-line narration
            standing between the rail and the first row is the same wall this
            redesign removed from the rows. The citation still renders — it
            renders NOWHERE else on the page, and losing it would quietly drop a
            verified reference — but the narration itself, like every other one
            here, is one tap away in the reader. */}
        {key === "words" && (
          <p className="text-xs text-themed-muted leading-relaxed border-l-2 border-[var(--color-gold)]/40 pl-3">
            Asked which of their deeds were best — better than gold and silver — he ﷺ named the
            remembrance of Allah. <HadithRefText text={HADITH[WORDS_LEAD].citation} />
          </p>
        )}

        {groupKeys.map((g) => (
          <div key={g || "ungrouped"} className="space-y-2">
            {g && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-themed-muted pt-1">
                {groups[g]}
              </h3>
            )}
            {rows.filter((d) => (d.group ?? "") === g).map(renderRow)}
          </div>
        ))}

        {collectorFootnote(rows)}

        {/* ⛔ NO "Sources & References" CARD HERE. It used to close every section
            and it was the reference dump the rows had just shed, re-attached at
            the bottom: 21–30% of each section's scroll, and every line of it a
            citation already tappable on the row above plus a re-write of that
            row's `effect`. Nothing is orphaned by its removal — every `quotes`
            key renders in RefLine at rest, every `also` key in the expansion,
            every AYAH and SAY citation inside its own block, and the lead's
            citation in the lead. */}
      </div>
    );
  };

  const activeSection = sections.find((s) => s.key === effectiveSub)!;

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

      {/* Opening quote — the Prophet's own image for this whole category of deed.
          Deliberately the no-Arabic variant of VerseHero (as on /hadith and
          /sects). This narration's matn runs to three lines at hero type size,
          which made the card 492px against a house norm of ~324 (/duas) and put
          the first deed 1.5 screens down a page whose whole job is to be picked
          from. Nothing is lost: the English and the citation are unchanged, and
          the Arabic of the two expressions themselves is on the `two-words` row
          below as a byte-exact Say slice of this same entry. */}
      <VerseHero
        label="The Hadith"
        text={HADITH[HERO_QUOTE].english}
        reference={HADITH[HERO_QUOTE].citation}
      />

      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search deeds, promises, sources..."
        className="mb-4"
      />

      {/* One line, above the tabs, because it is true of every row and a reader
          who never opens "How to read this" still has to meet it. No inline link
          to that tab: it IS one of the two tabs, six millimetres below.

          ⛔ THE SECOND SENTENCE IS LOAD-BEARING AND SITS HERE, NOT ON THE HOW
          TAB. Card 4 explains why one formula can be spelt two ways, but the
          collisions it explains are all on the OTHER tab — the All view is the
          default and where every ?section= link lands, and it puts "laaa ilaaha
          illaa" a few rows from "La ilaha illallahu". A reader who never opens
          How to read this would meet both and conclude the page is careless.
          This line is what makes the card reachable from where the problem is;
          it renders above the TabBar, so it is on screen for both tabs. */}
      <p className="text-xs text-themed-muted leading-relaxed mb-4 max-w-2xl">
        Gifts promised for small things — each one checked against the narration it comes from, and
        linked to its source. The Latin under each line of Arabic is pronunciation only, and it
        follows whichever narration that row quotes — <em>How to read this</em> says why two rows
        can spell one formula differently.
      </p>

      <TabBar
        tabs={tabs.map((t) => (t.key === "deeds" ? { ...t, count: deeds.length } : { ...t }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="mb-5"
      />

      <AnimatePresence mode="wait">
        {activeTab === "deeds" &&
          panel(
            "deeds",
            searching ? (
              /* Results replace the chooser, as on /duas. The rail used to stay
                 on screen during a search while `effectiveSub` ignored it: taps
                 changed the URL and lit nothing, then took effect the moment the
                 search was cleared. A control that does nothing now and
                 something later is worse than no control. */
              <>
                <p className="text-xs text-themed-muted">
                  Searching all {deeds.length} deeds — {visible.length}{" "}
                  {visible.length === 1 ? "match" : "matches"} for &ldquo;{search}&rdquo;.
                </p>
                {visible.length === 0 ? (
                  <p className="text-sm text-themed-muted py-8 text-center">
                    Nothing matches &ldquo;{search}&rdquo;.
                  </p>
                ) : (
                  <>
                    {renderAll()}
                    <div className="mt-5">{collectorFootnote(visible)}</div>
                  </>
                )}
              </>
            ) : (
              <SubTabLayout subs={RAIL} activeSub={activeSub} setActiveSub={handleSubChange}>
                {/* The descriptor under the rail. This is the part that answers
                    "idek what they mean": the label never has to carry the whole
                    explanation on its own. */}
                {activeSub !== "all" && (
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-themed">{activeSection.label}</h2>
                    <p className="text-xs text-themed-muted mt-0.5">{activeSection.blurb}</p>
                  </div>
                )}

                {activeSub === "all" ? (
                  <>
                    {renderAll()}
                    <div className="mt-5">{collectorFootnote(visible)}</div>
                  </>
                ) : (
                  renderSection(activeSub)
                )}
              </SubTabLayout>
            )
          )}

        {activeTab === "how" &&
          panel(
            "how",
            <>
              <ContentCard delay={0.05}>
                <h2 className="text-xl font-semibold text-themed mb-2">
                  1 &middot; These are gifts, not transactions.
                </h2>
                <p className="text-themed-muted text-sm leading-relaxed">
                  Every promise here is something Allah has said He will give for something small.
                  It is not a price list and not a way around Him — doing the deed does not put Him
                  in your debt.
                </p>
              </ContentCard>

              {/* ⛔ THIS CARD MUST NAME BOTH PLACES A QUALIFICATION CAN LIVE.
                  It used to name only "Note", which 13 rows carry — licensing
                  the inference that the other 30 have nothing to qualify. 17
                  more caveats sit behind the chevron under "What this does not
                  say", and a reader never told the rows open will not look.
                  The catalogue of four fiqh disputes that used to close this
                  paragraph is gone: each one is on its own row's caveat, and it
                  made this point 2.3× the length of the other two. */}
              <ContentCard delay={0.1}>
                <h2 className="text-xl font-semibold text-themed mb-2">
                  2 &middot; A promise is not a receipt.
                </h2>
                <p className="text-themed-muted text-sm leading-relaxed">
                  The narrations stand as reported, conditions included:{" "}
                  <em>said with conviction</em>, <em>without letting your mind wander</em>,{" "}
                  <em>both habits, not one</em>. Where the plain reading of a row would claim more
                  than that, the correction is on the row under{" "}
                  <span className="text-themed font-medium">Note</span>. Open any row and the
                  fuller version is under{" "}
                  <span className="text-themed font-medium">What this does not say</span> — that is
                  also where the page says so, and takes no side, wherever scholars differ.
                </p>
              </ContentCard>

              <ContentCard delay={0.15}>
                <h2 className="text-xl font-semibold text-themed mb-2">
                  3 &middot; The reference tells you where to check.
                </h2>
                <p className="text-themed-muted text-sm leading-relaxed">
                  Every reference on a row opens this app&rsquo;s own hadith reader or Qur&rsquo;an,
                  at the entry, in full, in Arabic. A{" "}
                  <span className="text-gold/70">&#8224;</span> means the collector recorded his own
                  remarks on that report inside the entry. This page never calls a narration sound
                  or weak in its own voice, and it has no named reviewing scholar yet — which is
                  exactly why that bar is set where it is.
                </p>
              </ContentCard>

              {/* ⛔ THIS CARD IS NOT OPTIONAL WHILE BOTH SCHEMES SHIP. The
                  Qur'an blocks take their transliteration from the app's own
                  Qur'an reader and the dhikr blocks from its dua collection, so
                  each matches wherever a reader would look that text up — but
                  the two spell long vowels differently, and the All view (the
                  default, and where every ?section= link lands) puts them within
                  a few rows of each other. A reader meets "laaa ilaaha illaa" in
                  Ayat al-Kursi and "La ilaha illallahu" on the tahlil rows, for
                  the same words, and has no way to tell that it is a house
                  convention rather than one of them being wrong. Explain it or
                  the page looks careless — do not "fix" it by rewriting either
                  source. The line above the tabs points here, because that is
                  the tab the collisions are actually on.

                  ⛔ EVERY EXAMPLE BELOW IS A STRING THAT ACTUALLY RENDERS —
                  CHECK BEFORE EDITING. An earlier version quoted "la ilaha
                  illa" as what "the tahlil rows" show; all four of them show
                  "La ilaha illallahu", fused, and the only row carrying the
                  quoted form is sayyid al-istighfar. It also promised that a
                  formula is "spelt identically" on every row, which the pause
                  rule and the wa huwa / wahwa split both contradict. A card
                  whose whole job is to stop a reader concluding the page is
                  careless has to be the most literally true thing on it. */}
              <ContentCard delay={0.2}>
                <h2 className="text-xl font-semibold text-themed mb-2">
                  4 &middot; Why the Latin is not always the same.
                </h2>
                <p className="text-themed-muted text-sm leading-relaxed">
                  The Latin under each piece of Arabic is a pronunciation aid, never a translation,
                  and it is spelt to match wherever you would look that text up next: Qur&rsquo;an
                  passages exactly as this app&rsquo;s Qur&rsquo;an reader spells them, dhikr as its
                  dua collection does. The two write long vowels differently — <em>laaa ilaaha
                  illaa</em> in Ayat al-Kursi against <em>La ilaha illallahu</em> on the tahlil rows
                  — and both say the same thing. Ayat al-Kursi and al-Ikhlas are in the dua
                  collection as well, in its spelling; on this page they follow the reader.
                </p>
                <p className="text-themed-muted text-sm leading-relaxed mt-3">
                  Among the dhikr, the Latin follows the narration each row quotes, so two rows
                  carrying one formula can differ by a letter. A word before a pause drops its final
                  {/* Quoted as JSX expressions, not with &rsquo;: the rows render the
                      corpus' STRAIGHT apostrophe, and a card that exists to prove the
                      page is careful must quote what is on the row to the character. */}
                  vowel — <em>{"SubhanAllahil-'azeem"}</em> where a break follows,{" "}
                  <em>{"'azeemi"}</em> where the phrase runs straight on. And where two collectors
                  wrote the same word with different vowels, each row is read as its own Arabic is
                  written: <em>wa huwa</em> where the ه carries a damma, <em>wahwa</em> — a syllable
                  shorter — where it carries a sukun. None of those is a slip. Read the Arabic above
                  each line and it is what is written there.
                </p>
              </ContentCard>

              <ContentCard delay={0.25}>
                <Narration hadithKey={CLOSING_QUOTE} />
              </ContentCard>

              <SourcesCard
                sources={dedupeRefs(
                  [CLOSING_QUOTE, HERO_QUOTE].map((k) => ({
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
