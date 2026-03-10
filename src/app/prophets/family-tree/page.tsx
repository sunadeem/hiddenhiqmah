"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { getProphetBySlug } from "@/data/prophets";
import {
  familyTree,
  treeReferences,
  type FamilyNode,
  type WifeNode,
} from "@/data/prophet-family-tree";

// Layout constants
const LEVEL_H = 80;
const NODE_H = 44;
const MIN_GAP = 16;
const WIFE_GAP = 6;
const WIFE_CONNECTOR_Y_OFFSET = NODE_H / 2;

type SelectedItem =
  | { type: "family"; node: FamilyNode }
  | { type: "wife"; wife: WifeNode }
  | null;

function estimateWidth(name: string): number {
  const charW = 7.5;
  const padding = 28;
  return Math.max(name.length * charW + padding, 65);
}

function estimateNodeWidth(node: FamilyNode): number {
  return estimateWidth(node.name);
}

function estimateWifeWidth(wife: WifeNode): number {
  return estimateWidth(wife.name);
}

function wivesExtraRight(node: FamilyNode, showWives: boolean): number {
  if (!showWives || !node.wives?.length) return 0;
  const hw = estimateNodeWidth(node) / 2;
  let extra = hw;
  for (const wife of node.wives) {
    extra += WIFE_GAP + estimateWifeWidth(wife);
  }
  return extra - hw;
}

// --- Reingold-Tilford-inspired compact tree layout ---

interface LNode {
  node: FamilyNode;
  x: number;
  children: LNode[];
  lc: number[];
  rc: number[];
}

function layoutTree(node: FamilyNode, showWives: boolean): LNode {
  const hw = estimateNodeWidth(node) / 2;
  const extraRight = wivesExtraRight(node, showWives);
  const rightEdge = hw + extraRight;

  if (!node.children?.length) {
    return { node, x: 0, children: [], lc: [-hw], rc: [rightEdge] };
  }

  const kids = node.children.map((c) => layoutTree(c, showWives));

  const offsets: number[] = [0];
  let mergedRC = kids[0].rc.slice();

  for (let i = 1; i < kids.length; i++) {
    const next = kids[i];
    let shift = 0;
    const depth = Math.min(mergedRC.length, next.lc.length);
    for (let d = 0; d < depth; d++) {
      shift = Math.max(shift, mergedRC[d] + MIN_GAP - next.lc[d]);
    }
    offsets.push(shift);

    for (let d = 0; d < next.rc.length; d++) {
      const val = shift + next.rc[d];
      if (d < mergedRC.length) {
        mergedRC[d] = Math.max(mergedRC[d], val);
      } else {
        mergedRC.push(val);
      }
    }
  }

  const firstX = offsets[0];
  const lastX = offsets[offsets.length - 1];
  const center = (firstX + lastX) / 2;

  const children = kids.map((k, i) => ({
    ...k,
    x: offsets[i] - center,
  }));

  const lc: number[] = [-hw];
  const rc: number[] = [rightEdge];

  let maxD = 0;
  for (const c of children) maxD = Math.max(maxD, c.lc.length);

  for (let d = 0; d < maxD; d++) {
    let minL = Infinity;
    let maxR = -Infinity;
    for (const c of children) {
      if (d < c.lc.length) {
        minL = Math.min(minL, c.x + c.lc[d]);
        maxR = Math.max(maxR, c.x + c.rc[d]);
      }
    }
    lc.push(minL);
    rc.push(maxR);
  }

  return { node, x: 0, children, lc, rc };
}

// Convert relative layout to absolute coordinates
interface WifePos {
  x: number;
  y: number;
  wife: WifeNode;
}

interface ANode {
  x: number;
  y: number;
  node: FamilyNode;
  children: ANode[];
  wives: WifePos[];
}

function toAbsolute(ln: LNode, ox: number, depth: number, showWives: boolean): ANode {
  const x = ox + ln.x;
  const y = depth * LEVEL_H;

  const wives: WifePos[] = [];
  if (showWives && ln.node.wives?.length) {
    const hw = estimateNodeWidth(ln.node) / 2;
    let wifeX = x + hw;
    for (const wife of ln.node.wives) {
      const ww = estimateWifeWidth(wife);
      wifeX += WIFE_GAP + ww / 2;
      wives.push({ x: wifeX, y, wife });
      wifeX += ww / 2;
    }
  }

  return {
    x,
    y,
    node: ln.node,
    children: ln.children.map((c) => toAbsolute(c, x, depth + 1, showWives)),
    wives,
  };
}

