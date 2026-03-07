"use client";

import { motion } from "framer-motion";

type Position =
  | "standing"
  | "hands-raised"
  | "hands-folded"
  | "bowing"
  | "standing-from-bow"
  | "prostrating"
  | "sitting"
  | "taslim-right"
  | "taslim-left";

interface PrayerFigureProps {
  position: Position;
  gender: "male" | "female";
}

/* ─── Minimalist SVG prayer silhouettes ─── */

function MaleFigure({ position }: { position: Position }) {
  return (
    <svg viewBox="0 0 200 300" className="w-full h-full" fill="none">
      {position === "standing" && (
        <g>
          {/* Head */}
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          {/* Kufi/cap */}
          <path d="M80 50 Q100 30 120 50" fill="var(--color-gold)" opacity="0.6" />
          {/* Body */}
          <rect x="82" y="75" width="36" height="80" rx="8" fill="var(--color-gold)" opacity="0.3" />
          {/* Thobe/garment lower */}
          <path d="M78 145 L78 240 Q78 250 88 250 L112 250 Q122 250 122 240 L122 145 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Arms at sides */}
          <rect x="68" y="80" width="12" height="55" rx="6" fill="var(--color-gold)" opacity="0.3" />
          <rect x="120" y="80" width="12" height="55" rx="6" fill="var(--color-gold)" opacity="0.3" />
          {/* Feet */}
          <ellipse cx="90" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="110" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
        </g>
      )}

      {position === "hands-raised" && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M80 50 Q100 30 120 50" fill="var(--color-gold)" opacity="0.6" />
          <rect x="82" y="75" width="36" height="80" rx="8" fill="var(--color-gold)" opacity="0.3" />
          <path d="M78 145 L78 240 Q78 250 88 250 L112 250 Q122 250 122 240 L122 145 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Hands raised to ears */}
          <rect x="58" y="45" width="12" height="50" rx="6" fill="var(--color-gold)" opacity="0.4" />
          <rect x="130" y="45" width="12" height="50" rx="6" fill="var(--color-gold)" opacity="0.4" />
          {/* Palms */}
          <rect x="55" y="38" width="18" height="12" rx="4" fill="var(--color-gold)" opacity="0.5" />
          <rect x="127" y="38" width="18" height="12" rx="4" fill="var(--color-gold)" opacity="0.5" />
          <ellipse cx="90" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="110" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
        </g>
      )}

      {position === "hands-folded" && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M80 50 Q100 30 120 50" fill="var(--color-gold)" opacity="0.6" />
          <rect x="82" y="75" width="36" height="80" rx="8" fill="var(--color-gold)" opacity="0.3" />
          <path d="M78 145 L78 240 Q78 250 88 250 L112 250 Q122 250 122 240 L122 145 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Arms folded on chest */}
          <path d="M74 82 Q74 105 92 110 L108 110 Q126 105 126 82" fill="none" stroke="var(--color-gold)" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
          {/* Hands overlapping on chest */}
          <ellipse cx="100" cy="110" rx="16" ry="8" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="90" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="110" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
        </g>
      )}

      {position === "bowing" && (
        <g>
          {/* Head (forward) */}
          <circle cx="55" cy="110" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M38 106 Q55 88 72 106" fill="var(--color-gold)" opacity="0.6" />
          {/* Back (horizontal) */}
          <rect x="60" y="100" width="70" height="30" rx="10" fill="var(--color-gold)" opacity="0.3" />
          {/* Legs */}
          <rect x="118" y="125" width="16" height="90" rx="8" fill="var(--color-gold)" opacity="0.25" />
          <rect x="100" y="125" width="16" height="90" rx="8" fill="var(--color-gold)" opacity="0.25" />
          {/* Hands on knees */}
          <circle cx="112" cy="192" r="7" fill="var(--color-gold)" opacity="0.4" />
          <circle cx="128" cy="192" r="7" fill="var(--color-gold)" opacity="0.4" />
          {/* Arms */}
          <line x1="70" y1="120" x2="112" y2="185" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="80" y1="120" x2="128" y2="185" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <ellipse cx="112" cy="220" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="128" cy="220" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
        </g>
      )}

      {(position === "standing-from-bow") && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M80 50 Q100 30 120 50" fill="var(--color-gold)" opacity="0.6" />
          <rect x="82" y="75" width="36" height="80" rx="8" fill="var(--color-gold)" opacity="0.3" />
          <path d="M78 145 L78 240 Q78 250 88 250 L112 250 Q122 250 122 240 L122 145 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Arms at sides */}
          <rect x="68" y="80" width="12" height="55" rx="6" fill="var(--color-gold)" opacity="0.3" />
          <rect x="120" y="80" width="12" height="55" rx="6" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="90" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
          <ellipse cx="110" cy="255" rx="10" ry="5" fill="var(--color-gold)" opacity="0.3" />
        </g>
      )}

      {position === "prostrating" && (
        <g>
          {/* Head on ground */}
          <circle cx="40" cy="215" r="16" fill="var(--color-gold)" opacity="0.8" />
          <path d="M25 212 Q40 196 55 212" fill="var(--color-gold)" opacity="0.6" />
          {/* Back (angled up) */}
          <path d="M52 210 Q80 170 120 160 L130 160 Q140 165 140 175 L130 200 Q120 210 110 210 Z" fill="var(--color-gold)" opacity="0.3" />
          {/* Legs folded */}
          <path d="M125 185 Q145 195 155 220 Q158 230 150 235 L130 235 Q120 230 120 220 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Hands on ground */}
          <ellipse cx="55" cy="228" rx="10" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="30" cy="228" rx="10" ry="6" fill="var(--color-gold)" opacity="0.4" />
          {/* Ground line */}
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "sitting" && (
        <g>
          {/* Head */}
          <circle cx="100" cy="85" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M83 81 Q100 64 117 81" fill="var(--color-gold)" opacity="0.6" />
          {/* Torso (upright, sitting) */}
          <rect x="84" y="103" width="32" height="60" rx="8" fill="var(--color-gold)" opacity="0.3" />
          {/* Legs folded under */}
          <path d="M78 155 Q78 190 100 195 Q122 190 140 195 Q155 200 155 210 L155 220 Q155 230 145 230 L75 230 Q65 230 65 220 L65 195 Q65 170 78 155 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Hands on knees/thighs */}
          <ellipse cx="85" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="115" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          {/* Arms */}
          <line x1="78" y1="115" x2="85" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="122" y1="115" x2="115" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "taslim-right" && (
        <g>
          <circle cx="108" cy="83" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M91 79 Q108 62 125 79" fill="var(--color-gold)" opacity="0.6" />
          {/* Rotation indicator */}
          <path d="M128 80 L138 76 L136 88" fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity="0.5" />
          <rect x="84" y="103" width="32" height="60" rx="8" fill="var(--color-gold)" opacity="0.3" />
          <path d="M78 155 Q78 190 100 195 Q122 190 140 195 Q155 200 155 210 L155 220 Q155 230 145 230 L75 230 Q65 230 65 220 L65 195 Q65 170 78 155 Z" fill="var(--color-gold)" opacity="0.25" />
          <ellipse cx="85" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="115" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <line x1="78" y1="115" x2="85" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="122" y1="115" x2="115" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "taslim-left" && (
        <g>
          <circle cx="92" cy="83" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M75 79 Q92 62 109 79" fill="var(--color-gold)" opacity="0.6" />
          {/* Rotation indicator */}
          <path d="M72 80 L62 76 L64 88" fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity="0.5" />
          <rect x="84" y="103" width="32" height="60" rx="8" fill="var(--color-gold)" opacity="0.3" />
          <path d="M78 155 Q78 190 100 195 Q122 190 140 195 Q155 200 155 210 L155 220 Q155 230 145 230 L75 230 Q65 230 65 220 L65 195 Q65 170 78 155 Z" fill="var(--color-gold)" opacity="0.25" />
          <ellipse cx="85" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="115" cy="170" rx="9" ry="6" fill="var(--color-gold)" opacity="0.4" />
          <line x1="78" y1="115" x2="85" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="122" y1="115" x2="115" y2="165" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}
    </svg>
  );
}

function FemaleFigure({ position }: { position: Position }) {
  return (
    <svg viewBox="0 0 200 300" className="w-full h-full" fill="none">
      {position === "standing" && (
        <g>
          {/* Head with hijab */}
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M75 50 Q75 30 100 25 Q125 30 125 50 L125 75 Q125 82 118 82 L82 82 Q75 82 75 75 Z" fill="var(--color-gold)" opacity="0.45" />
          {/* Body / abaya */}
          <path d="M78 82 L72 240 Q72 255 88 255 L112 255 Q128 255 128 240 L122 82 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Sleeves */}
          <path d="M78 85 L62 130 Q58 138 66 140 L78 135 Z" fill="var(--color-gold)" opacity="0.25" />
          <path d="M122 85 L138 130 Q142 138 134 140 L122 135 Z" fill="var(--color-gold)" opacity="0.25" />
        </g>
      )}

      {position === "hands-raised" && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M75 50 Q75 30 100 25 Q125 30 125 50 L125 75 Q125 82 118 82 L82 82 Q75 82 75 75 Z" fill="var(--color-gold)" opacity="0.45" />
          <path d="M78 82 L72 240 Q72 255 88 255 L112 255 Q128 255 128 240 L122 82 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Hands raised to shoulders */}
          <path d="M78 85 L58 55 Q54 48 60 46 L68 46 Q72 46 72 52 L78 80 Z" fill="var(--color-gold)" opacity="0.35" />
          <path d="M122 85 L142 55 Q146 48 140 46 L132 46 Q128 46 128 52 L122 80 Z" fill="var(--color-gold)" opacity="0.35" />
          {/* Palms */}
          <rect x="55" y="42" width="16" height="10" rx="4" fill="var(--color-gold)" opacity="0.5" />
          <rect x="129" y="42" width="16" height="10" rx="4" fill="var(--color-gold)" opacity="0.5" />
        </g>
      )}

      {position === "hands-folded" && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M75 50 Q75 30 100 25 Q125 30 125 50 L125 75 Q125 82 118 82 L82 82 Q75 82 75 75 Z" fill="var(--color-gold)" opacity="0.45" />
          <path d="M78 82 L72 240 Q72 255 88 255 L112 255 Q128 255 128 240 L122 82 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Arms folded on chest (higher for women) */}
          <path d="M78 85 Q78 100 92 104 L108 104 Q122 100 122 85" fill="none" stroke="var(--color-gold)" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <ellipse cx="100" cy="104" rx="16" ry="7" fill="var(--color-gold)" opacity="0.4" />
        </g>
      )}

      {position === "bowing" && (
        <g>
          {/* Head with hijab (forward) */}
          <circle cx="55" cy="110" r="16" fill="var(--color-gold)" opacity="0.8" />
          <path d="M38 105 Q38 88 55 83 Q72 88 72 105 L72 118 Q72 122 66 122 L44 122 Q38 122 38 118 Z" fill="var(--color-gold)" opacity="0.45" />
          {/* Back */}
          <path d="M62 112 Q85 100 120 108 L135 115 Q140 120 135 130 L120 140 Q100 148 70 138 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Legs */}
          <rect x="115" y="130" width="18" height="85" rx="9" fill="var(--color-gold)" opacity="0.2" />
          <rect x="98" y="130" width="18" height="85" rx="9" fill="var(--color-gold)" opacity="0.2" />
          {/* Hands on knees */}
          <circle cx="108" cy="192" r="7" fill="var(--color-gold)" opacity="0.4" />
          <circle cx="128" cy="192" r="7" fill="var(--color-gold)" opacity="0.4" />
          <line x1="68" y1="128" x2="108" y2="185" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
          <line x1="78" y1="128" x2="128" y2="185" stroke="var(--color-gold)" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
        </g>
      )}

      {(position === "standing-from-bow") && (
        <g>
          <circle cx="100" cy="55" r="20" fill="var(--color-gold)" opacity="0.8" />
          <path d="M75 50 Q75 30 100 25 Q125 30 125 50 L125 75 Q125 82 118 82 L82 82 Q75 82 75 75 Z" fill="var(--color-gold)" opacity="0.45" />
          <path d="M78 82 L72 240 Q72 255 88 255 L112 255 Q128 255 128 240 L122 82 Z" fill="var(--color-gold)" opacity="0.25" />
          <path d="M78 85 L62 130 Q58 138 66 140 L78 135 Z" fill="var(--color-gold)" opacity="0.25" />
          <path d="M122 85 L138 130 Q142 138 134 140 L122 135 Z" fill="var(--color-gold)" opacity="0.25" />
        </g>
      )}

      {position === "prostrating" && (
        <g>
          {/* Head with hijab on ground — more compact posture */}
          <circle cx="42" cy="215" r="14" fill="var(--color-gold)" opacity="0.8" />
          <path d="M26 210 Q26 196 42 192 Q58 196 58 210 L58 220 Q58 224 52 224 L32 224 Q26 224 26 220 Z" fill="var(--color-gold)" opacity="0.45" />
          {/* Body (more gathered/compact) */}
          <path d="M54 215 Q75 185 110 175 L125 178 Q132 185 130 195 L118 215 Q108 225 95 222 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Legs folded */}
          <path d="M115 195 Q135 205 142 225 Q144 232 138 235 L120 235 Q112 232 112 225 Z" fill="var(--color-gold)" opacity="0.2" />
          {/* Hands */}
          <ellipse cx="52" cy="230" rx="9" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="32" cy="230" rx="9" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "sitting" && (
        <g>
          <circle cx="100" cy="85" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M78 80 Q78 60 100 55 Q122 60 122 80 L122 100 Q122 106 116 106 L84 106 Q78 106 78 100 Z" fill="var(--color-gold)" opacity="0.45" />
          {/* Torso */}
          <path d="M82 106 L78 165 Q78 170 84 170 L116 170 Q122 170 122 165 L118 106 Z" fill="var(--color-gold)" opacity="0.25" />
          {/* Legs folded */}
          <path d="M78 165 Q78 200 100 205 Q122 200 140 205 Q155 210 155 220 L155 228 Q155 235 145 235 L75 235 Q65 235 65 228 L65 205 Q65 180 78 165 Z" fill="var(--color-gold)" opacity="0.2" />
          {/* Hands on thighs */}
          <ellipse cx="88" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="112" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "taslim-right" && (
        <g>
          <circle cx="108" cy="83" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M86 78 Q86 58 108 53 Q130 58 130 78 L130 98 Q130 104 124 104 L92 104 Q86 104 86 98 Z" fill="var(--color-gold)" opacity="0.45" />
          <path d="M128 80 L138 76 L136 88" fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity="0.5" />
          <path d="M82 106 L78 165 Q78 170 84 170 L116 170 Q122 170 122 165 L118 106 Z" fill="var(--color-gold)" opacity="0.25" />
          <path d="M78 165 Q78 200 100 205 Q122 200 140 205 Q155 210 155 220 L155 228 Q155 235 145 235 L75 235 Q65 235 65 228 L65 205 Q65 180 78 165 Z" fill="var(--color-gold)" opacity="0.2" />
          <ellipse cx="88" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="112" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}

      {position === "taslim-left" && (
        <g>
          <circle cx="92" cy="83" r="18" fill="var(--color-gold)" opacity="0.8" />
          <path d="M70 78 Q70 58 92 53 Q114 58 114 78 L114 98 Q114 104 108 104 L76 104 Q70 104 70 98 Z" fill="var(--color-gold)" opacity="0.45" />
          <path d="M72 80 L62 76 L64 88" fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity="0.5" />
          <path d="M82 106 L78 165 Q78 170 84 170 L116 170 Q122 170 122 165 L118 106 Z" fill="var(--color-gold)" opacity="0.25" />
          <path d="M78 165 Q78 200 100 205 Q122 200 140 205 Q155 210 155 220 L155 228 Q155 235 145 235 L75 235 Q65 235 65 228 L65 205 Q65 180 78 165 Z" fill="var(--color-gold)" opacity="0.2" />
          <ellipse cx="88" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <ellipse cx="112" cy="175" rx="8" ry="5" fill="var(--color-gold)" opacity="0.4" />
          <line x1="10" y1="238" x2="190" y2="238" stroke="var(--color-gold)" strokeWidth="1" opacity="0.15" />
        </g>
      )}
    </svg>
  );
}

export default function PrayerFigure({ position, gender }: PrayerFigureProps) {
  return (
    <motion.div
      key={position}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-40 h-52 md:w-48 md:h-60 mx-auto"
    >
      {gender === "male" ? (
        <MaleFigure position={position} />
      ) : (
        <FemaleFigure position={position} />
      )}
    </motion.div>
  );
}

export type { Position };
