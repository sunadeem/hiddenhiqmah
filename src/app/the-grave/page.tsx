"use client";

import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { Flame } from "lucide-react";

const narrations = [
  {
    title: "The Questioning",
    text: "When a person is placed in their grave, two angels come and ask three questions: Who is your Lord? What is your religion? Who is this man who was sent among you?",
    reference: "Sahih al-Bukhari 1338, Sahih Muslim 2870",
  },
  {
    title: "The Believer's Answer",
    text: "The believer will say: My Lord is Allah, my religion is Islam, and he is Muhammad, the Messenger of Allah. A caller from heaven will say: My servant has spoken the truth, so spread for him a bed from Paradise and clothe him from Paradise, and open for him a gate to Paradise.",
    reference: "Abu Dawud 4753, graded Sahih",
  },
  {
    title: "Protection from the Punishment",
    text: "Surah al-Mulk (Chapter 67) is the protector — it will protect from the punishment of the grave.",
    reference: "Sunan at-Tirmidhi 2890",
  },
  {
    title: "Seeking Refuge",
    text: "The Prophet (peace be upon him) used to seek refuge from the punishment of the grave and would instruct his companions to do so in every prayer.",
    reference: "Sahih Muslim 588",
  },
];

export default function TheGravePage() {
  return (
    <>
      <PageHeader
        title="The Grave"
        titleAr="القبر"
        subtitle="The life of al-Barzakh — what happens after death according to authentic sources."
      />

      <ContentCard delay={0.1}>
        <div className="text-center py-4">
          <p className="text-lg font-arabic text-gold leading-loose mb-3">
            وَمِن وَرَآئِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ
          </p>
          <p className="text-themed-muted italic">
            &ldquo;And behind them is a barrier (Barzakh) until the Day they are resurrected.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">Quran 23:100</p>
        </div>
      </ContentCard>

      <div className="grid gap-4 mt-6">
        {narrations.map((item, i) => (
          <ContentCard key={i} delay={0.15 + i * 0.05}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <Flame size={18} className="text-gold" />
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

      <ContentCard delay={0.45} className="mt-6">
        <div className="text-center py-6 text-themed-muted">
          <p className="text-sm">More on the soul&apos;s journey, dreams of the deceased, and protective deeds coming soon.</p>
        </div>
      </ContentCard>
    </>
  );
}
