import { prophets, righteousFigures } from "@hidden-hiqmah/content/prophets";
import ProphetDetailClient from "./PageClient";

export function generateStaticParams() {
  // The twenty-five prophets plus the righteous figures whose prophethood
  // scholars debated (Maryam, Al-Khidr, Dhul-Qarnayn, Luqman) — both get a
  // /prophets/{slug} deep-dive.
  return [...prophets, ...righteousFigures].map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProphetDetailClient params={params} />;
}
