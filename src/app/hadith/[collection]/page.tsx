import CollectionPageClient from "./PageClient";

const COLLECTIONS = [
  "bukhari",
  "muslim",
  "abudawud",
  "tirmidhi",
  "nasai",
  "ibnmajah",
  "ahmad",
] as const;

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ collection }));
}

export default function Page() {
  return <CollectionPageClient />;
}
