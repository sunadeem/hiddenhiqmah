"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Search,
  BookOpen,
  Eye,
  EyeOff,
  Play,
  Pause,
  Share2,
  Minus,
  Plus,
  Check,
  SkipForward,
  SkipBack,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BookmarkButton from "@/components/BookmarkButton";
import chapters from "@/data/quran/chapters.json";
import { getFontSize, setFontSize as saveFontSize, markSurahRead } from "@/lib/storage";
import { useQuranAudio, type Verse } from "@/context/QuranAudioContext";

type TafsirData = Record<string, string>;
type TafsirImportMap = Record<number, () => Promise<{ default: TafsirData }>>;
type TafsirSource = "ibn-kathir" | "maarif";

// Word-level audio timestamps: { "verseNum": [[start_ms, end_ms], ...] }
type TimestampData = Record<string, number[][]>;

const TAFSIR_LABELS: Record<TafsirSource, string> = {
  "ibn-kathir": "Ibn Kathir",
  maarif: "Ma'arif al-Qur'an",
};

function toArabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669"[parseInt(d)]);
}

// Static imports for all 114 surahs — Next.js needs deterministic import paths
const verseImports: Record<number, () => Promise<{ default: Verse[] }>> = {
  1: () => import("@/data/quran/verses/1.json"),
  2: () => import("@/data/quran/verses/2.json"),
  3: () => import("@/data/quran/verses/3.json"),
  4: () => import("@/data/quran/verses/4.json"),
  5: () => import("@/data/quran/verses/5.json"),
  6: () => import("@/data/quran/verses/6.json"),
  7: () => import("@/data/quran/verses/7.json"),
  8: () => import("@/data/quran/verses/8.json"),
  9: () => import("@/data/quran/verses/9.json"),
  10: () => import("@/data/quran/verses/10.json"),
  11: () => import("@/data/quran/verses/11.json"),
  12: () => import("@/data/quran/verses/12.json"),
  13: () => import("@/data/quran/verses/13.json"),
  14: () => import("@/data/quran/verses/14.json"),
  15: () => import("@/data/quran/verses/15.json"),
  16: () => import("@/data/quran/verses/16.json"),
  17: () => import("@/data/quran/verses/17.json"),
  18: () => import("@/data/quran/verses/18.json"),
  19: () => import("@/data/quran/verses/19.json"),
  20: () => import("@/data/quran/verses/20.json"),
  21: () => import("@/data/quran/verses/21.json"),
  22: () => import("@/data/quran/verses/22.json"),
  23: () => import("@/data/quran/verses/23.json"),
  24: () => import("@/data/quran/verses/24.json"),
  25: () => import("@/data/quran/verses/25.json"),
  26: () => import("@/data/quran/verses/26.json"),
  27: () => import("@/data/quran/verses/27.json"),
  28: () => import("@/data/quran/verses/28.json"),
  29: () => import("@/data/quran/verses/29.json"),
  30: () => import("@/data/quran/verses/30.json"),
  31: () => import("@/data/quran/verses/31.json"),
  32: () => import("@/data/quran/verses/32.json"),
  33: () => import("@/data/quran/verses/33.json"),
  34: () => import("@/data/quran/verses/34.json"),
  35: () => import("@/data/quran/verses/35.json"),
  36: () => import("@/data/quran/verses/36.json"),
  37: () => import("@/data/quran/verses/37.json"),
  38: () => import("@/data/quran/verses/38.json"),
  39: () => import("@/data/quran/verses/39.json"),
  40: () => import("@/data/quran/verses/40.json"),
  41: () => import("@/data/quran/verses/41.json"),
  42: () => import("@/data/quran/verses/42.json"),
  43: () => import("@/data/quran/verses/43.json"),
  44: () => import("@/data/quran/verses/44.json"),
  45: () => import("@/data/quran/verses/45.json"),
  46: () => import("@/data/quran/verses/46.json"),
  47: () => import("@/data/quran/verses/47.json"),
  48: () => import("@/data/quran/verses/48.json"),
  49: () => import("@/data/quran/verses/49.json"),
  50: () => import("@/data/quran/verses/50.json"),
  51: () => import("@/data/quran/verses/51.json"),
  52: () => import("@/data/quran/verses/52.json"),
  53: () => import("@/data/quran/verses/53.json"),
  54: () => import("@/data/quran/verses/54.json"),
  55: () => import("@/data/quran/verses/55.json"),
  56: () => import("@/data/quran/verses/56.json"),
  57: () => import("@/data/quran/verses/57.json"),
  58: () => import("@/data/quran/verses/58.json"),
  59: () => import("@/data/quran/verses/59.json"),
  60: () => import("@/data/quran/verses/60.json"),
  61: () => import("@/data/quran/verses/61.json"),
  62: () => import("@/data/quran/verses/62.json"),
  63: () => import("@/data/quran/verses/63.json"),
  64: () => import("@/data/quran/verses/64.json"),
  65: () => import("@/data/quran/verses/65.json"),
  66: () => import("@/data/quran/verses/66.json"),
  67: () => import("@/data/quran/verses/67.json"),
  68: () => import("@/data/quran/verses/68.json"),
  69: () => import("@/data/quran/verses/69.json"),
  70: () => import("@/data/quran/verses/70.json"),
  71: () => import("@/data/quran/verses/71.json"),
  72: () => import("@/data/quran/verses/72.json"),
  73: () => import("@/data/quran/verses/73.json"),
  74: () => import("@/data/quran/verses/74.json"),
  75: () => import("@/data/quran/verses/75.json"),
  76: () => import("@/data/quran/verses/76.json"),
  77: () => import("@/data/quran/verses/77.json"),
  78: () => import("@/data/quran/verses/78.json"),
  79: () => import("@/data/quran/verses/79.json"),
  80: () => import("@/data/quran/verses/80.json"),
  81: () => import("@/data/quran/verses/81.json"),
  82: () => import("@/data/quran/verses/82.json"),
  83: () => import("@/data/quran/verses/83.json"),
  84: () => import("@/data/quran/verses/84.json"),
  85: () => import("@/data/quran/verses/85.json"),
  86: () => import("@/data/quran/verses/86.json"),
  87: () => import("@/data/quran/verses/87.json"),
  88: () => import("@/data/quran/verses/88.json"),
  89: () => import("@/data/quran/verses/89.json"),
  90: () => import("@/data/quran/verses/90.json"),
  91: () => import("@/data/quran/verses/91.json"),
  92: () => import("@/data/quran/verses/92.json"),
  93: () => import("@/data/quran/verses/93.json"),
  94: () => import("@/data/quran/verses/94.json"),
  95: () => import("@/data/quran/verses/95.json"),
  96: () => import("@/data/quran/verses/96.json"),
  97: () => import("@/data/quran/verses/97.json"),
  98: () => import("@/data/quran/verses/98.json"),
  99: () => import("@/data/quran/verses/99.json"),
  100: () => import("@/data/quran/verses/100.json"),
  101: () => import("@/data/quran/verses/101.json"),
  102: () => import("@/data/quran/verses/102.json"),
  103: () => import("@/data/quran/verses/103.json"),
  104: () => import("@/data/quran/verses/104.json"),
  105: () => import("@/data/quran/verses/105.json"),
  106: () => import("@/data/quran/verses/106.json"),
  107: () => import("@/data/quran/verses/107.json"),
  108: () => import("@/data/quran/verses/108.json"),
  109: () => import("@/data/quran/verses/109.json"),
  110: () => import("@/data/quran/verses/110.json"),
  111: () => import("@/data/quran/verses/111.json"),
  112: () => import("@/data/quran/verses/112.json"),
  113: () => import("@/data/quran/verses/113.json"),
  114: () => import("@/data/quran/verses/114.json"),
};

