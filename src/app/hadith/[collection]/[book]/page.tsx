import bukhari from "@/data/hadith/bukhari/metadata.json";
import muslim from "@/data/hadith/muslim/metadata.json";
import abudawud from "@/data/hadith/abudawud/metadata.json";
import tirmidhi from "@/data/hadith/tirmidhi/metadata.json";
import nasai from "@/data/hadith/nasai/metadata.json";
import ibnmajah from "@/data/hadith/ibnmajah/metadata.json";
import ahmad from "@/data/hadith/ahmad/metadata.json";
import BookPageClient from "./PageClient";

const COLLECTIONS: Record<string, { books: { id: number }[] }> = {
  bukhari,
  muslim,
  abudawud,
  tirmidhi,
  nasai,
  ibnmajah,
  ahmad,
};

export function generateStaticParams() {
  return Object.entries(COLLECTIONS).flatMap(([collection, meta]) =>
    meta.books.map((b) => ({ collection, book: String(b.id) }))
  );
}

export default function Page() {
  return <BookPageClient />;
}
