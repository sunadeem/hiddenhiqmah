import { prophets } from "@/data/prophets";
import ProphetDetailClient from "./PageClient";

export function generateStaticParams() {
  return prophets.map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProphetDetailClient params={params} />;
}
