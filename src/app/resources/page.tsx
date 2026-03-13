"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import { ExternalLink } from "lucide-react";
import TabBar from "@/components/TabBar";

/* ───────────────────────── data ───────────────────────── */

type Resource = {
  name: string;
  nameAr?: string;
  author?: string;
  description: string;
  url?: string;
};

type Category = {
  id: string;
  title: string;
  items: Resource[];
};

const categories: Category[] = [
  {
    id: "hadith",
    title: "Hadith Collections",

    items: [
      {
        name: "Sahih al-Bukhari",
        nameAr: "صحيح البخاري",
        author: "Imam al-Bukhari (d. 256 AH)",
        description:
          "The most authentic collection of Hadith, containing 7,563 hadith. Universally accepted by scholars as the most reliable source after the Quran.",
        url: "https://sunnah.com/bukhari",
      },
      {
        name: "Sahih Muslim",
        nameAr: "صحيح مسلم",
        author: "Imam Muslim (d. 261 AH)",
        description:
          "The second most authentic collection, containing 7,500 hadith. Known for its rigorous methodology and organization by topic.",
        url: "https://sunnah.com/muslim",
      },
      {
        name: "Sunan Abu Dawud",
        nameAr: "سنن أبي داود",
        author: "Imam Abu Dawud (d. 275 AH)",
        description:
          "One of the six major collections, focusing on legal hadith relevant to Islamic jurisprudence (fiqh).",
        url: "https://sunnah.com/abudawud",
      },
      {
        name: "Jami at-Tirmidhi",
        nameAr: "جامع الترمذي",
        author: "Imam at-Tirmidhi (d. 279 AH)",
        description:
          "Known for grading each hadith and noting scholarly opinions. Includes commentary on the legal implications of narrations.",
        url: "https://sunnah.com/tirmidhi",
      },
      {
        name: "Sunan an-Nasa'i",
        nameAr: "سنن النسائي",
        author: "Imam an-Nasa'i (d. 303 AH)",
        description:
          "Known for its strict criteria in hadith authentication. Considered by some scholars to be the most stringent after the two Sahihs.",
        url: "https://sunnah.com/nasai",
      },
      {
        name: "Sunan Ibn Majah",
        nameAr: "سنن ابن ماجه",
        author: "Imam Ibn Majah (d. 273 AH)",
        description:
          "The sixth of the major collections (al-Kutub as-Sittah). Contains hadith on a wide range of topics including manners and asceticism.",
        url: "https://sunnah.com/ibnmajah",
      },
      {
        name: "Musnad Ahmad",
        nameAr: "مسند أحمد",
        author: "Imam Ahmad ibn Hanbal (d. 241 AH)",
        description:
          "One of the largest hadith collections with over 27,000 narrations, organized by the Companion who narrated each hadith.",
        url: "https://sunnah.com/ahmad",
      },
      {
        name: "Muwatta Malik",
        nameAr: "موطأ مالك",
        author: "Imam Malik ibn Anas (d. 179 AH)",
        description:
          "One of the earliest written compilations of hadith. Combines hadith with the practices of the people of Madinah.",
        url: "https://sunnah.com/malik",
      },
      {
        name: "Riyadh as-Salihin",
        nameAr: "رياض الصالحين",
        author: "Imam an-Nawawi (d. 676 AH)",
        description:
          "Garden of the Righteous — a beloved collection of hadith on virtues, manners, and daily life. A must-read for every Muslim.",
        url: "https://sunnah.com/riyadussalihin",
      },
    ],
  },
  {
    id: "tafsir",
    title: "Tafsir (Quran Commentary)",

    items: [
      {
        name: "Tafsir Ibn Kathir",
        nameAr: "تفسير ابن كثير",
        author: "Ibn Kathir (d. 774 AH)",
        description:
          "The most widely referenced commentary. Explains the Quran using the Quran, then the Sunnah, then statements of the Companions.",
        url: "https://quran.com/tafsirs",
      },
      {
        name: "Tafsir as-Sa'di",
        nameAr: "تفسير السعدي",
        author: "Shaykh Abdur-Rahman as-Sa'di (d. 1376 AH)",
        description:
          "Clear, concise, and accessible. Focuses on deriving practical lessons and benefits from each verse.",
      },
      {
        name: "Tafsir al-Jalalayn",
        nameAr: "تفسير الجلالين",
        author: "Jalal ad-Din al-Mahalli & Jalal ad-Din as-Suyuti",
        description:
          "A brief, word-by-word tafsir. Excellent for understanding the basic meaning of each verse quickly.",
      },
      {
        name: "Tafsir at-Tabari",
        nameAr: "تفسير الطبري",
        author: "Imam at-Tabari (d. 310 AH)",
        description:
          "One of the earliest and most comprehensive commentaries. Collects narrations from the Companions and their students for each verse.",
      },
      {
        name: "Ma'ariful Quran",
        nameAr: "معارف القرآن",
        author: "Mufti Muhammad Shafi (d. 1396 AH)",
        description:
          "A modern, thorough tafsir in Urdu (translated to English). Explains verses with practical context and Hanafi jurisprudence.",
      },
    ],
  },
  {
    id: "aqeedah",
    title: "Aqeedah (Creed & Belief)",
    items: [
      {
        name: "Kitab at-Tawhid",
        nameAr: "كتاب التوحيد",
        author: "Muhammad ibn Abd al-Wahhab (d. 1206 AH)",
        description:
          "The Book of Monotheism — a foundational text on Tawhid, explaining what it means to worship Allah alone with evidence from Quran and Sunnah.",
      },
      {
        name: "Al-Aqidah al-Wasitiyyah",
        nameAr: "العقيدة الواسطية",
        author: "Shaykh al-Islam Ibn Taymiyyah (d. 728 AH)",
        description:
          "A concise creed text outlining the beliefs of Ahl as-Sunnah wal-Jama'ah regarding Allah's names, attributes, and the unseen.",
      },
      {
        name: "Al-Aqidah at-Tahawiyyah",
        nameAr: "العقيدة الطحاوية",
        author: "Imam at-Tahawi (d. 321 AH)",
        description:
          "A brief, early creed text summarizing the beliefs agreed upon by the scholars of the Hanafi, Maliki, and Shafi'i schools.",
      },
      {
        name: "Sharh Usul al-Iman",
        nameAr: "شرح أصول الإيمان",
        author: "Shaykh Muhammad ibn Salih al-Uthaymeen (d. 1421 AH)",
        description:
          "An explanation of the fundamentals of faith — the six pillars of Iman — with evidences and scholarly commentary.",
      },
      {
        name: "The Book of Emaan",
        author: "Ibn Taymiyyah",
        description:
          "A detailed treatise on the reality of faith (Iman), its components, and how it increases and decreases according to the Quran and Sunnah.",
      },
    ],
  },
  {
    id: "fiqh",
    title: "Fiqh (Islamic Jurisprudence)",
    items: [
      {
        name: "Bulugh al-Maram",
        nameAr: "بلوغ المرام",
        author: "Ibn Hajar al-Asqalani (d. 852 AH)",
        description:
          "A collection of hadith used as the basis for rulings in Islamic law. Each hadith is graded and attributed to its source.",
      },
      {
        name: "Fiqh us-Sunnah",
        nameAr: "فقه السنة",
        author: "Sayyid Sabiq (d. 1420 AH)",
        description:
          "A modern, accessible fiqh book that presents rulings directly from the Quran and Sunnah, without strict adherence to one school.",
      },
      {
        name: "Umdatul-Ahkaam",
        nameAr: "عمدة الأحكام",
        author: "Abdul-Ghani al-Maqdisi (d. 600 AH)",
        description:
          "A concise collection of hadith from Bukhari and Muslim that form the basis of the most essential legal rulings.",
      },
      {
        name: "Al-Mulakhkhas al-Fiqhi",
        nameAr: "الملخص الفقهي",
        author: "Shaykh Salih al-Fawzan",
        description:
          "A comprehensive summary of Islamic fiqh covering worship, transactions, family law, and more.",
      },
    ],
  },
  {
    id: "seerah",
    title: "Seerah (Prophetic Biography)",
    items: [
      {
        name: "Ar-Raheeq al-Makhtum (The Sealed Nectar)",
        nameAr: "الرحيق المختوم",
        author: "Safiur-Rahman al-Mubarakpuri",
        description:
          "Award-winning biography of the Prophet Muhammad ﷺ. Comprehensive, well-sourced, and widely recommended as the best modern seerah book.",
      },
      {
        name: "As-Seerah an-Nabawiyyah",
        nameAr: "السيرة النبوية",
        author: "Ibn Hisham (d. 218 AH)",
        description:
          "The earliest surviving biography, based on the work of Ibn Ishaq. The primary classical source for the life of the Prophet ﷺ.",
      },
      {
        name: "Hayatus Sahabah",
        nameAr: "حياة الصحابة",
        author: "Muhammad Yusuf al-Kandhlawi",
        description:
          "Lives of the Companions — a rich collection of narrations about the sacrifices, character, and devotion of the Sahaba.",
      },
      {
        name: "Muhammad: His Life Based on the Earliest Sources",
        author: "Martin Lings",
        description:
          "A beautifully written English biography drawing from Ibn Ishaq, Ibn Hisham, and other early sources. Acclaimed for its literary quality.",
      },
    ],
  },
  {
    id: "websites",
    title: "Websites & Digital Libraries",
    items: [
      {
        name: "Sunnah.com",
        description:
          "The largest online hadith database with searchable collections in Arabic and English. All hadith in this app are sourced from here.",
        url: "https://sunnah.com",
      },
      {
        name: "Quran.com",
        description:
          "Beautiful Quran reader with multiple translations, reciters, and word-by-word analysis. Audio timestamps in this app are sourced from here.",
        url: "https://quran.com",
      },
      {
        name: "Islamqa.info",
        description:
          "Fatwa and Islamic Q&A site supervised by Shaykh Muhammad Salih al-Munajjid. Extensive, well-sourced answers on all topics.",
        url: "https://islamqa.info",
      },
      {
        name: "Islamqa.org",
        description:
          "Academic Islamic Q&A with answers from a panel of scholars. Covers fiqh, aqeedah, tafsir, and contemporary issues.",
        url: "https://islamqa.org",
      },
      {
        name: "Dorar.net",
        nameAr: "الدرر السنية",
        description:
          "A comprehensive Arabic encyclopedia of hadith grading, scholarly biographies, and Islamic encyclopedic content.",
        url: "https://dorar.net",
      },
      {
        name: "Al-Islam.org (Saudi Ministry)",
        description:
          "Free digital library with translations of the Quran, hadith collections, and classical Islamic texts in dozens of languages.",
        url: "https://al-islam.org",
      },
    ],
  },
  {
    id: "lectures",
    title: "Lecture Series & Channels",
    items: [
      {
        name: "Shaykh Assim al-Hakeem",
        description:
          "Clear, concise Q&A format. Covers everyday fiqh questions with evidence from the Quran and Sunnah.",
        url: "https://www.youtube.com/@assaborneoborneoassalamualaikum",
      },
      {
        name: "Shaykh Uthman ibn Farooq (One Message Foundation)",
        description:
          "Da'wah-focused content with street dawah, comparative religion debates, and Islamic education.",
        url: "https://www.youtube.com/@OneMessageFoundation",
      },
      {
        name: "Mufti Menk",
        description:
          "Motivational lectures on daily life, character development, and spiritual growth from a Quran and Sunnah perspective.",
        url: "https://www.youtube.com/@muaborhamza",
      },
      {
        name: "Bayyinah Institute (Nouman Ali Khan)",
        description:
          "In-depth Arabic linguistic analysis of the Quran. Excellent for understanding the depth and miracles of Quranic language.",
        url: "https://www.youtube.com/@baaboryyinahinstitute",
      },
      {
        name: "Islamic Guidance",
        description:
          "Compilations of lectures from various scholars on topics like the Day of Judgement, stories of the Prophets, and Islamic history.",
        url: "https://www.youtube.com/@IslamicGuidance",
      },
    ],
  },
  {
    id: "beginner",
    title: "For New Muslims & Beginners",
    items: [
      {
        name: "The Fundamentals of Tawheed",
        author: "Dr. Abu Ameenah Bilal Philips",
        description:
          "An accessible introduction to Islamic monotheism, explaining the three categories of Tawhid with clear examples.",
      },
      {
        name: "Don't Be Sad (La Tahzan)",
        nameAr: "لا تحزن",
        author: "Dr. A'id al-Qarni",
        description:
          "A widely loved book on finding peace, contentment, and purpose through an Islamic lens. Great for anyone going through hardship.",
      },
      {
        name: "Fortress of the Muslim (Hisn al-Muslim)",
        nameAr: "حصن المسلم",
        author: "Sa'id ibn Ali ibn Wahf al-Qahtani",
        description:
          "A pocket-sized collection of authentic duas and adhkar for every occasion — morning, evening, travel, prayer, and more.",
      },
      {
        name: "What Every Muslim Must Know about Purification",
        author: "Shaykh Muhammad Salih al-Uthaymeen",
        description:
          "A practical guide to wudu, ghusl, and tayammum with step-by-step instructions based on authentic hadith.",
      },
      {
        name: "33 Lessons for Every Muslim",
        author: "Shaykh Abdul-Aziz ibn Baz",
        description:
          "A concise booklet covering the essentials every Muslim should know: pillars of Islam, pillars of Iman, conditions of prayer, and more.",
      },
    ],
  },
];