const ibnKathirImports: TafsirImportMap = {
  1: () => import("@/data/quran/tafsirs/ibn-kathir/1.json"),
  2: () => import("@/data/quran/tafsirs/ibn-kathir/2.json"),
  3: () => import("@/data/quran/tafsirs/ibn-kathir/3.json"),
  4: () => import("@/data/quran/tafsirs/ibn-kathir/4.json"),
  5: () => import("@/data/quran/tafsirs/ibn-kathir/5.json"),
  6: () => import("@/data/quran/tafsirs/ibn-kathir/6.json"),
  7: () => import("@/data/quran/tafsirs/ibn-kathir/7.json"),
  8: () => import("@/data/quran/tafsirs/ibn-kathir/8.json"),
  9: () => import("@/data/quran/tafsirs/ibn-kathir/9.json"),
  10: () => import("@/data/quran/tafsirs/ibn-kathir/10.json"),
  11: () => import("@/data/quran/tafsirs/ibn-kathir/11.json"),
  12: () => import("@/data/quran/tafsirs/ibn-kathir/12.json"),
  13: () => import("@/data/quran/tafsirs/ibn-kathir/13.json"),
  14: () => import("@/data/quran/tafsirs/ibn-kathir/14.json"),
  15: () => import("@/data/quran/tafsirs/ibn-kathir/15.json"),
  16: () => import("@/data/quran/tafsirs/ibn-kathir/16.json"),
  17: () => import("@/data/quran/tafsirs/ibn-kathir/17.json"),
  18: () => import("@/data/quran/tafsirs/ibn-kathir/18.json"),
  19: () => import("@/data/quran/tafsirs/ibn-kathir/19.json"),
  20: () => import("@/data/quran/tafsirs/ibn-kathir/20.json"),
  21: () => import("@/data/quran/tafsirs/ibn-kathir/21.json"),
  22: () => import("@/data/quran/tafsirs/ibn-kathir/22.json"),
  23: () => import("@/data/quran/tafsirs/ibn-kathir/23.json"),
  24: () => import("@/data/quran/tafsirs/ibn-kathir/24.json"),
  25: () => import("@/data/quran/tafsirs/ibn-kathir/25.json"),
  26: () => import("@/data/quran/tafsirs/ibn-kathir/26.json"),
  27: () => import("@/data/quran/tafsirs/ibn-kathir/27.json"),
  28: () => import("@/data/quran/tafsirs/ibn-kathir/28.json"),
  29: () => import("@/data/quran/tafsirs/ibn-kathir/29.json"),
  30: () => import("@/data/quran/tafsirs/ibn-kathir/30.json"),
  31: () => import("@/data/quran/tafsirs/ibn-kathir/31.json"),
  32: () => import("@/data/quran/tafsirs/ibn-kathir/32.json"),
  33: () => import("@/data/quran/tafsirs/ibn-kathir/33.json"),
  34: () => import("@/data/quran/tafsirs/ibn-kathir/34.json"),
  35: () => import("@/data/quran/tafsirs/ibn-kathir/35.json"),
  36: () => import("@/data/quran/tafsirs/ibn-kathir/36.json"),
  37: () => import("@/data/quran/tafsirs/ibn-kathir/37.json"),
  38: () => import("@/data/quran/tafsirs/ibn-kathir/38.json"),
  39: () => import("@/data/quran/tafsirs/ibn-kathir/39.json"),
  40: () => import("@/data/quran/tafsirs/ibn-kathir/40.json"),
  41: () => import("@/data/quran/tafsirs/ibn-kathir/41.json"),
  42: () => import("@/data/quran/tafsirs/ibn-kathir/42.json"),
  43: () => import("@/data/quran/tafsirs/ibn-kathir/43.json"),
  44: () => import("@/data/quran/tafsirs/ibn-kathir/44.json"),
  45: () => import("@/data/quran/tafsirs/ibn-kathir/45.json"),
  46: () => import("@/data/quran/tafsirs/ibn-kathir/46.json"),
  47: () => import("@/data/quran/tafsirs/ibn-kathir/47.json"),
  48: () => import("@/data/quran/tafsirs/ibn-kathir/48.json"),
  49: () => import("@/data/quran/tafsirs/ibn-kathir/49.json"),
  50: () => import("@/data/quran/tafsirs/ibn-kathir/50.json"),
  51: () => import("@/data/quran/tafsirs/ibn-kathir/51.json"),
  52: () => import("@/data/quran/tafsirs/ibn-kathir/52.json"),
  53: () => import("@/data/quran/tafsirs/ibn-kathir/53.json"),
  54: () => import("@/data/quran/tafsirs/ibn-kathir/54.json"),
  55: () => import("@/data/quran/tafsirs/ibn-kathir/55.json"),
  56: () => import("@/data/quran/tafsirs/ibn-kathir/56.json"),
  57: () => import("@/data/quran/tafsirs/ibn-kathir/57.json"),
  58: () => import("@/data/quran/tafsirs/ibn-kathir/58.json"),
  59: () => import("@/data/quran/tafsirs/ibn-kathir/59.json"),
  60: () => import("@/data/quran/tafsirs/ibn-kathir/60.json"),
  61: () => import("@/data/quran/tafsirs/ibn-kathir/61.json"),
  62: () => import("@/data/quran/tafsirs/ibn-kathir/62.json"),
  63: () => import("@/data/quran/tafsirs/ibn-kathir/63.json"),
  64: () => import("@/data/quran/tafsirs/ibn-kathir/64.json"),
  65: () => import("@/data/quran/tafsirs/ibn-kathir/65.json"),
  66: () => import("@/data/quran/tafsirs/ibn-kathir/66.json"),
  67: () => import("@/data/quran/tafsirs/ibn-kathir/67.json"),
  68: () => import("@/data/quran/tafsirs/ibn-kathir/68.json"),
  69: () => import("@/data/quran/tafsirs/ibn-kathir/69.json"),
  70: () => import("@/data/quran/tafsirs/ibn-kathir/70.json"),
  71: () => import("@/data/quran/tafsirs/ibn-kathir/71.json"),
  72: () => import("@/data/quran/tafsirs/ibn-kathir/72.json"),
  73: () => import("@/data/quran/tafsirs/ibn-kathir/73.json"),
  74: () => import("@/data/quran/tafsirs/ibn-kathir/74.json"),
  75: () => import("@/data/quran/tafsirs/ibn-kathir/75.json"),
  76: () => import("@/data/quran/tafsirs/ibn-kathir/76.json"),
  77: () => import("@/data/quran/tafsirs/ibn-kathir/77.json"),
  78: () => import("@/data/quran/tafsirs/ibn-kathir/78.json"),
  79: () => import("@/data/quran/tafsirs/ibn-kathir/79.json"),
  80: () => import("@/data/quran/tafsirs/ibn-kathir/80.json"),
  81: () => import("@/data/quran/tafsirs/ibn-kathir/81.json"),
  82: () => import("@/data/quran/tafsirs/ibn-kathir/82.json"),
  83: () => import("@/data/quran/tafsirs/ibn-kathir/83.json"),
  84: () => import("@/data/quran/tafsirs/ibn-kathir/84.json"),
  85: () => import("@/data/quran/tafsirs/ibn-kathir/85.json"),
  86: () => import("@/data/quran/tafsirs/ibn-kathir/86.json"),
  87: () => import("@/data/quran/tafsirs/ibn-kathir/87.json"),
  88: () => import("@/data/quran/tafsirs/ibn-kathir/88.json"),
  89: () => import("@/data/quran/tafsirs/ibn-kathir/89.json"),
  90: () => import("@/data/quran/tafsirs/ibn-kathir/90.json"),
  91: () => import("@/data/quran/tafsirs/ibn-kathir/91.json"),
  92: () => import("@/data/quran/tafsirs/ibn-kathir/92.json"),
  93: () => import("@/data/quran/tafsirs/ibn-kathir/93.json"),
  94: () => import("@/data/quran/tafsirs/ibn-kathir/94.json"),
  95: () => import("@/data/quran/tafsirs/ibn-kathir/95.json"),
  96: () => import("@/data/quran/tafsirs/ibn-kathir/96.json"),
  97: () => import("@/data/quran/tafsirs/ibn-kathir/97.json"),
  98: () => import("@/data/quran/tafsirs/ibn-kathir/98.json"),
  99: () => import("@/data/quran/tafsirs/ibn-kathir/99.json"),
  100: () => import("@/data/quran/tafsirs/ibn-kathir/100.json"),
  101: () => import("@/data/quran/tafsirs/ibn-kathir/101.json"),
  102: () => import("@/data/quran/tafsirs/ibn-kathir/102.json"),
  103: () => import("@/data/quran/tafsirs/ibn-kathir/103.json"),
  104: () => import("@/data/quran/tafsirs/ibn-kathir/104.json"),
  105: () => import("@/data/quran/tafsirs/ibn-kathir/105.json"),
  106: () => import("@/data/quran/tafsirs/ibn-kathir/106.json"),
  107: () => import("@/data/quran/tafsirs/ibn-kathir/107.json"),
  108: () => import("@/data/quran/tafsirs/ibn-kathir/108.json"),
  109: () => import("@/data/quran/tafsirs/ibn-kathir/109.json"),
  110: () => import("@/data/quran/tafsirs/ibn-kathir/110.json"),
  111: () => import("@/data/quran/tafsirs/ibn-kathir/111.json"),
  112: () => import("@/data/quran/tafsirs/ibn-kathir/112.json"),
  113: () => import("@/data/quran/tafsirs/ibn-kathir/113.json"),
  114: () => import("@/data/quran/tafsirs/ibn-kathir/114.json"),
};

