"use client";

import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";

export default function ProphetMuhammadPage() {
  return (
    <div>
      <PageHeader
        title="Prophet Muhammad"
        titleAr="النبي محمد ﷺ"
        subtitle="The final Messenger of Allah — his life, character, and legacy"
      />

      <ContentCard>
        <div className="text-center py-12">
          <p className="text-2xl font-arabic text-gold leading-loose mb-4">
            وَمَآ أَرْسَلْنَـٰكَ إِلَّا رَحْمَةًۭ لِّلْعَـٰلَمِينَ
          </p>
          <p className="text-themed-muted italic mb-2">
            &ldquo;And We have not sent you, [O Muhammad], except as a mercy to the worlds.&rdquo;
          </p>
          <p className="text-xs text-themed-muted">Quran 21:107</p>
          <p className="text-themed-muted text-sm mt-8">
            Coming soon — a comprehensive look at the life, character, miracles, and teachings of the Prophet Muhammad (peace be upon him).
          </p>
        </div>
      </ContentCard>
    </div>
  );
}
