"use client";

import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { CalendarDays } from "lucide-react";

const months = [
  { name: "Muharram", nameAr: "محرم", note: "Sacred month. Fasting on the 10th (Ashura) expiates the previous year's sins." },
  { name: "Safar", nameAr: "صفر", note: "" },
  { name: "Rabi al-Awwal", nameAr: "ربيع الأول", note: "Birth month of the Prophet Muhammad (peace be upon him)." },
  { name: "Rabi al-Thani", nameAr: "ربيع الثاني", note: "" },
  { name: "Jumada al-Ula", nameAr: "جمادى الأولى", note: "" },
  { name: "Jumada al-Thani", nameAr: "جمادى الثانية", note: "" },
  { name: "Rajab", nameAr: "رجب", note: "Sacred month. The month of al-Isra wal-Mi'raj." },
  { name: "Sha'ban", nameAr: "شعبان", note: "The Prophet (peace be upon him) used to fast most of this month." },
  { name: "Ramadan", nameAr: "رمضان", note: "The month of fasting, Quran, and Laylatul Qadr." },
  { name: "Shawwal", nameAr: "شوال", note: "Eid al-Fitr. Fasting six days equals fasting the entire year." },
  { name: "Dhul Qi'dah", nameAr: "ذو القعدة", note: "Sacred month." },
  { name: "Dhul Hijjah", nameAr: "ذو الحجة", note: "Sacred month. Hajj season. First 10 days are the best days of the year." },
];

export default function IslamicCalendarPage() {
  return (
    <>
      <PageHeader
        title="Islamic Calendar"
        titleAr="التقويم الهجري"
        subtitle="The twelve months of the Hijri calendar and their significance."
      />

      <div className="grid gap-3 mt-2">
        {months.map((month, i) => (
          <ContentCard key={month.name} delay={0.05 + i * 0.03}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="text-gold font-semibold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-themed">{month.name}</h3>
                  <span className="text-gold/70 font-arabic text-sm">{month.nameAr}</span>
                </div>
                {month.note && (
                  <p className="text-themed-muted text-sm mt-0.5">{month.note}</p>
                )}
              </div>
            </div>
          </ContentCard>
        ))}
      </div>

      <ContentCard delay={0.5} className="mt-6">
        <div className="text-center py-6 text-themed-muted">
          <CalendarDays size={28} className="mx-auto mb-3 text-gold/40" />
          <p className="text-sm">Live Hijri date converter, important Islamic dates, and event reminders coming soon.</p>
        </div>
      </ContentCard>
    </>
  );
}
