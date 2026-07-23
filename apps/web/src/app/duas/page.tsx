"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import { ArrowLeft, Sun, HandHeart, Utensils, Plane, Home, Shield, Heart, Brain, Stethoscope, Users, BookOpen, CloudRain, Bed, Sparkles, Hand, Moon, HeartCrack, Handshake, type LucideIcon } from "lucide-react";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { getBookmarks, addBookmark, removeBookmark } from "@hidden-hiqmah/ui/lib/storage";
import duasData from "@hidden-hiqmah/content/duas.json";

type Dua = {
  /** Stable slug — bookmark ids and ?d= deep links depend on it; never renumber. */
  id: string;
  tags: string[];
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  when: string;
  repeat?: string;
  virtue?: string;
};

/** Landing-grid sections — grouped so the growing grid stays scannable on mobile. */
const sectionOrder = ["Start Here", "Daily Rhythm", "Life Moments", "Heart & Hardship"] as const;

type Category = {
  key: string;
  section: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

/** JSON stores each category's icon as a lucide component name; map it back to
 *  the actual component so the landing grid can render <cat.icon />. */
const iconMap: Record<string, LucideIcon> = {
  Sparkles, Hand, Sun, HandHeart, Bed, Utensils, Home, Plane, Moon, Users,
  HeartCrack, Handshake, CloudRain, Shield, Heart, Brain, Stethoscope, BookOpen,
};

const categories: Category[] = duasData.categories.map((c) => ({
  key: c.key,
  section: c.section,
  label: c.label,
  icon: iconMap[c.icon],
  description: c.description,
}));

const duas: Dua[] = duasData.duas as Dua[];

/** Legacy ?d= deep links used array indexes; map them onto the stable ids. */
function resolveDuaParam(raw: string | null): string | null {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return duas[Number(raw)]?.id ?? null;
  return raw;
}

/** One-time rewrite of legacy index-based dua bookmarks (id "dua-<N>") onto the
 *  stable slug ids, so old saves register as saved again. Idempotent — after
 *  the rewrite no legacy ids remain. The duas array order is unchanged since
 *  the index era, so the index → slug mapping is exact. */
function migrateLegacyDuaBookmarks() {
  try {
    for (const b of getBookmarks()) {
      if (b.type !== "dua") continue;
      const m = /^dua-(\d+)$/.exec(b.id);
      if (!m) continue;
      const target = duas[Number(m[1])];
      removeBookmark("dua", b.id);
      if (target) {
        addBookmark({
          type: "dua",
          id: target.id,
          title: b.title || target.title,
          subtitle: b.subtitle,
          href: `/duas?d=${target.id}`,
        });
      }
    }
  } catch {
    /* non-browser / storage unavailable */
  }
}

function DuasContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const scrollToDua = resolveDuaParam(searchParams.get("d"));

  useEffect(() => {
    migrateLegacyDuaBookmarks();
  }, []);

  // null = category landing grid; ?tab= deep links (and ?d= links, which need
  // their dua's card rendered to scroll to) skip the landing.
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    const tab = searchParams.get("tab");
    const validTab = tab && categories.some((c) => c.key === tab) ? tab : null;
    const targetDua = scrollToDua ? duas.find((d) => d.id === scrollToDua) : undefined;
    if (targetDua && !(validTab && targetDua.tags.includes(validTab))) return targetDua.tags[0];
    return validTab;
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!scrollToDua) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`dua-${scrollToDua}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("section-highlight");
        setTimeout(() => el.classList.remove("section-highlight"), 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [scrollToDua]);

  const selectCategory = (key: string | null) => {
    setActiveCategory(key);
    router.replace(key ? `${pathname}?tab=${key}` : pathname, { scroll: false });
  };

  const searchLower = search.toLowerCase().trim();
  const isSearching = searchLower.length >= 2;

  // Search is global — it matches across every category, landing or not.
  const filtered = isSearching
    ? duas.filter((d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.translation.toLowerCase().includes(searchLower) ||
        d.transliteration.toLowerCase().includes(searchLower) ||
        d.source.toLowerCase().includes(searchLower) ||
        d.when.toLowerCase().includes(searchLower) ||
        (d.virtue && d.virtue.toLowerCase().includes(searchLower))
      )
    : activeCategory
      ? duas.filter((d) => d.tags.includes(activeCategory))
      : [];

  const counts: Record<string, number> = {};
  categories.forEach((cat) => {
    counts[cat.key] = duas.filter((d) => d.tags.includes(cat.key)).length;
  });

  const activeCat = categories.find((c) => c.key === activeCategory);

  // Page hero — reuses the exact strings of the Dua of Yunus card below.
  const heroDua = duas.find((d) => d.id === "dua-of-yunus");

  // One dua card — rendered by both the category list and global search results
  const renderDuaCard = (dua: Dua, i: number) => {
    const displayTag = !isSearching && activeCategory ? activeCategory : dua.tags[0];
    const catLabel = categories.find((c) => c.key === displayTag)?.label ?? displayTag;

    return (
      <ContentCard key={dua.id} delay={Math.min(i * 0.05, 0.4)} id={`dua-${dua.id}`}>
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs text-gold font-medium">{catLabel}</span>
              <h2 className="text-xl font-semibold text-themed mt-1">{dua.title}</h2>
            </div>
            <BookmarkButton
              type="dua"
              id={dua.id}
              title={dua.title}
              subtitle={dua.source}
              href={`/duas?d=${dua.id}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {dua.repeat && (
              <span className="text-[11px] px-2.5 py-1 rounded-full border bg-[var(--color-gold)]/10 text-gold border-[var(--color-gold)]/30">
                {dua.repeat}
              </span>
            )}
            <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
              {dua.when}
            </span>
          </div>
        </div>

        {/* Arabic + Transliteration + Translation */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="text-2xl font-arabic text-gold text-right leading-loose mb-3">
            {dua.arabic}
          </p>
          <p className="text-themed-muted italic text-sm mb-2">
            {dua.transliteration}
          </p>
          <p className="text-themed text-sm">
            &ldquo;{dua.translation}&rdquo;
          </p>
        </div>

        {/* Virtue */}
        {dua.virtue && (
          <div className="rounded-lg p-3 mb-4 border border-emerald-400/30 bg-emerald-400/10">
            <p className="text-xs font-medium text-emerald-400 mb-1">Virtue</p>
            <p className="text-emerald-400 text-sm leading-relaxed opacity-90">
              {dua.virtue}
            </p>
          </div>
        )}

        {/* Source */}
        <div className="border-t sidebar-border pt-3">
          <p className="text-xs text-themed-muted">
            Source: <strong className="text-themed"><HadithRefText text={dua.source} /></strong>
          </p>
        </div>
      </ContentCard>
    );
  };

  return (
    <div>
      <PageHeader
        title="Duas & Supplications"
        titleAr="الأدعية والأذكار"
        subtitle="Authentic daily supplications with Arabic, transliteration, translation, and virtues"
      />

      {/* Opening dua — the dua of Yunus (built from this page's own data) */}
      {heroDua && (
        <VerseHero
          arabic={heroDua.arabic}
          text={heroDua.translation}
          reference={heroDua.source}
        />
      )}

      {/* Search — global across every category, landing or not */}
      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search all duas..."
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {isSearching ? (
          /* Global search results */
          <motion.div
            key={`search-${searchLower}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {filtered.map(renderDuaCard)}
            {filtered.length === 0 && (
              <p className="text-sm text-themed-muted py-8 text-center">
                No duas found matching &ldquo;{search}&rdquo;
              </p>
            )}
            {filtered.length > 0 && (
              <SourcesCard
                sources={filtered.map((d) => ({ ref: d.source, desc: d.title }))}
              />
            )}
          </motion.div>
        ) : activeCategory ? (
          /* Category dua list */
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => selectCategory(null)}
              className="flex items-center gap-1.5 text-sm text-themed-muted hover:text-gold transition-colors mb-4"
            >
              <ArrowLeft size={15} />
              All categories
            </button>
            <div className="flex items-center gap-2 mb-5">
              {activeCat && <activeCat.icon size={18} className="text-gold" />}
              <h2 className="text-lg font-semibold text-themed">{activeCat?.label}</h2>
              <span className="text-sm text-themed-muted">({filtered.length})</span>
            </div>

            {/* Most Powerful description */}
            {activeCategory === "powerful" && (
              <div className="rounded-xl p-5 mb-6 border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                <h3 className="text-gold font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Why These Duas Are the Most Powerful
                </h3>
                <p className="text-sm text-themed-muted leading-relaxed mb-3">
                  These are not opinions or rankings — each of these duas carries an <strong className="text-themed">explicit, extraordinary promise</strong> from the Prophet Muhammad (peace be upon him), narrated in Sahih al-Bukhari and Sahih Muslim, the two most rigorously authenticated hadith collections. Scholars across all schools of thought agree on their virtues.
                </p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside">
                  <li><strong className="text-themed">Sayyid al-Istighfar</strong> — The Prophet called it the <em>master</em> of all istighfar; promised Paradise for whoever says it with conviction</li>
                  <li><strong className="text-themed">Ayatul Kursi</strong> — The greatest verse in the Quran; guaranteed protection at night and nothing prevents Paradise except death</li>
                  <li><strong className="text-themed">The Three Quls</strong> — &ldquo;Will suffice you against everything&rdquo; — a comprehensive shield</li>
                  <li><strong className="text-themed">Dua of Yunus</strong> — &ldquo;No Muslim supplicates with this except that Allah answers&rdquo; — a guaranteed response</li>
                  <li><strong className="text-themed">Tahleel (100x)</strong> — Equivalent to freeing ten slaves; a fortress from Shaytan until evening</li>
                  <li><strong className="text-themed">SubhanAllah wa Bihamdihi (100x)</strong> — Sins forgiven even if like the foam of the sea</li>
                  <li><strong className="text-themed">Tasbeeh After Prayer</strong> — Same promise of total sin forgiveness after every obligatory prayer</li>
                  <li><strong className="text-themed">After the Adhan</strong> — The Prophet&rsquo;s intercession on the Day of Judgement granted to the one who says it</li>
                  <li><strong className="text-themed">Hasbunallah</strong> — Said by Ibrahim when thrown into fire and by the Prophet when armies gathered against him</li>
                  <li><strong className="text-themed">Rabbana Atina</strong> — The Prophet&rsquo;s <em>most frequent</em> invocation; gathers the good of both worlds and refuge from the Fire</li>
                </ul>
              </div>
            )}

            {/* Making Dua explainer */}
            {activeCategory === "making-dua" && (
              <div className="rounded-xl p-5 mb-6 border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                <h3 className="text-gold font-semibold mb-2 flex items-center gap-2">
                  <Hand size={16} />
                  How Dua Is Answered
                </h3>
                <p className="text-sm text-themed-muted leading-relaxed mb-3">
                  Dua is worship in itself. The Prophet Muhammad (peace be upon him) taught both an <strong className="text-themed">etiquette</strong> for supplicating and the <strong className="text-themed">times</strong> when a dua is most likely to be answered.
                </p>
                <p className="text-xs font-semibold text-themed mb-1.5">The manners of dua</p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside mb-3">
                  <li>Begin by praising Allah and sending blessings upon the Prophet, then ask.</li>
                  <li>Do not be hasty — the Prophet taught that a servant&rsquo;s dua is answered as long as he does not grow impatient and give up, complaining that he supplicated but received no answer. (Bukhari 80:37)</li>
                  <li>Eat, drink, and earn only what is lawful — a man whose food and clothing are unlawful raises his hands, but &ldquo;How can then his supplication be accepted?&rdquo; (Muslim 12:83)</li>
                  <li>Ask with certainty that Allah will respond, and never invoke against yourself or your family.</li>
                </ul>
                <p className="text-xs font-semibold text-themed mb-1.5">The golden windows</p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside">
                  <li>The last third of the night, when Allah descends to the lowest heaven and calls out, asking who is invoking Him that He may answer, and who is asking Him that He may give. (Bukhari 80:18)</li>
                  <li>Between the adhan and the iqamah — &ldquo;The supplication made between the adhan and the iqamah is not rejected.&rdquo; (Abu Dawud 2:131)</li>
                  <li>While prostrating — &ldquo;The nearest a servant comes to his Lord is when he is prostrating himself, so make supplication.&rdquo; (Muslim 4:245)</li>
                  <li>While fasting, on Laylat al-Qadr, and on the Day of Arafah.</li>
                </ul>
              </div>
            )}

            <div className="space-y-5">
              {filtered.map(renderDuaCard)}
            </div>

            {filtered.length > 0 && (
              <SourcesCard
                className="mt-5"
                sources={filtered.map((d) => ({ ref: d.source, desc: d.title }))}
              />
            )}
          </motion.div>
        ) : (
          /* Category landing grid */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {sectionOrder.map((section) => (
              <div key={section}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-themed-muted mb-3">
                  {section}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories
                    .filter((cat) => cat.section === section)
                    .map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => selectCategory(cat.key)}
                        className={`card-bg border rounded-xl p-4 text-left transition-colors hover:border-[var(--color-gold)]/50 ${
                          cat.key === "powerful" ? "border-[var(--color-gold)]/40" : "sidebar-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-gold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                            <cat.icon size={16} />
                          </span>
                          <span>
                            <span className="block font-medium text-themed">{cat.label}</span>
                            <span className="text-xs text-themed-muted">
                              {counts[cat.key]} {counts[cat.key] === 1 ? "dua" : "duas"}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-themed-muted leading-relaxed">{cat.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DuasPage() {
  return <Suspense><DuasContent /></Suspense>;
}
