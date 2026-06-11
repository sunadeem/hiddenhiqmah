import {
  BookOpen,
  ScrollText,
  HandHeart,
  Landmark,
  Users,
  Shield,
  Star,
  Clock,
  Moon,
  CalendarDays,
  BookMarked,
  Crown,
  WandSparkles,
  Repeat,
  Infinity as InfinityIcon,
  GraduationCap,
  Trophy,
  ListChecks,
  HeartHandshake,
  HelpCircle,
  Languages,
  GitBranch,
  Bookmark,
  Settings as SettingsIcon,
} from "lucide-react";

export const dailyInspirations = [
  {
    type: "Quran",
    arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    english: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6",
  },
  {
    type: "Quran",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ",
    english:
      "And whoever puts their trust in Allah, then He is sufficient for them.",
    reference: "Quran 65:3",
  },
  {
    type: "Quran",
    arabic:
      "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    english:
      "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    reference: "Quran 2:152",
  },
  {
    type: "Quran",
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ",
    english:
      "And your Lord is going to give you, and you will be satisfied.",
    reference: "Quran 93:5",
  },
  {
    type: "Hadith",
    arabic:
      "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english:
      "Actions are judged by intentions, and every person will get what they intended.",
    reference: "Sahih al-Bukhari 1",
  },
  {
    type: "Hadith",
    arabic:
      "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english:
      "Whoever takes a path seeking knowledge, Allah will make easy for him a path to Paradise.",
    reference: "Sahih Muslim 2699",
  },
  {
    type: "Hadith",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best of you are those who learn the Quran and teach it.",
    reference: "Sahih al-Bukhari 5027",
  },
];

export type NavItem = {
  href: string;
  icon: typeof Users;
  title: string;
  titleAr: string;
  description?: string;
};

/**
 * Mirrors the website Sidebar (apps/web/src/components/Sidebar.tsx) exactly.
 * Used by mobile MoreSheet AND the web home page card grid.
 * Update this when adding/moving routes so both surfaces stay in sync.
 */
export const navSections: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Foundations",
    items: [
      { href: "/tawhid", icon: Shield, title: "Tawheed", titleAr: "التوحيد", description: "The Oneness of Allah" },
      { href: "/pillars", icon: Landmark, title: "Pillars", titleAr: "الأركان", description: "Shahada, Salah, Zakat, Sawm, Hajj" },
      { href: "/articles-of-faith", icon: Star, title: "Articles of Faith", titleAr: "أركان الإيمان", description: "The six pillars of Iman" },
    ],
  },
  {
    heading: "Scripture",
    items: [
      { href: "/quran", icon: BookOpen, title: "Quran", titleAr: "القرآن", description: "Arabic + translation + audio" },
      { href: "/hadith", icon: ScrollText, title: "Hadith", titleAr: "الحديث", description: "The six major collections" },
      { href: "/miracles", icon: WandSparkles, title: "Miracles", titleAr: "المعجزات", description: "Quranic, scientific, prophetic" },
    ],
  },
  {
    heading: "The Big Picture",
    items: [
      { href: "/story-of-creation", icon: InfinityIcon, title: "Story of Creation", titleAr: "قصة الخلق", description: "From before time to the eternal life" },
    ],
  },
  {
    heading: "The Prophets",
    items: [
      { href: "/prophets", icon: Users, title: "Prophets", titleAr: "الأنبياء", description: "Adam to Isa — 25 prophets" },
      { href: "/prophet-muhammad", icon: Crown, title: "Prophet Muhammad", titleAr: "النبي محمد ﷺ", description: "His life, character, family" },
    ],
  },
  {
    heading: "Life",
    items: [
      { href: "/muslim-daily", icon: ListChecks, title: "Muslim Daily", titleAr: "يوميات المسلم", description: "Morning adhkar, evening routines, checklist" },
      { href: "/duas", icon: HandHeart, title: "Duas", titleAr: "الدعاء", description: "Supplications for every situation" },
      { href: "/dhikr", icon: Repeat, title: "Dhikr", titleAr: "الذكر", description: "Tasbeeh and daily remembrance" },
      { href: "/family", icon: Users, title: "Family", titleAr: "الأسرة", description: "Parents, elders, family ties" },
      { href: "/marriage", icon: HeartHandshake, title: "Marriage", titleAr: "الزواج", description: "Nikah, rights, divorce" },
    ],
  },
  {
    heading: "Practice",
    items: [
      { href: "/salah", icon: Clock, title: "Salah", titleAr: "الصلاة", description: "The five daily prayers, step by step" },
      { href: "/ramadan", icon: Moon, title: "Ramadan", titleAr: "رمضان", description: "Fasting, Tarawih, Laylatul Qadr" },
      { href: "/kids", icon: GraduationCap, title: "Kids Learning", titleAr: "تعليم الأطفال", description: "Lessons + stories + quizzes for children" },
      { href: "/quiz", icon: Trophy, title: "Quizzes", titleAr: "اختبارات", description: "Test your Islamic knowledge" },
    ],
  },
  {
    heading: "Explore",
    items: [
      { href: "/why-islam", icon: HelpCircle, title: "Why Islam?", titleAr: "لماذا الإسلام؟", description: "Reasoned answers to common questions" },
      { href: "/learn-arabic", icon: Languages, title: "Learn Arabic", titleAr: "تعلم العربية", description: "Alphabet, vocabulary, grammar" },
      { href: "/sects", icon: GitBranch, title: "Islamic Sects", titleAr: "الفرق الإسلامية", description: "Sunni, Shia, and historical branches" },
      { href: "/islamic-calendar", icon: CalendarDays, title: "Islamic Calendar", titleAr: "التقويم الهجري", description: "Hijri months and important dates" },
      { href: "/resources", icon: BookMarked, title: "Resources", titleAr: "المصادر", description: "Books, scholars, recommendations" },
    ],
  },
  {
    heading: "My Path in Islam",
    items: [
      { href: "/bookmarks", icon: Bookmark, title: "Bookmarks", titleAr: "المحفوظات", description: "Saved verses, hadiths, and sections" },
      { href: "/settings", icon: SettingsIcon, title: "Settings", titleAr: "الإعدادات", description: "Account, notifications, audio, prayer" },
    ],
  },
];

export function pickTodaysInspiration() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyInspirations[dayOfYear % dailyInspirations.length];
}
