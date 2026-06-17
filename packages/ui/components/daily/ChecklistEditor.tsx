"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Trash2, Plus, X } from "lucide-react";
import type { DailyAdapter, UserItem } from "../../lib/daily/types";

/**
 * Edit the user's checklist template: reorder (drag handle), rename (inline),
 * remove, add. Changes apply going forward (today stays frozen once started).
 */
export function ChecklistEditor({
  adapter,
  onClose,
}: {
  adapter: DailyAdapter;
  onClose: () => void;
}) {
  const [items, setItems] = useState<UserItem[]>([]);
  const [adding, setAdding] = useState("");
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    adapter.getUserItems().then(setItems);
  }, [adapter]);

  function persistOrder(next: UserItem[]) {
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(() => {
      void adapter.reorderItems(next.map((i) => i.id));
    }, 400);
  }

  function handleReorder(next: UserItem[]) {
    setItems(next);
    persistOrder(next);
  }

  async function rename(id: string, label: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)));
    await adapter.editItem(id, { label });
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await adapter.removeItem(id);
  }

  async function add() {
    const label = adding.trim();
    if (!label) return;
    setAdding("");
    await adapter.addItem({ label, kind: "task" });
    setItems(await adapter.getUserItems());
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-themed">Edit list</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-themed-muted touch-manipulation"
          aria-label="Done editing"
        >
          <X size={20} />
        </button>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="card-bg rounded-2xl border sidebar-border overflow-hidden"
      >
        {items.map((item, i) => (
          <EditRow
            key={item.id}
            item={item}
            first={i === 0}
            onRename={rename}
            onRemove={remove}
          />
        ))}
      </Reorder.Group>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void add();
          }}
          placeholder="Add an item…"
          className="flex-1 px-4 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)]"
        />
        <button
          type="button"
          onClick={() => void add()}
          className="shrink-0 w-11 h-11 rounded-xl bg-[var(--color-gold)] text-[var(--color-bg)] flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          aria-label="Add item"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-3 text-xs text-themed-muted">
        Reorder with the handle. Changes apply going forward — a day you’ve already
        started stays as it was.
      </p>
    </div>
  );
}

function EditRow({
  item,
  first,
  onRename,
  onRemove,
}: {
  item: UserItem;
  first: boolean;
  onRename: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}) {
  const controls = useDragControls();
  const [label, setLabel] = useState(item.label);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={`flex items-center gap-2 px-3 bg-[var(--color-card)] ${
        first ? "" : "border-t sidebar-border"
      }`}
      style={{ minHeight: 52 }}
    >
      <span
        onPointerDown={(e) => controls.start(e)}
        className="p-1 text-themed-muted cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ touchAction: "none" }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </span>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label.trim() && label !== item.label && onRename(item.id, label.trim())}
        className="flex-1 bg-transparent py-3 text-[15px] text-themed focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-2 text-themed-muted hover:text-red-400 touch-manipulation"
        aria-label={`Remove ${item.label}`}
      >
        <Trash2 size={16} />
      </button>
    </Reorder.Item>
  );
}

export default ChecklistEditor;