function getMaxY(n: ANode): number {
  if (!n.children.length) return n.y;
  return Math.max(...n.children.map(getMaxY));
}

function getBounds(n: ANode): { minX: number; maxX: number } {
  const hw = estimateNodeWidth(n.node) / 2;
  let minX = n.x - hw;
  let maxX = n.x + hw;

  for (const w of n.wives) {
    const ww = estimateWifeWidth(w.wife) / 2;
    maxX = Math.max(maxX, w.x + ww);
  }

  for (const c of n.children) {
    const cb = getBounds(c);
    minX = Math.min(minX, cb.minX);
    maxX = Math.max(maxX, cb.maxX);
  }
  return { minX, maxX };
}

// --- SVG connector lines ---

function WifeConnectorLines({ pos }: { pos: ANode }) {
  if (!pos.wives.length) return null;

  const hw = estimateNodeWidth(pos.node) / 2;
  const connY = pos.y + WIFE_CONNECTOR_Y_OFFSET;
  const startX = pos.x + hw;
  const lastWife = pos.wives[pos.wives.length - 1];

  return (
    <line
      x1={startX}
      y1={connY}
      x2={lastWife.x - estimateWifeWidth(lastWife.wife) / 2}
      y2={connY}
      stroke="var(--color-border)"
      strokeWidth={1}
      strokeDasharray="3 3"
      opacity={0.5}
    />
  );
}

function ConnectorLines({ pos }: { pos: ANode }) {
  const els: React.ReactElement[] = [];

  if (pos.wives.length) {
    els.push(<WifeConnectorLines key="wives" pos={pos} />);
  }

  if (!pos.children.length) {
    return <>{els}</>;
  }

  const parentBottomY = pos.y + NODE_H;
  const childrenY = pos.children[0].y;
  const barY = parentBottomY + (childrenY - parentBottomY) * 0.45;

  els.push(
    <line
      key="pd"
      x1={pos.x}
      y1={parentBottomY}
      x2={pos.x}
      y2={barY}
      stroke="var(--color-border)"
      strokeWidth={1.5}
    />
  );

  const GAP_H = 22;

  const addGapIndicator = (
    key: string,
    cx: number,
    solidEndY: number,
    nodeY: number,
    hasGap: boolean
  ) => {
    if (hasGap) {
      els.push(
        <line
          key={`${key}-solid`}
          x1={cx}
          y1={solidEndY}
          x2={cx}
          y2={nodeY - GAP_H}
          stroke="var(--color-border)"
          strokeWidth={1.5}
        />
      );
      els.push(
        <line
          key={`${key}-dash`}
          x1={cx}
          y1={nodeY - GAP_H}
          x2={cx}
          y2={nodeY}
          stroke="#6ba3be"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      );
      els.push(
        <text
          key={`${key}-lbl`}
          x={cx + 8}
          y={nodeY - GAP_H / 2 + 3}
          fontSize={10}
          fill="#6ba3be"
          opacity={0.8}
        >
          ...
        </text>
      );
    } else {
      els.push(
        <line
          key={`${key}-solid`}
          x1={cx}
          y1={solidEndY}
          x2={cx}
          y2={nodeY}
          stroke="var(--color-border)"
          strokeWidth={1.5}
        />
      );
    }
  };

  if (pos.children.length === 1) {
    const c = pos.children[0];
    addGapIndicator("sc", c.x, barY, c.y, !!c.node.gap);
    if (pos.x !== c.x) {
      els.push(
        <line
          key="sc-h"
          x1={pos.x}
          y1={barY}
          x2={c.x}
          y2={barY}
          stroke="var(--color-border)"
          strokeWidth={1.5}
        />
      );
    }
  } else {
    const firstX = pos.children[0].x;
    const lastX = pos.children[pos.children.length - 1].x;
    els.push(
      <line
        key="hb"
        x1={firstX}
        y1={barY}
        x2={lastX}
        y2={barY}
        stroke="var(--color-border)"
        strokeWidth={1.5}
      />
    );
    pos.children.forEach((c, i) => {
      addGapIndicator(`cv-${i}`, c.x, barY, c.y, !!c.node.gap);
    });
  }

  return (
    <>
      {els}
      {pos.children.map((c, i) => (
        <ConnectorLines key={i} pos={c} />
      ))}
    </>
  );
}

// --- Node rendering ---