/* ───────────────────────── component ───────────────────────── */

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("hadith");

  const activeCategory = categories.find((c) => c.id === activeTab)!;

  const filteredItems = activeCategory.items.filter((item) =>
    textMatch(
      search,
      activeCategory.title,
      item.name,
      item.nameAr || "",
      item.author || "",
      item.description
    )
  );

  return (
    <>
      <PageHeader
        title="Resources"
        titleAr="المصادر"
        subtitle="Authentic Islamic references, books, and sources for seeking beneficial knowledge."
      />

      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search resources..."
        className="mb-4"
      />

      <TabBar
        tabs={categories.map((c) => ({ key: c.id, label: c.title }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + search}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid gap-3"
        >
          {filteredItems.length === 0 ? (
            <ContentCard>
              <p className="text-themed-muted text-center py-4 text-sm">
                No resources found matching &quot;{search}&quot;
              </p>
            </ContentCard>
          ) : (
            filteredItems.map((item, i) => (
              <ContentCard key={item.name} delay={0.03 * i}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-themed">
                          {item.name}
                        </h3>
                        {item.nameAr && (
                          <p className="text-gold/70 text-sm font-arabic mt-0.5">
                            {item.nameAr}
                          </p>
                        )}
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 rounded-lg hover:bg-gold/10 transition-colors text-gold"
                          title="Open external link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    {item.author && (
                      <p className="text-xs text-gold/60 mt-1">
                        by {item.author}
                      </p>
                    )}
                    <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