const maarifImports: TafsirImportMap = {
  1: () => import("@/data/quran/tafsirs/maarif/1.json"),
  2: () => import("@/data/quran/tafsirs/maarif/2.json"),
  3: () => import("@/data/quran/tafsirs/maarif/3.json"),
  4: () => import("@/data/quran/tafsirs/maarif/4.json"),
  5: () => import("@/data/quran/tafsirs/maarif/5.json"),
  6: () => import("@/data/quran/tafsirs/maarif/6.json"),
  7: () => import("@/data/quran/tafsirs/maarif/7.json"),
  8: () => import("@/data/quran/tafsirs/maarif/8.json"),
  9: () => import("@/data/quran/tafsirs/maarif/9.json"),
  10: () => import("@/data/quran/tafsirs/maarif/10.json"),
  11: () => import("@/data/quran/tafsirs/maarif/11.json"),
  12: () => import("@/data/quran/tafsirs/maarif/12.json"),
  13: () => import("@/data/quran/tafsirs/maarif/13.json"),
  14: () => import("@/data/quran/tafsirs/maarif/14.json"),
  15: () => import("@/data/quran/tafsirs/maarif/15.json"),
  16: () => import("@/data/quran/tafsirs/maarif/16.json"),
  17: () => import("@/data/quran/tafsirs/maarif/17.json"),
  18: () => import("@/data/quran/tafsirs/maarif/18.json"),
  19: () => import("@/data/quran/tafsirs/maarif/19.json"),
  20: () => import("@/data/quran/tafsirs/maarif/20.json"),
  21: () => import("@/data/quran/tafsirs/maarif/21.json"),
  22: () => import("@/data/quran/tafsirs/maarif/22.json"),
  23: () => import("@/data/quran/tafsirs/maarif/23.json"),
  24: () => import("@/data/quran/tafsirs/maarif/24.json"),
  25: () => import("@/data/quran/tafsirs/maarif/25.json"),
  26: () => import("@/data/quran/tafsirs/maarif/26.json"),
  27: () => import("@/data/quran/tafsirs/maarif/27.json"),
  28: () => import("@/data/quran/tafsirs/maarif/28.json"),
  29: () => import("@/data/quran/tafsirs/maarif/29.json"),
  30: () => import("@/data/quran/tafsirs/maarif/30.json"),
  31: () => import("@/data/quran/tafsirs/maarif/31.json"),
  32: () => import("@/data/quran/tafsirs/maarif/32.json"),
  33: () => import("@/data/quran/tafsirs/maarif/33.json"),
  34: () => import("@/data/quran/tafsirs/maarif/34.json"),
  35: () => import("@/data/quran/tafsirs/maarif/35.json"),
  36: () => import("@/data/quran/tafsirs/maarif/36.json"),
  37: () => import("@/data/quran/tafsirs/maarif/37.json"),
  38: () => import("@/data/quran/tafsirs/maarif/38.json"),
  39: () => import("@/data/quran/tafsirs/maarif/39.json"),
  40: () => import("@/data/quran/tafsirs/maarif/40.json"),
  41: () => import("@/data/quran/tafsirs/maarif/41.json"),
  42: () => import("@/data/quran/tafsirs/maarif/42.json"),
  43: () => import("@/data/quran/tafsirs/maarif/43.json"),
  44: () => import("@/data/quran/tafsirs/maarif/44.json"),
  45: () => import("@/data/quran/tafsirs/maarif/45.json"),
  46: () => import("@/data/quran/tafsirs/maarif/46.json"),
  47: () => import("@/data/quran/tafsirs/maarif/47.json"),
  48: () => import("@/data/quran/tafsirs/maarif/48.json"),
  49: () => import("@/data/quran/tafsirs/maarif/49.json"),
  50: () => import("@/data/quran/tafsirs/maarif/50.json"),
  51: () => import("@/data/quran/tafsirs/maarif/51.json"),
  52: () => import("@/data/quran/tafsirs/maarif/52.json"),
  53: () => import("@/data/quran/tafsirs/maarif/53.json"),
  54: () => import("@/data/quran/tafsirs/maarif/54.json"),
  55: () => import("@/data/quran/tafsirs/maarif/55.json"),
  56: () => import("@/data/quran/tafsirs/maarif/56.json"),
  57: () => import("@/data/quran/tafsirs/maarif/57.json"),
  58: () => import("@/data/quran/tafsirs/maarif/58.json"),
  59: () => import("@/data/quran/tafsirs/maarif/59.json"),
  60: () => import("@/data/quran/tafsirs/maarif/60.json"),
  61: () => import("@/data/quran/tafsirs/maarif/61.json"),
  62: () => import("@/data/quran/tafsirs/maarif/62.json"),
  63: () => import("@/data/quran/tafsirs/maarif/63.json"),
  64: () => import("@/data/quran/tafsirs/maarif/64.json"),
  65: () => import("@/data/quran/tafsirs/maarif/65.json"),
  66: () => import("@/data/quran/tafsirs/maarif/66.json"),
  67: () => import("@/data/quran/tafsirs/maarif/67.json"),
  68: () => import("@/data/quran/tafsirs/maarif/68.json"),
  69: () => import("@/data/quran/tafsirs/maarif/69.json"),
  70: () => import("@/data/quran/tafsirs/maarif/70.json"),
  71: () => import("@/data/quran/tafsirs/maarif/71.json"),
  72: () => import("@/data/quran/tafsirs/maarif/72.json"),
  73: () => import("@/data/quran/tafsirs/maarif/73.json"),
  74: () => import("@/data/quran/tafsirs/maarif/74.json"),
  75: () => import("@/data/quran/tafsirs/maarif/75.json"),
  76: () => import("@/data/quran/tafsirs/maarif/76.json"),
  77: () => import("@/data/quran/tafsirs/maarif/77.json"),
  78: () => import("@/data/quran/tafsirs/maarif/78.json"),
  79: () => import("@/data/quran/tafsirs/maarif/79.json"),
  80: () => import("@/data/quran/tafsirs/maarif/80.json"),
  81: () => import("@/data/quran/tafsirs/maarif/81.json"),
  82: () => import("@/data/quran/tafsirs/maarif/82.json"),
  83: () => import("@/data/quran/tafsirs/maarif/83.json"),
  84: () => import("@/data/quran/tafsirs/maarif/84.json"),
  85: () => import("@/data/quran/tafsirs/maarif/85.json"),
  86: () => import("@/data/quran/tafsirs/maarif/86.json"),
  87: () => import("@/data/quran/tafsirs/maarif/87.json"),
  88: () => import("@/data/quran/tafsirs/maarif/88.json"),
  89: () => import("@/data/quran/tafsirs/maarif/89.json"),
  90: () => import("@/data/quran/tafsirs/maarif/90.json"),
  91: () => import("@/data/quran/tafsirs/maarif/91.json"),
  92: () => import("@/data/quran/tafsirs/maarif/92.json"),
  93: () => import("@/data/quran/tafsirs/maarif/93.json"),
  94: () => import("@/data/quran/tafsirs/maarif/94.json"),
  95: () => import("@/data/quran/tafsirs/maarif/95.json"),
  96: () => import("@/data/quran/tafsirs/maarif/96.json"),
  97: () => import("@/data/quran/tafsirs/maarif/97.json"),
  98: () => import("@/data/quran/tafsirs/maarif/98.json"),
  99: () => import("@/data/quran/tafsirs/maarif/99.json"),
  100: () => import("@/data/quran/tafsirs/maarif/100.json"),
  101: () => import("@/data/quran/tafsirs/maarif/101.json"),
  102: () => import("@/data/quran/tafsirs/maarif/102.json"),
  103: () => import("@/data/quran/tafsirs/maarif/103.json"),
  104: () => import("@/data/quran/tafsirs/maarif/104.json"),
  105: () => import("@/data/quran/tafsirs/maarif/105.json"),
  106: () => import("@/data/quran/tafsirs/maarif/106.json"),
  107: () => import("@/data/quran/tafsirs/maarif/107.json"),
  108: () => import("@/data/quran/tafsirs/maarif/108.json"),
  109: () => import("@/data/quran/tafsirs/maarif/109.json"),
  110: () => import("@/data/quran/tafsirs/maarif/110.json"),
  111: () => import("@/data/quran/tafsirs/maarif/111.json"),
  112: () => import("@/data/quran/tafsirs/maarif/112.json"),
  113: () => import("@/data/quran/tafsirs/maarif/113.json"),
  114: () => import("@/data/quran/tafsirs/maarif/114.json"),
};

