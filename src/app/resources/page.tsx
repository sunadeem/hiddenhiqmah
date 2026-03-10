"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import { BookMarked, ExternalLink } from "lucide-react";

const categories = [
  {
    title: "Hadith Collections",
    items: [
      { name: "Sahih al-Bukhari", description: "The most authentic collection of Hadith, compiled by Imam al-Bukhari (d. 256 AH)." },
      { name: "Sahih Muslim", description: "The second most authentic collection, compiled by Imam Muslim (d. 261 AH)." },
      { name: "Sunan Abu Dawud", description: "One of the six major collections, focusing on legal hadith." },
      { name: "Jami at-Tirmidhi", description: "Known for grading hadith and noting scholarly opinions." },
      { name: "Sunan an-Nasa'i", description: "Known for its strict criteria in hadith authentication." },
      { name: "Sunan Ibn Majah", description: "The sixth of the major collections (al-Kutub as-Sittah)." },
    ],
  },
  {
    title: "Tafsir (Quran Commentary)",
    items: [
      { name: "Tafsir Ibn Kathir", description: "One of the most widely referenced commentaries, based on narrations." },
      { name: "Tafsir as-Sa'di", description: "Clear and concise commentary by Shaykh as-Sa'di." },
      { name: "Tafsir al-Jalalayn", description: "A brief, accessible tafsir by two scholars named Jalal ad-Din." },
    ],
  },
  {
    title: "Islamic Scholarship",
    items: [
      { name: "Riyadh as-Salihin", description: "Garden of the Righteous — a collection of hadith on virtues and manners by Imam an-Nawawi." },
      { name: "Kitab at-Tawhid", description: "The Book of Monotheism by Muhammad ibn Abd al-Wahhab." },
      { name: "Al-Aqidah al-Wasitiyyah", description: "A concise creed text by Shaykh al-Islam Ibn Taymiyyah." },
    ],
  },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        textMatch(search, cat.title, item.name, item.description)
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      <PageHeader
        title="Resources"
        titleAr="المصادر"
        subtitle="Authentic Islamic references and sources used throughout this app."
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search resources..." className="mb-6" />

      <div className="space-y-6 mt-2">
        {filteredCategories.map((category, ci) => (
          <div key={category.title}>
            <h2 className="text-lg font-semibold text-themed mb-3 flex items-center gap-2">
              <BookMarked size={18} className="text-gold" />
              {category.title}
            </h2>
            <div className="grid gap-3">
              {category.items.map((item, i) => (
                <ContentCard key={item.name} delay={0.05 + ci * 0.1 + i * 0.03}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-themed">{item.name}</h3>
                      <p className="text-themed-muted text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                </ContentCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ContentCard delay={0.6} className="mt-6">
        <div className="text-center py-6 text-themed-muted">
          <p className="text-sm">Links to digital libraries, recommended reading lists, and downloadable content coming soon.</p>
        </div>
      </ContentCard>
    </>
  );
}
