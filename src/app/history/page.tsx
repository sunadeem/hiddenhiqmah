"use client";

import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { History } from "lucide-react";

const events = [
  {
    year: "610 CE",
    title: "The First Revelation",
    description:
      "The angel Jibril (Gabriel) appeared to Prophet Muhammad (peace be upon him) in the Cave of Hira and revealed the first verses of the Quran: \"Read in the name of your Lord who created.\" (Quran 96:1)",
    reference: "Sahih al-Bukhari 3, Quran 96:1-5",
  },
  {
    year: "613 CE",
    title: "Public Preaching Begins",
    description:
      "After three years of private dawah, Allah commanded the Prophet (peace be upon him) to warn his closest relatives and preach openly. The Quraysh began their persecution of the early Muslims.",
    reference: "Quran 26:214, Sahih al-Bukhari 4770",
  },
  {
    year: "615 CE",
    title: "Migration to Abyssinia",
    description:
      "The Prophet (peace be upon him) instructed a group of persecuted Muslims to migrate to Abyssinia (modern-day Ethiopia), where the just Christian king, Najashi (Negus), granted them protection.",
    reference: "Musnad Ahmad 1740",
  },
  {
    year: "619 CE",
    title: "The Year of Sorrow",
    description:
      "The Prophet (peace be upon him) lost both his beloved wife Khadijah and his uncle Abu Talib — his two greatest supporters. This was one of the most difficult periods of his life.",
    reference: "Ibn Hisham, As-Sirah an-Nabawiyyah",
  },
  {
    year: "620 CE",
    title: "Al-Isra wal-Mi'raj",
    description:
      "The Night Journey and Ascension — the Prophet (peace be upon him) was taken from Makkah to Jerusalem (al-Aqsa), then ascended through the heavens where the five daily prayers were prescribed.",
    reference: "Sahih al-Bukhari 3887, Quran 17:1",
  },
  {
    year: "622 CE",
    title: "The Hijrah to Madinah",
    description:
      "The Prophet (peace be upon him) and Abu Bakr migrated from Makkah to Madinah, marking the beginning of the Islamic calendar. The Muslim community (Ummah) was established as a political and social entity.",
    reference: "Sahih al-Bukhari 3905",
  },
  {
    year: "624 CE",
    title: "Battle of Badr",
    description:
      "The first major battle in Islam. 313 Muslims faced over 1,000 Qurayshi warriors and were granted a decisive victory by Allah. The Quran refers to it as \"the Day of Criterion\" (Yawm al-Furqan).",
    reference: "Quran 3:123, Sahih al-Bukhari 3953",
  },
  {
    year: "625 CE",
    title: "Battle of Uhud",
    description:
      "The second major battle where the Muslims initially had the upper hand but suffered losses when archers left their posts. The Prophet (peace be upon him) was injured, and 70 companions were martyred including Hamza ibn Abdul-Muttalib.",
    reference: "Quran 3:121-128, Sahih al-Bukhari 4043",
  },
  {
    year: "627 CE",
    title: "Battle of the Trench (Khandaq)",
    description:
      "A confederation of 10,000 soldiers marched on Madinah. On the advice of Salman al-Farisi, the Muslims dug a trench around the city. After a lengthy siege, Allah sent winds and unseen forces that scattered the enemy.",
    reference: "Quran 33:9-11, Sahih al-Bukhari 4106",
  },
  {
    year: "628 CE",
    title: "Treaty of Hudaybiyyah",
    description:
      "A peace treaty between the Muslims and Quraysh that appeared unfavorable but was called a \"clear victory\" by Allah. It allowed Islam to spread peacefully, and more people embraced Islam in the next two years than in all previous years combined.",
    reference: "Quran 48:1, Sahih al-Bukhari 2731",
  },
  {
    year: "630 CE",
    title: "Conquest of Makkah",
    description:
      "After the Quraysh violated the Treaty of Hudaybiyyah, the Prophet (peace be upon him) marched on Makkah with 10,000 Muslims. The city was taken almost without bloodshed, and the Prophet granted a general amnesty. The Ka'bah was cleansed of 360 idols.",
    reference: "Sahih al-Bukhari 4280",
  },
  {
    year: "632 CE",
    title: "The Farewell Pilgrimage & Sermon",
    description:
      "The Prophet (peace be upon him) performed his only Hajj and delivered the Farewell Sermon at Arafat to over 100,000 companions, establishing fundamental principles of equality, justice, and the completion of the religion.",
    reference: "Sahih Muslim 1218, Quran 5:3",
  },
  {
    year: "632 CE",
    title: "The Passing of the Prophet",
    description:
      "The Prophet Muhammad (peace be upon him) passed away on 12 Rabi al-Awwal, 11 AH, in Madinah. Abu Bakr addressed the grieving companions: \"Whoever worshipped Muhammad, then Muhammad has died. But whoever worshipped Allah, then Allah is Ever-Living and shall never die.\"",
    reference: "Sahih al-Bukhari 1241-1242",
  },
  {
    year: "632-661 CE",
    title: "The Rightly Guided Caliphs",
    description:
      "The Khulafa ar-Rashidun: Abu Bakr as-Siddiq, Umar ibn al-Khattab, Uthman ibn Affan, and Ali ibn Abi Talib led the Muslim Ummah. Islam spread across Arabia, the Levant, Persia, Egypt, and North Africa. The Quran was compiled into a single manuscript.",
    reference: "Sunan at-Tirmidhi 2225",
  },
];

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        titleAr="التاريخ"
        subtitle="Key events in Islamic history from the first revelation to the Rightly Guided Caliphs."
      />

      <ContentCard delay={0.1}>
        <div className="text-center py-4">
          <p className="text-lg font-arabic text-gold leading-loose mb-3">
            لَقَدْ كَانَ فِى قَصَصِهِمْ عِبْرَةٌۭ لِّأُولِى ٱلْأَلْبَـٰبِ
          </p>
          <p className="text-themed-muted italic">
            &ldquo;There was certainly in their stories a lesson for those of understanding.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">Quran 12:111</p>
        </div>
      </ContentCard>

      {/* Timeline */}
      <div className="relative mt-8">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gold/20 hidden md:block" />

        <div className="space-y-4">
          {events.map((event, i) => (
            <ContentCard key={i} delay={0.1 + i * 0.04}>
              <div className="flex items-start gap-4">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <History size={20} className="text-gold" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap mb-1">
                    <span className="text-gold font-semibold text-sm">{event.year}</span>
                    <h3 className="font-semibold text-themed text-lg">{event.title}</h3>
                  </div>
                  <p className="text-themed-muted text-sm leading-relaxed">{event.description}</p>
                  <p className="text-xs text-gold/60 mt-2">{event.reference}</p>
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      </div>

      <ContentCard delay={0.7} className="mt-6">
        <div className="text-center py-6 text-themed-muted">
          <p className="text-sm">Detailed accounts of each event, the Umayyad and Abbasid periods, and the spread of Islam coming soon.</p>
        </div>
      </ContentCard>
    </>
  );
}