const tafsirImportMaps: Record<TafsirSource, TafsirImportMap> = {
  "ibn-kathir": ibnKathirImports,
  maarif: maarifImports,
};

// Word-by-word data
type WordData = { t: string; tr: string; m: string };
type WordsMap = Record<string, WordData[]>;
type WordsImportMap = Record<number, () => Promise<{ default: WordsMap }>>;

const wordsImports: WordsImportMap = {
  1: () => import("@/data/quran/words/1.json"),
  2: () => import("@/data/quran/words/2.json"),
  3: () => import("@/data/quran/words/3.json"),
  4: () => import("@/data/quran/words/4.json"),
  5: () => import("@/data/quran/words/5.json"),
  6: () => import("@/data/quran/words/6.json"),
  7: () => import("@/data/quran/words/7.json"),
  8: () => import("@/data/quran/words/8.json"),
  9: () => import("@/data/quran/words/9.json"),
  10: () => import("@/data/quran/words/10.json"),
  11: () => import("@/data/quran/words/11.json"),
  12: () => import("@/data/quran/words/12.json"),
  13: () => import("@/data/quran/words/13.json"),
  14: () => import("@/data/quran/words/14.json"),
  15: () => import("@/data/quran/words/15.json"),
  16: () => import("@/data/quran/words/16.json"),
  17: () => import("@/data/quran/words/17.json"),
  18: () => import("@/data/quran/words/18.json"),
  19: () => import("@/data/quran/words/19.json"),
  20: () => import("@/data/quran/words/20.json"),
  21: () => import("@/data/quran/words/21.json"),
  22: () => import("@/data/quran/words/22.json"),
  23: () => import("@/data/quran/words/23.json"),
  24: () => import("@/data/quran/words/24.json"),
  25: () => import("@/data/quran/words/25.json"),
  26: () => import("@/data/quran/words/26.json"),
  27: () => import("@/data/quran/words/27.json"),
  28: () => import("@/data/quran/words/28.json"),
  29: () => import("@/data/quran/words/29.json"),
  30: () => import("@/data/quran/words/30.json"),
  31: () => import("@/data/quran/words/31.json"),
  32: () => import("@/data/quran/words/32.json"),
  33: () => import("@/data/quran/words/33.json"),
  34: () => import("@/data/quran/words/34.json"),
  35: () => import("@/data/quran/words/35.json"),
  36: () => import("@/data/quran/words/36.json"),
  37: () => import("@/data/quran/words/37.json"),
  38: () => import("@/data/quran/words/38.json"),
  39: () => import("@/data/quran/words/39.json"),
  40: () => import("@/data/quran/words/40.json"),
  41: () => import("@/data/quran/words/41.json"),
  42: () => import("@/data/quran/words/42.json"),
  43: () => import("@/data/quran/words/43.json"),
  44: () => import("@/data/quran/words/44.json"),
  45: () => import("@/data/quran/words/45.json"),
  46: () => import("@/data/quran/words/46.json"),
  47: () => import("@/data/quran/words/47.json"),
  48: () => import("@/data/quran/words/48.json"),
  49: () => import("@/data/quran/words/49.json"),
  50: () => import("@/data/quran/words/50.json"),
  51: () => import("@/data/quran/words/51.json"),
  52: () => import("@/data/quran/words/52.json"),
  53: () => import("@/data/quran/words/53.json"),
  54: () => import("@/data/quran/words/54.json"),
  55: () => import("@/data/quran/words/55.json"),
  56: () => import("@/data/quran/words/56.json"),
  57: () => import("@/data/quran/words/57.json"),
  58: () => import("@/data/quran/words/58.json"),
  59: () => import("@/data/quran/words/59.json"),
  60: () => import("@/data/quran/words/60.json"),
  61: () => import("@/data/quran/words/61.json"),
  62: () => import("@/data/quran/words/62.json"),
  63: () => import("@/data/quran/words/63.json"),
  64: () => import("@/data/quran/words/64.json"),
  65: () => import("@/data/quran/words/65.json"),
  66: () => import("@/data/quran/words/66.json"),
  67: () => import("@/data/quran/words/67.json"),
  68: () => import("@/data/quran/words/68.json"),
  69: () => import("@/data/quran/words/69.json"),
  70: () => import("@/data/quran/words/70.json"),
  71: () => import("@/data/quran/words/71.json"),
  72: () => import("@/data/quran/words/72.json"),
  73: () => import("@/data/quran/words/73.json"),
  74: () => import("@/data/quran/words/74.json"),
  75: () => import("@/data/quran/words/75.json"),
  76: () => import("@/data/quran/words/76.json"),
  77: () => import("@/data/quran/words/77.json"),
  78: () => import("@/data/quran/words/78.json"),
  79: () => import("@/data/quran/words/79.json"),
  80: () => import("@/data/quran/words/80.json"),
  81: () => import("@/data/quran/words/81.json"),
  82: () => import("@/data/quran/words/82.json"),
  83: () => import("@/data/quran/words/83.json"),
  84: () => import("@/data/quran/words/84.json"),
  85: () => import("@/data/quran/words/85.json"),
  86: () => import("@/data/quran/words/86.json"),
  87: () => import("@/data/quran/words/87.json"),
  88: () => import("@/data/quran/words/88.json"),
  89: () => import("@/data/quran/words/89.json"),
  90: () => import("@/data/quran/words/90.json"),
  91: () => import("@/data/quran/words/91.json"),
  92: () => import("@/data/quran/words/92.json"),
  93: () => import("@/data/quran/words/93.json"),
  94: () => import("@/data/quran/words/94.json"),
  95: () => import("@/data/quran/words/95.json"),
  96: () => import("@/data/quran/words/96.json"),
  97: () => import("@/data/quran/words/97.json"),
  98: () => import("@/data/quran/words/98.json"),
  99: () => import("@/data/quran/words/99.json"),
  100: () => import("@/data/quran/words/100.json"),
  101: () => import("@/data/quran/words/101.json"),
  102: () => import("@/data/quran/words/102.json"),
  103: () => import("@/data/quran/words/103.json"),
  104: () => import("@/data/quran/words/104.json"),
  105: () => import("@/data/quran/words/105.json"),
  106: () => import("@/data/quran/words/106.json"),
  107: () => import("@/data/quran/words/107.json"),
  108: () => import("@/data/quran/words/108.json"),
  109: () => import("@/data/quran/words/109.json"),
  110: () => import("@/data/quran/words/110.json"),
  111: () => import("@/data/quran/words/111.json"),
  112: () => import("@/data/quran/words/112.json"),
  113: () => import("@/data/quran/words/113.json"),
  114: () => import("@/data/quran/words/114.json"),
};

