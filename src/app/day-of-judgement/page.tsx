"use client";

import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { Scale } from "lucide-react";

const events = [
  {
    title: "The Resurrection",
    text: "All of mankind will be resurrected barefoot, naked, and uncircumcised. The first to be clothed will be Prophet Ibrahim (peace be upon him).",
    reference: "Sahih al-Bukhari 3349",
  },
  {
    title: "The Standing",
    text: "The sun will be brought close to the people, about a mile away. People will be drowning in their own sweat according to their deeds — some to their ankles, some to their knees, some to their waists, and some will be bridled by it.",
    reference: "Sahih Muslim 2864",
  },
  {
    title: "The Scale (al-Mizan)",
    text: "The scales will be set up on the Day of Resurrection. Two words are light on the tongue, heavy on the scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.",
    reference: "Sahih al-Bukhari 6406",
  },
  {
    title: "The Bridge (as-Sirat)",
    text: "A bridge will be laid across Hellfire. The Prophet (peace be upon him) said: It is slippery, with hooks and thorns. People will cross it according to their deeds — some in the blink of an eye, some like lightning, some like wind, and some crawling.",
    reference: "Sahih Muslim 195",
  },
  {
    title: "The Intercession",
    text: "The Prophet Muhammad (peace be upon him) will be granted the great intercession (ash-Shafa'ah al-Uzma) when all other prophets decline, and he will prostrate before Allah to intercede for mankind.",
    reference: "Sahih al-Bukhari 4712",
  },
];

export default function DayOfJudgementPage() {
  return (
    <>
      <PageHeader
        title="Day of Judgement"
        titleAr="يوم القيامة"
        subtitle="The greatest day — when every soul will stand before Allah and be held accountable."
      />

      <ContentCard delay={0.1}>
        <div className="text-center py-4">
          <p className="text-lg font-arabic text-gold leading-loose mb-3">
            يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ
          </p>
          <p className="text-themed-muted italic">
            &ldquo;The Day when mankind will stand before the Lord of the worlds.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">Quran 83:6</p>
        </div>
      </ContentCard>

      <div className="grid gap-4 mt-6">
        {events.map((item, i) => (
          <ContentCard key={i} delay={0.15 + i * 0.05}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <Scale size={18} className="text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-themed mb-2">{item.title}</h3>
                <p className="text-themed-muted text-sm leading-relaxed">{item.text}</p>
                <p className="text-xs text-gold/60 mt-3">{item.reference}</p>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>

      <ContentCard delay={0.5} className="mt-6">
        <div className="text-center py-6 text-themed-muted">
          <p className="text-sm">Signs of the Hour, the minor and major signs, and detailed accounts coming soon.</p>
        </div>
      </ContentCard>
    </>
  );
}
