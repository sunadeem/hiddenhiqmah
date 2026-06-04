import bukhari from "@hidden-hiqmah/content/hadith/bukhari/metadata.json";
import muslim from "@hidden-hiqmah/content/hadith/muslim/metadata.json";
import abudawud from "@hidden-hiqmah/content/hadith/abudawud/metadata.json";
import tirmidhi from "@hidden-hiqmah/content/hadith/tirmidhi/metadata.json";
import nasai from "@hidden-hiqmah/content/hadith/nasai/metadata.json";
import ibnmajah from "@hidden-hiqmah/content/hadith/ibnmajah/metadata.json";
import ahmad from "@hidden-hiqmah/content/hadith/ahmad/metadata.json";
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