// Static imports for word-level audio timestamps (Mishari al-Afasy)
const timestampImports: Record<number, () => Promise<{ default: TimestampData }>> = {
  1: () => import("@/data/quran/timestamps/1.json"),
  2: () => import("@/data/quran/timestamps/2.json"),
  3: () => import("@/data/quran/timestamps/3.json"),
  4: () => import("@/data/quran/timestamps/4.json"),
  5: () => import("@/data/quran/timestamps/5.json"),
  6: () => import("@/data/quran/timestamps/6.json"),
  7: () => import("@/data/quran/timestamps/7.json"),
  8: () => import("@/data/quran/timestamps/8.json"),
  9: () => import("@/data/quran/timestamps/9.json"),
  10: () => import("@/data/quran/timestamps/10.json"),
  11: () => import("@/data/quran/timestamps/11.json"),
  12: () => import("@/data/quran/timestamps/12.json"),
  13: () => import("@/data/quran/timestamps/13.json"),
  14: () => import("@/data/quran/timestamps/14.json"),
  15: () => import("@/data/quran/timestamps/15.json"),
  16: () => import("@/data/quran/timestamps/16.json"),
  17: () => import("@/data/quran/timestamps/17.json"),
  18: () => import("@/data/quran/timestamps/18.json"),
  19: () => import("@/data/quran/timestamps/19.json"),
  20: () => import("@/data/quran/timestamps/20.json"),
  21: () => import("@/data/quran/timestamps/21.json"),
  22: () => import("@/data/quran/timestamps/22.json"),
  23: () => import("@/data/quran/timestamps/23.json"),
  24: () => import("@/data/quran/timestamps/24.json"),
  25: () => import("@/data/quran/timestamps/25.json"),
  26: () => import("@/data/quran/timestamps/26.json"),
  27: () => import("@/data/quran/timestamps/27.json"),
  28: () => import("@/data/quran/timestamps/28.json"),
  29: () => import("@/data/quran/timestamps/29.json"),
  30: () => import("@/data/quran/timestamps/30.json"),
  31: () => import("@/data/quran/timestamps/31.json"),
  32: () => import("@/data/quran/timestamps/32.json"),
  33: () => import("@/data/quran/timestamps/33.json"),
  34: () => import("@/data/quran/timestamps/34.json"),
  35: () => import("@/data/quran/timestamps/35.json"),
  36: () => import("@/data/quran/timestamps/36.json"),
  37: () => import("@/data/quran/timestamps/37.json"),
  38: () => import("@/data/quran/timestamps/38.json"),
  39: () => import("@/data/quran/timestamps/39.json"),
  40: () => import("@/data/quran/timestamps/40.json"),
  41: () => import("@/data/quran/timestamps/41.json"),
  42: () => import("@/data/quran/timestamps/42.json"),
  43: () => import("@/data/quran/timestamps/43.json"),
  44: () => import("@/data/quran/timestamps/44.json"),
  45: () => import("@/data/quran/timestamps/45.json"),
  46: () => import("@/data/quran/timestamps/46.json"),
  47: () => import("@/data/quran/timestamps/47.json"),
  48: () => import("@/data/quran/timestamps/48.json"),
  49: () => import("@/data/quran/timestamps/49.json"),
  50: () => import("@/data/quran/timestamps/50.json"),
  51: () => import("@/data/quran/timestamps/51.json"),
  52: () => import("@/data/quran/timestamps/52.json"),
  53: () => import("@/data/quran/timestamps/53.json"),
  54: () => import("@/data/quran/timestamps/54.json"),
  55: () => import("@/data/quran/timestamps/55.json"),
  56: () => import("@/data/quran/timestamps/56.json"),
  57: () => import("@/data/quran/timestamps/57.json"),
  58: () => import("@/data/quran/timestamps/58.json"),
  59: () => import("@/data/quran/timestamps/59.json"),
  60: () => import("@/data/quran/timestamps/60.json"),
  61: () => import("@/data/quran/timestamps/61.json"),
  62: () => import("@/data/quran/timestamps/62.json"),
  63: () => import("@/data/quran/timestamps/63.json"),
  64: () => import("@/data/quran/timestamps/64.json"),
  65: () => import("@/data/quran/timestamps/65.json"),
  66: () => import("@/data/quran/timestamps/66.json"),
  67: () => import("@/data/quran/timestamps/67.json"),
  68: () => import("@/data/quran/timestamps/68.json"),
  69: () => import("@/data/quran/timestamps/69.json"),
  70: () => import("@/data/quran/timestamps/70.json"),
  71: () => import("@/data/quran/timestamps/71.json"),
  72: () => import("@/data/quran/timestamps/72.json"),
  73: () => import("@/data/quran/timestamps/73.json"),
  74: () => import("@/data/quran/timestamps/74.json"),
  75: () => import("@/data/quran/timestamps/75.json"),
  76: () => import("@/data/quran/timestamps/76.json"),
  77: () => import("@/data/quran/timestamps/77.json"),
  78: () => import("@/data/quran/timestamps/78.json"),
  79: () => import("@/data/quran/timestamps/79.json"),
  80: () => import("@/data/quran/timestamps/80.json"),
  81: () => import("@/data/quran/timestamps/81.json"),
  82: () => import("@/data/quran/timestamps/82.json"),
  83: () => import("@/data/quran/timestamps/83.json"),
  84: () => import("@/data/quran/timestamps/84.json"),
  85: () => import("@/data/quran/timestamps/85.json"),
  86: () => import("@/data/quran/timestamps/86.json"),
  87: () => import("@/data/quran/timestamps/87.json"),
  88: () => import("@/data/quran/timestamps/88.json"),
  89: () => import("@/data/quran/timestamps/89.json"),
  90: () => import("@/data/quran/timestamps/90.json"),
  91: () => import("@/data/quran/timestamps/91.json"),
  92: () => import("@/data/quran/timestamps/92.json"),
  93: () => import("@/data/quran/timestamps/93.json"),
  94: () => import("@/data/quran/timestamps/94.json"),
  95: () => import("@/data/quran/timestamps/95.json"),
  96: () => import("@/data/quran/timestamps/96.json"),
  97: () => import("@/data/quran/timestamps/97.json"),
  98: () => import("@/data/quran/timestamps/98.json"),
  99: () => import("@/data/quran/timestamps/99.json"),
  100: () => import("@/data/quran/timestamps/100.json"),
  101: () => import("@/data/quran/timestamps/101.json"),
  102: () => import("@/data/quran/timestamps/102.json"),
  103: () => import("@/data/quran/timestamps/103.json"),
  104: () => import("@/data/quran/timestamps/104.json"),
  105: () => import("@/data/quran/timestamps/105.json"),
  106: () => import("@/data/quran/timestamps/106.json"),
  107: () => import("@/data/quran/timestamps/107.json"),
  108: () => import("@/data/quran/timestamps/108.json"),
  109: () => import("@/data/quran/timestamps/109.json"),
  110: () => import("@/data/quran/timestamps/110.json"),
  111: () => import("@/data/quran/timestamps/111.json"),
  112: () => import("@/data/quran/timestamps/112.json"),
  113: () => import("@/data/quran/timestamps/113.json"),
  114: () => import("@/data/quran/timestamps/114.json"),
};

