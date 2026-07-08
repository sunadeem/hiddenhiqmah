"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Pencil, Plus, Check } from "lucide-react";
import { DhikrCounter } from "@hidden-hiqmah/ui/components/daily/DhikrCounter";
import type { DailyAdapter } from "@hidden-hiqmah/ui/lib/daily/types";
import { hapticLight } from "@/lib/mobile/haptics";
import {
  DHIKR_CATALOG_BY_KEY,
  DEFAULT_WORSHIP_DHIKR,
} from "@/lib/dhikr/catalog";
import {
  getWorshipDhikr,
  addWorshipDhikr,
  removeWorshipDhikr,
  setWorshipGoal,
  subscribeWorshipDhikr,
  useWorshipDhikrSync,
} from "@/lib/dhikr/worshipDhikr";
import {
  AddDhikrDialog,
  ManageRow,
  type ManageCard,
} from "@/components/dhikr/DhikrEditing";

export default function WorshipDhikrSection({
  adapter,
  today,
}: {
  adapter: DailyAdapter;
  today: string;
}) {
  useWorshipDhikrSync();
  const [store, setStore] = useState(() => getWorshipDhikr());
  const [manage, setManage] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => subscribeWorshipDhikr(() => setStore(getWorshipDhikr())), []);

  const cards: ManageCard[] = useMemo(() => {
    const out: ManageCard[] = [];
    const seen = new Set<string>();
    for (const d of DEFAULT_WORSHIP_DHIKR) {
      const entry = DHIKR_CATALOG_BY_KEY[d.key];
      out.push({
        key: d.key,
        label: entry?.label ?? d.key,
        goal: store.goals[d.key] ?? d.goal,
        isCustom: false,
      });
      seen.add(d.key);
    }
    for (const k of store.added) {
      if (seen.has(k)) continue;
      const entry = DHIKR_CATALOG_BY_KEY[k];
      if (!entry) continue;
      out.push({
        key: k,
        label: entry.label,
        goal: store.goals[k] ?? entry.defaultGoal,
        isCustom: true,
      });
      seen.add(k);
    }
    return out;
  }, [store]);

  const presentKeys = useMemo(() => new Set(cards.map((c) => c.key)), [cards]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted">Dhikr</div>
        <div className="flex items-center gap-3">
          <Link
            href="/dhikr-stats"
            className="flex items-center gap-1 text-[11px] font-medium text-gold/80 hover:text-gold touch-manipulation"
          >
            <BarChart3 size={12} /> Dhikr Stats
          </Link>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setManage((m) => !m);
            }}
            className={`flex items-center gap-1 text-[11px] font-medium touch-manipulation ${
              manage ? "text-gold" : "text-themed-muted hover:text-gold"
            }`}
          >
            {manage ? (
              <>
                <Check size={12} /> Done
              </>
            ) : (
              <>
                <Pencil size={12} /> Edit
              </>
            )}
          </button>
        </div>
      </div>

      {manage
        ? cards.map((c) => (
            <ManageRow
              key={c.key}
              card={c}
              onGoal={(g) => setWorshipGoal(c.key, g)}
              onDelete={() => {
                hapticLight();
                removeWorshipDhikr(c.key);
              }}
            />
          ))
        : cards.map((c) => (
            <DhikrCounter
              key={c.key}
              adapter={adapter}
              today={today}
              dhikrKey={c.key}
              label={c.label}
              goal={c.goal}
              onHaptic={hapticLight}
            />
          ))}

      <button
        type="button"
        onClick={() => {
          hapticLight();
          setAdding(true);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed sidebar-border text-themed-muted hover:text-gold py-3 text-sm font-medium touch-manipulation active:scale-[0.99] transition"
      >
        <Plus size={16} /> Add dhikr
      </button>

      {adding && (
        <AddDhikrDialog
          presentKeys={presentKeys}
          onClose={() => setAdding(false)}
          onAdd={(key, goal) => {
            addWorshipDhikr(key, goal);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