function NodeBoxes({
  pos,
  selected,
  onSelect,
}: {
  pos: ANode;
  selected: SelectedItem;
  onSelect: (item: SelectedItem) => void;
}) {
  const { node } = pos;
  const isProphet = node.isProphet;
  const isSelected = selected?.type === "family" && selected.node === node;

  return (
    <>
      <div
        className="absolute cursor-pointer"
        style={{ left: pos.x, top: pos.y, transform: "translateX(-50%)" }}
        onClick={() => onSelect({ type: "family", node })}
      >
        <div
          className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg border transition-all ${
            isSelected
              ? isProphet
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/20 ring-2 ring-[var(--color-gold)]/30"
                : "border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/30"
              : isProphet
                ? "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/60"
                : "sidebar-border bg-[var(--color-card)] hover:border-[var(--color-text-muted)]/40"
          }`}
        >
          <span
            className={`font-medium text-xs md:text-sm whitespace-nowrap ${
              isProphet ? "text-gold" : "text-themed"
            }`}
          >
            {node.name}
          </span>
          {node.nameAr && (
            <span
              className={`text-[10px] md:text-xs font-arabic leading-tight ${
                isProphet ? "text-gold/70" : "text-themed-muted/70"
              }`}
            >
              {node.nameAr}
            </span>
          )}
        </div>
      </div>

      {/* Wife nodes */}
      {pos.wives.map((w, i) => {
        const isWifeSelected = selected?.type === "wife" && selected.wife === w.wife;
        return (
          <div
            key={`wife-${i}`}
            className="absolute cursor-pointer"
            style={{ left: w.x, top: w.y, transform: "translateX(-50%)" }}
            onClick={() => onSelect({ type: "wife", wife: w.wife })}
          >
            <div
              className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border transition-all ${
                isWifeSelected
                  ? "border-[#c084a0] bg-[#c084a0]/20 ring-2 ring-[#c084a0]/30"
                  : "border-[#c084a0]/30 bg-[#c084a0]/8 hover:border-[#c084a0]/60"
              }`}
            >
              <span className="font-medium text-xs whitespace-nowrap text-[#c084a0]">
                {w.wife.name}
              </span>
              {w.wife.nameAr && (
                <span className="text-[10px] font-arabic leading-tight text-[#c084a0]/70">
                  {w.wife.nameAr}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {pos.children.map((c, i) => (
        <NodeBoxes
          key={i}
          pos={c}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

// --- Detail panel ---

function DetailPanel({
  item,
  onClose,
}: {
  item: SelectedItem;
  onClose: () => void;
}) {
  if (!item) return null;

  if (item.type === "wife") {
    const { wife } = item;
    return (
      <ContentCard className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-lg font-semibold text-themed">{wife.name}</h3>
            {wife.nameAr && (
              <span className="text-lg font-arabic" style={{ color: "#c084a0" }}>{wife.nameAr}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-themed-muted hover:text-themed transition-colors shrink-0 mt-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs border rounded-full px-3 py-0.5" style={{ color: "#c084a0", borderColor: "rgba(192, 132, 160, 0.3)", backgroundColor: "rgba(192, 132, 160, 0.1)" }}>
            Wife / Mother
          </span>
        </div>

        <p className="text-sm text-themed-muted leading-relaxed mb-3">
          {wife.description || "Details coming soon."}
        </p>
      </ContentCard>
    );
  }

  const { node } = item;
  const prophet = node.isProphet && node.slug ? getProphetBySlug(node.slug) : null;

  return (
    <ContentCard className="mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="text-lg font-semibold text-themed">{node.name}</h3>
          {node.nameAr && (
            <span className="text-lg font-arabic text-gold">{node.nameAr}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-themed-muted hover:text-themed transition-colors shrink-0 mt-1"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {node.isProphet ? (
          <span className="text-xs text-gold border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 rounded-full px-3 py-0.5">
            Prophet
          </span>
        ) : (
          <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-0.5">
            Family Member
          </span>
        )}
        {prophet && prophet.era && (
          <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-0.5">
            {prophet.era}
          </span>
        )}
        {prophet && prophet.mentions > 0 && (
          <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-0.5">
            Mentioned {prophet.mentions}x in Quran
          </span>
        )}
        {prophet && prophet.surahs && (
          <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-0.5">
            {prophet.surahs}
          </span>
        )}
      </div>

      <p className="text-sm text-themed-muted leading-relaxed mb-3">
        {node.description || prophet?.summary || node.note || "Details coming soon."}
      </p>

      {node.description && prophet?.summary && node.description !== prophet.summary && (
        <p className="text-sm text-themed-muted leading-relaxed mb-3 italic">
          {prophet.summary}
        </p>
      )}

      {node.isProphet && node.slug && (
        <Link
          href={`/prophets/${node.slug}`}
          className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:gap-2 transition-all"
        >
          Read Full Story <ArrowRight size={14} />
        </Link>
      )}
    </ContentCard>
  );
}

// --- Page ---

export default function FamilyTreePage() {
  const [selected, setSelected] = useState<SelectedItem>({
    type: "family",
    node: familyTree,
  });
  const [showWives, setShowWives] = useState(false);

  const { tree, totalW, totalH } = useMemo(() => {
    const layout = layoutTree(familyTree, showWives);
    const raw = toAbsolute(layout, 0, 0, showWives);
    const bounds = getBounds(raw);
    const padding = 24;
    const shifted = toAbsolute(layout, -bounds.minX + padding, 0, showWives);
    const totalW = bounds.maxX - bounds.minX + padding * 2;
    const totalH = getMaxY(shifted) + NODE_H + 24;
    return { tree: shifted, totalW, totalH };
  }, [showWives]);

  return (
    <div>
      <Link
        href="/prophets"
        className="inline-flex items-center gap-1 text-sm text-themed-muted hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        All Prophets
      </Link>

      <PageHeader
        title="Family Tree of the Prophets"
        titleAr="شجرة أنساب الأنبياء"
        subtitle="The genealogical connections between the prophets and their families"
      />

      {/* Legend */}
      <ContentCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10">
              <span className="text-gold font-medium text-xs">Prophet</span>
            </div>
            <span className="text-themed-muted text-xs">= Prophet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md border sidebar-border bg-[var(--color-card)]">
              <span className="text-themed font-medium text-xs">Family</span>
            </div>
            <span className="text-themed-muted text-xs">= Non-prophet</span>
          </div>
          {showWives && (
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-md border" style={{ borderColor: "rgba(192, 132, 160, 0.3)", backgroundColor: "rgba(192, 132, 160, 0.08)" }}>
                <span className="font-medium text-xs" style={{ color: "#c084a0" }}>Wife</span>
              </div>
              <span className="text-themed-muted text-xs">= Wife / Mother</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg width={24} height={12}>
                <line
                  x1={0}
                  y1={6}
                  x2={24}
                  y2={6}
                  stroke="#6ba3be"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
              </svg>
              <span
                style={{ color: "#6ba3be" }}
                className="text-[10px] opacity-80"
              >
                ...
              </span>
            </div>
            <span className="text-themed-muted text-xs">
              = Generations gap <span className="italic">(dashed connections indicate multiple generations between nodes; not all intermediate ancestors are known or documented)</span>
            </span>
          </div>
        </div>
      </ContentCard>

      {/* Tree */}
      <ContentCard>
        {/* Show Wives toggle */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setShowWives(!showWives)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showWives
                ? "border-[#c084a0]/50 bg-[#c084a0]/10 text-[#c084a0]"
                : "sidebar-border bg-[var(--color-card)] text-themed-muted hover:border-[var(--color-text-muted)]/40"
            }`}
          >
            <span
              className={`inline-block w-7 h-4 rounded-full relative transition-colors ${
                showWives ? "bg-[#c084a0]/40" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                  showWives ? "left-3.5 bg-[#c084a0]" : "left-0.5 bg-[var(--color-text-muted)]"
                }`}
              />
            </span>
            Show Wives
          </button>
        </div>

        <div className="overflow-x-auto pb-4">
          <div
            className="relative mx-auto"
            style={{ width: totalW, height: totalH }}
          >
            <svg
              className="absolute inset-0"
              width={totalW}
              height={totalH}
              style={{ overflow: "visible" }}
            >
              <ConnectorLines pos={tree} />
            </svg>
            <NodeBoxes pos={tree} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      </ContentCard>

      {/* Detail panel */}
      <p className="text-xs text-themed-muted italic mt-6 mb-2">
        Click a person in the family tree to view details about them below
      </p>
      {selected && (
        <DetailPanel item={selected} onClose={() => setSelected(null)} />
      )}

      {/* References */}
      <ContentCard className="mt-6">
        <h3 className="text-sm font-semibold text-themed mb-2">
          Sources & References
        </h3>
        <ul className="space-y-1">
          {treeReferences.map((ref, i) => (
            <li key={i} className="text-xs text-themed-muted">
              {ref}
            </li>
          ))}
        </ul>
      </ContentCard>
    </div>
  );
}
