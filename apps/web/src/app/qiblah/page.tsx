"use client";

import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import QiblahSection from "@/components/QiblahSection";

export default function QiblahPage() {
  return (
    <div>
      <PageHeader
        title="Qiblah"
        titleAr="القبلة"
        subtitle="Find the direction of the Ka'bah from wherever you are"
      />
      <div className="max-w-4xl mx-auto">
        <QiblahSection />
      </div>
    </div>
  );
}