function highlightText(text: string, query: string) {
  if (!query || query.length < 3) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let idx = lowerText.indexOf(lowerQuery);
  while (idx !== -1) {
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
    parts.push(
      <mark key={idx} className="bg-[var(--color-gold)]/30 text-themed rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
    );
    lastIndex = idx + query.length;
    idx = lowerText.indexOf(lowerQuery, lastIndex);
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? <>{parts}</> : text;
}

export default function SurahPage() {
  return (
    <Suspense>
      <SurahPageContent />
    </Suspense>
  );
}

function SurahPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const chapter = chapters.find((ch) => ch.id === id);

  const highlightQuery = searchParams.get("q") || "";
  const highlightVerse = Number(searchParams.get("v")) || 0;
  const scrolledRef = useRef(false);

  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Tafsir state
  const [tafsirSource, setTafsirSource] = useState<TafsirSource>("ibn-kathir");
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [showAllTafsir, setShowAllTafsir] = useState(false);
  const [openTafsirs, setOpenTafsirs] = useState<Set<number>>(new Set());

  // Word-by-word data
  const [wordsData, setWordsData] = useState<WordsMap | null>(null);
  const [timestampData, setTimestampData] = useState<TimestampData | null>(null);

  // Font size: 0=small, 1=medium, 2=large (default), 3=xl
  const [fontSize, setFontSizeState] = useState(2);
  const [shareCopied, setShareCopied] = useState<number | null>(null);

  // Audio from global context
  const {
    playingVerse,
    audioProgress,
    audioDuration,
    audioPaused,
    autoNextSurah,
    playVerse,
    playSurah,
    togglePause,
    skipNext,
    skipPrevious,
    skipNextSurah,
    skipPreviousSurah,
    seekTo,
    stopPlayback,
    toggleAutoNextSurah,
    setAutoPlay,
    registerSurah,
    surahId: contextSurahId,
  } = useQuranAudio();

  const shouldAutoPlay = searchParams.get("autoplay") === "1";
  const autoPlayTriggered = useRef(false);

  useEffect(() => {
    const isAutoPlayTransition = shouldAutoPlay && !autoPlayTriggered.current;
    const isAlreadyPlayingThisSurah = contextSurahId === id && playingVerse !== null;
    setVerses(null);
    setLoading(true);
    setSearch("");
    scrolledRef.current = false;
    setTafsirData(null);
    setOpenTafsirs(new Set());
    setShowAllTafsir(false);
    setWordsData(null);
    setTimestampData(null);
    // Don't reset audio state during autoplay transitions or when already playing this surah
    if (!isAutoPlayTransition && !isAlreadyPlayingThisSurah) {
      stopPlayback();
      autoPlayTriggered.current = false;
    }
    const loader = verseImports[id];
    if (loader) {
      loader().then((mod) => {
        setVerses(mod.default);
        registerSurah(id, mod.default);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // Load word-by-word data
    const wordLoader = wordsImports[id];
    if (wordLoader) {
      wordLoader().then((mod) => setWordsData(mod.default));
    }
    // Load word-level audio timestamps
    const tsLoader = timestampImports[id];
    if (tsLoader) {
      tsLoader().then((mod) => setTimestampData(mod.default));
    }
    // Load font size preference
    setFontSizeState(getFontSize());
    // Mark surah as read
    markSurahRead(id);
  }, [id]);

  // Load tafsir data when source changes or on demand
  const loadTafsir = useCallback(async (source: TafsirSource) => {
    setTafsirLoading(true);
    const loader = tafsirImportMaps[source][id];
    if (loader) {
      const mod = await loader();
      setTafsirData(mod.default);
    }
    setTafsirLoading(false);
  }, [id]);

  // Load tafsir when source changes and we have open tafsirs or showAll
  useEffect(() => {
    if (showAllTafsir || openTafsirs.size > 0) {
      loadTafsir(tafsirSource);
    }
  }, [tafsirSource, loadTafsir, showAllTafsir, openTafsirs.size]);

  const toggleVerseTafsir = useCallback(async (verseNum: number) => {
    setOpenTafsirs((prev) => {
      const next = new Set(prev);
      if (next.has(verseNum)) {
        next.delete(verseNum);
      } else {
        next.add(verseNum);
      }
      return next;
    });
    // Ensure data is loaded
    if (!tafsirData) {
      await loadTafsir(tafsirSource);
    }
  }, [tafsirData, loadTafsir, tafsirSource]);

  const toggleShowAll = useCallback(async () => {
    const willShow = !showAllTafsir;
    setShowAllTafsir(willShow);
    if (willShow && !tafsirData) {
      await loadTafsir(tafsirSource);
    }
    if (!willShow) {
      setOpenTafsirs(new Set());
    }
  }, [showAllTafsir, tafsirData, loadTafsir, tafsirSource]);

  // Scroll to highlighted verse after verses load
  useEffect(() => {
    if (!verses || !highlightVerse || scrolledRef.current) return;
    scrolledRef.current = true;
    setTimeout(() => {
      const el = document.getElementById(`verse-${highlightVerse}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);
  }, [verses, highlightVerse]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!chapter) {
    return (
      <div className="text-center py-20">
        <p className="text-themed-muted text-lg">Surah not found.</p>
        <Link href="/quran" className="text-accent mt-4 inline-block">
          Back to Quran
        </Link>
      </div>
    );
  }

  const prevChapter = id > 1 ? chapters.find((ch) => ch.id === id - 1) : null;
  const nextChapter = id < 114 ? chapters.find((ch) => ch.id === id + 1) : null;

  const filtered = verses?.filter((v) => {
    if (!search) return true;
    return (
      v.textEn.toLowerCase().includes(search.toLowerCase()) ||
      v.textAr.includes(search) ||
      (v.textTranslit && v.textTranslit.toLowerCase().includes(search.toLowerCase())) ||
      v.number.toString() === search.trim()
    );
  });

  const isTafsirOpen = (verseNum: number) => showAllTafsir || openTafsirs.has(verseNum);

  const fontSizeClasses = [
    "text-lg md:text-xl",     // 0 = small
    "text-xl md:text-2xl",     // 1 = medium
    "text-2xl md:text-3xl",    // 2 = large (default)
    "text-3xl md:text-4xl",    // 3 = xl
  ];

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(0, Math.min(3, fontSize + delta));
    setFontSizeState(newSize);
    saveFontSize(newSize);
  };

  const shareVerse = async (verse: Verse) => {
    const text = `${verse.textAr}\n\n"${verse.textEn}"\n\n— Quran ${verse.key}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(verse.number);
      setTimeout(() => setShareCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  // Auto-start playback if navigated with ?autoplay=1
  useEffect(() => {
    if (shouldAutoPlay && verses && verses.length > 0 && !autoPlayTriggered.current) {
      autoPlayTriggered.current = true;
      setAutoPlay(true);
      playVerse(verses[0]);
    }
  }, [shouldAutoPlay, verses, playVerse, setAutoPlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (playingVerse !== null) {
          togglePause();
        } else if (verses && verses.length > 0) {
          setAutoPlay(true);
          playVerse(verses[0]);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playingVerse, verses, playVerse, togglePause, setAutoPlay]);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/quran"
        className="inline-flex items-center gap-2 text-sm text-themed-muted hover:text-themed transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        All Surahs
      </Link>

      <PageHeader
        title={chapter.name}
        titleAr={chapter.nameAr}
        subtitle={`${chapter.meaning} · ${chapter.verses} verses · ${chapter.revelationPlace === "makkah" ? "Meccan" : "Medinan"} · Juz ${verses?.[0]?.juz ?? "..."}`}
      />

      {/* Surah info bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="text-xs border sidebar-border rounded-full px-3 py-1 text-themed-muted">
          Revelation #{chapter.revelationOrder}
        </span>
        <span
          className="tooltip text-xs border sidebar-border rounded-full px-3 py-1 text-themed-muted cursor-help"
          data-tip="Page numbers refer to the Medina Mushaf (King Fahd Complex edition)"
        >
          Pages {chapter.pages[0]}&ndash;{chapter.pages[1]}
        </span>
        <span className="text-xs border border-gold/30 rounded-full px-3 py-1 text-gold">
          Saheeh International
        </span>
      </div>

      {/* Overview */}
      {"overview" in chapter && (
        <p className="text-themed-muted text-sm leading-relaxed mb-6">
          {(chapter as unknown as { overview: string }).overview}
        </p>
      )}

      {/* Search + Tafsir controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Play surah button — left side */}
        <button
          onClick={playSurah}
          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors shrink-0 ${
            playingVerse !== null
              ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/30 text-gold"
              : "card-bg sidebar-border text-themed-muted hover:text-themed"
          }`}
        >
          {playingVerse !== null ? <Pause size={14} /> : <Play size={14} />}
          <span>
            {playingVerse !== null ? "Stop" : "Play Surah"}
          </span>
        </button>

        {/* Search within surah */}
        {chapter.verses > 10 && (
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
            />
            <input
              type="text"
              placeholder="Search within this surah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl card-bg border sidebar-border text-themed text-sm placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>
        )}

        {/* Controls — right side */}
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <BookOpen size={14} className="text-themed-muted shrink-0" />
          <select
            value={tafsirSource}
            onChange={(e) => {
              setTafsirSource(e.target.value as TafsirSource);
              setTafsirData(null);
            }}
            className="text-sm py-2 px-3 rounded-lg card-bg border sidebar-border text-themed focus:outline-none focus:border-[var(--color-gold)] transition-colors cursor-pointer"
          >
            {(Object.entries(TAFSIR_LABELS) as [TafsirSource, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>

          {/* Show/hide all tafsir */}
          <button
            onClick={toggleShowAll}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              showAllTafsir
                ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/30 text-gold"
                : "card-bg sidebar-border text-themed-muted hover:text-themed"
            }`}
          >
            {showAllTafsir ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">
              {showAllTafsir ? "Hide All" : "Show All"}
            </span>
          </button>

          {/* Font size controls */}
          <div className="flex items-center gap-0.5 card-bg border sidebar-border rounded-lg">
            <button
              onClick={() => changeFontSize(-1)}
              disabled={fontSize === 0}
              className="px-2 py-2 text-themed-muted hover:text-themed disabled:opacity-30 transition-colors"
              title="Decrease font size"
            >
              <Minus size={12} />
            </button>
            <span className="text-[10px] text-themed-muted w-5 text-center font-mono">
              {["S", "M", "L", "XL"][fontSize]}
            </span>
            <button
              onClick={() => changeFontSize(1)}
              disabled={fontSize === 3}
              className="px-2 py-2 text-themed-muted hover:text-themed disabled:opacity-30 transition-colors"
              title="Increase font size"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Bismillah */}
      {chapter.bismillahPre && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 mb-4"
        >
          <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose">
            {"\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0640\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650"}
          </p>
          <p className="text-xs text-themed-muted mt-2">
            In the name of All&#257;h, the Entirely Merciful, the Especially Merciful
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-themed-muted text-sm mt-3">Loading verses...</p>
        </div>
      )}

      {/* Verses */}
      {filtered && (
        <div className="space-y-1">
          {filtered.map((verse, i) => {
            const isHighlighted = highlightVerse === verse.number && !!highlightQuery;
            const tafsirOpen = isTafsirOpen(verse.number);
            const tafsirText = tafsirData?.[String(verse.number)];

            return (
              <motion.div
                key={verse.id}
                id={`verse-${verse.number}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.6) }}
                className={`group rounded-xl border p-4 md:p-6 transition-colors ${
                  playingVerse === verse.number
                    ? "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 shadow-[0_0_15px_rgba(201,168,76,0.1)]"
                    : isHighlighted
                    ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/5"
                    : "sidebar-border hover:border-[var(--color-gold)]/30"
                }`}
              >
                {/* Verse number badge + controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      playingVerse === verse.number
                        ? "bg-gold text-[var(--color-bg)]"
                        : "bg-[var(--color-gold)]/15 text-gold"
                    }`}>
                      {verse.number}
                    </span>
                    {/* Play verse button */}
                    <button
                      onClick={() => playVerse(verse)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        playingVerse === verse.number
                          ? "bg-gold/20 text-gold"
                          : "text-themed-muted hover:text-gold hover:bg-gold/10"
                      }`}
                      title={playingVerse === verse.number ? "Pause" : "Play verse"}
                    >
                      {playingVerse === verse.number ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <span
                      className="tooltip text-[10px] text-themed-muted cursor-help"
                      data-tip="Medina Mushaf (King Fahd Complex edition)"
                    >
                      Juz {verse.juz} &middot; Page {verse.page}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Share verse */}
                    <button
                      onClick={() => shareVerse(verse)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-gold hover:bg-gold/10 transition-colors"
                      title="Copy verse"
                    >
                      {shareCopied === verse.number ? <Check size={11} className="text-green-400" /> : <Share2 size={11} />}
                    </button>

                    {/* Bookmark verse */}
                    <BookmarkButton
                      type="verse"
                      id={verse.key}
                      title={`Surah ${chapter?.name ?? id} ${verse.key}`}
                      subtitle={verse.textEn.slice(0, 80)}
                      href={`/quran/${id}?v=${verse.number}`}
                      size={11}
                    />

                    {/* Per-verse tafsir toggle */}
                    {!showAllTafsir && (
                      <button
                        onClick={() => toggleVerseTafsir(verse.number)}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          tafsirOpen
                            ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-gold"
                            : "sidebar-border text-themed-muted hover:text-themed hover:border-[var(--color-gold)]/20"
                        }`}
                      >
                        <BookOpen size={11} />
                        Tafsir
                        {tafsirOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Arabic text — word-by-word with hover tooltips */}
                <div
                  className={`${fontSizeClasses[fontSize]} font-arabic text-themed leading-[2.2] md:leading-[2.4] text-right mb-5 flex flex-wrap-reverse justify-end gap-x-2`}
                  dir="rtl"
                >
                  {wordsData?.[String(verse.number)]
                    ? (() => {
                        const words = wordsData[String(verse.number)];
                        const isCurrentlyPlaying = playingVerse === verse.number && !audioPaused;
                        const timestamps = timestampData?.[String(verse.number)];
                        const currentMs = audioProgress * 1000;
                        let activeWordIndex = -1;
                        if (isCurrentlyPlaying && timestamps && timestamps.length > 0) {
                          // Use real word-level timestamps from Quran.com
                          for (let wi = 0; wi < timestamps.length; wi++) {
                            const [start, end] = timestamps[wi];
                            if (currentMs >= start && currentMs < end) {
                              activeWordIndex = wi;
                              break;
                            }
                          }
                          // If past all timestamps, highlight last word
                          if (activeWordIndex === -1 && currentMs >= timestamps[timestamps.length - 1][0]) {
                            activeWordIndex = timestamps.length - 1;
                          }
                        } else if (isCurrentlyPlaying && audioDuration > 0) {
                          // Fallback: even distribution if no timestamp data
                          activeWordIndex = Math.min(Math.floor((audioProgress / audioDuration) * words.length), words.length - 1);
                        }
                        return words.map((word, wi) => {
                          const isActiveWord = wi === activeWordIndex;
                          return (
                            <span
                              key={wi}
                              className={`relative group/word inline-block cursor-help transition-colors duration-200 ${
                                isActiveWord
                                  ? "text-gold scale-105"
                                  : isCurrentlyPlaying && wi < activeWordIndex
                                  ? "text-gold/60"
                                  : "hover:text-gold"
                              }`}
                            >
                              {word.t}
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-card)] border sidebar-border shadow-lg opacity-0 group-hover/word:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 text-center">
                                <span className="block text-xs text-gold font-medium" dir="ltr">{word.m}</span>
                                {word.tr && <span className="block text-[10px] text-themed-muted italic mt-0.5" dir="ltr">{word.tr}</span>}
                              </span>
                            </span>
                          );
                        });
                      })()
                    : <span>{verse.textAr}</span>
                  }{" "}
                  <span className="text-gold text-lg font-arabic">
                    &#xFD3F;{toArabicNumeral(verse.number)}&#xFD3E;
                  </span>
                </div>

                {/* Transliteration */}
                {verse.textTranslit && (
                  <p className="text-gold/80 text-sm md:text-base leading-relaxed mb-3 italic">
                    {verse.textTranslit}
                  </p>
                )}

                {/* English translation */}
                <p className="text-themed-muted text-sm md:text-base leading-relaxed">
                  {isHighlighted ? highlightText(verse.textEn, highlightQuery) : verse.textEn}
                </p>

                {/* Tafsir commentary */}
                <AnimatePresence>
                  {tafsirOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t sidebar-border">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen size={12} className="text-gold" />
                          <span className="text-xs font-medium text-gold">
                            {TAFSIR_LABELS[tafsirSource]}
                          </span>
                        </div>
                        {tafsirLoading ? (
                          <div className="flex items-center gap-2 text-themed-muted text-xs py-2">
                            <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                            Loading tafsir...
                          </div>
                        ) : tafsirText ? (
                          <p className="text-themed-muted text-xs md:text-sm leading-relaxed whitespace-pre-line">
                            {tafsirText}
                          </p>
                        ) : (
                          <p className="text-themed-muted text-xs italic">
                            No tafsir available for this verse.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {filtered && filtered.length === 0 && search && (
        <div className="text-center py-12 text-themed-muted">
          <p>No verses found matching &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Navigation between surahs */}
      <div className={`flex items-center justify-between mt-10 pt-6 border-t sidebar-border ${playingVerse !== null ? "pb-20" : ""}`}>
        {prevChapter ? (
          <Link
            href={`/quran/${prevChapter.id}`}
            className="flex items-center gap-2 text-sm text-themed-muted hover:text-themed transition-colors"
          >
            <ArrowLeft size={16} />
            <div>
              <p className="text-xs text-themed-muted">Previous</p>
              <p className="font-medium text-themed">{prevChapter.name}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/quran/${nextChapter.id}`}
            className="flex items-center gap-2 text-sm text-themed-muted hover:text-themed transition-colors text-right"
          >
            <div>
              <p className="text-xs text-themed-muted">Next</p>
              <p className="font-medium text-themed">{nextChapter.name}</p>
            </div>
            <ArrowRight size={16} />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Sticky audio player */}
      <AnimatePresence>
        {playingVerse !== null && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 card-bg border-t sidebar-border shadow-2xl"
          >
            {/* Progress bar at top of player */}
            <div
              className="h-1 bg-[var(--color-gold)]/10 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seekTo(pct);
              }}
            >
              <div
                className="h-full bg-[var(--color-gold)] transition-[width] duration-200"
                style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 max-w-4xl mx-auto">
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={skipPreviousSurah}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                  title="Previous Surah"
                >
                  <ChevronFirst size={15} />
                </button>
                <button
                  onClick={skipPrevious}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                  title="Previous Verse"
                >
                  <SkipBack size={13} />
                </button>
                <button
                  onClick={togglePause}
                  className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"
                >
                  {audioPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  onClick={skipNext}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                  title="Next Verse"
                >
                  <SkipForward size={13} />
                </button>
                <button
                  onClick={skipNextSurah}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                  title="Next Surah"
                >
                  <ChevronLast size={15} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-themed font-medium truncate">{chapter.name} — Verse {playingVerse}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-themed-muted">Mishari Rashid al-Afasy</p>
                  {audioDuration > 0 && (
                    <span className="text-xs text-themed-muted">
                      {Math.floor(audioProgress / 60)}:{String(Math.floor(audioProgress % 60)).padStart(2, "0")}
                      {" / "}
                      {Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
              {/* Auto-play next surah toggle */}
              <button
                onClick={toggleAutoNextSurah}
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors shrink-0 ${
                  autoNextSurah
                    ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/30 text-gold"
                    : "sidebar-border text-themed-muted hover:text-themed"
                }`}
                title={autoNextSurah ? "Auto Play Surahs: ON" : "Auto Play Surahs: OFF"}
              >
                <SkipForward size={12} />
                <span className="hidden sm:inline">Auto Play Surahs</span>
              </button>
              <button
                onClick={stopPlayback}
                className="text-xs text-themed-muted hover:text-themed transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed ${playingVerse !== null ? "bottom-20" : "bottom-6"} right-6 w-10 h-10 rounded-full bg-[var(--color-gold)] text-[var(--color-bg)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50`}
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
