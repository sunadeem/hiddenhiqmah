// Sky-blue themed illustrations for featured hadiths
// Uses gradients, filters, and layered compositions for rich detail

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.05" />
      </linearGradient>
      <filter id={`${id}-soft`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
      </filter>
      <filter id={`${id}-glow-f`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>
  );
}

const s = "#7dd3fc";
const sl = "#bae6fd";
const sd = "#38bdf8";

export function SincerityIllustration() {
  // Person in sujood (prostration) with luminous heart, light ascending upward, prayer rug beneath
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="sinc" />
      {/* Background ambient glow */}
      <circle cx="100" cy="90" r="70" fill="url(#sinc-glow)" />
      {/* Prayer rug / mat */}
      <path d="M30 145c0-2 2-4 4-4h132c2 0 4 2 4 4v6c0 2-2 3-4 3H34c-2 0-4-1-4-3v-6z" fill={sd} fillOpacity="0.08" stroke={s} strokeWidth="1" />
      <path d="M38 145h124" stroke={sl} strokeWidth="0.5" opacity="0.3" />
      <path d="M42 148h116" stroke={sl} strokeWidth="0.4" opacity="0.2" />
      {/* Rug decorative arch pattern */}
      <path d="M80 145c0-6 4-10 10-12h0c2-1 6-1.5 10-1.5s8 .5 10 1.5h0c6 2 10 6 10 12" stroke={sl} strokeWidth="0.6" opacity="0.25" />
      {/* Prostrating figure */}
      {/* Head touching ground */}
      <ellipse cx="72" cy="130" rx="10" ry="9" stroke={s} strokeWidth="1.8" />
      {/* Back arched */}
      <path d="M82 128c6-4 14-14 18-22c4-8 6-12 8-14" stroke={s} strokeWidth="2" strokeLinecap="round" />
      {/* Torso */}
      <path d="M108 94c2 4 4 12 4 18" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      {/* Arms reaching forward for sujood */}
      <path d="M88 120l-20 8" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M88 118l-22 4" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      {/* Hands flat on ground */}
      <ellipse cx="66" cy="128" rx="4" ry="2" stroke={sl} strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="64" cy="124" rx="4" ry="2" stroke={sl} strokeWidth="0.8" opacity="0.6" />
      {/* Knees */}
      <path d="M112 112c2 6 2 14 0 20" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M118 112c2 6 2 14 0 20" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      {/* Feet */}
      <path d="M112 132l2 8" stroke={s} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M118 132l2 8" stroke={s} strokeWidth="1.3" strokeLinecap="round" />
      {/* GLOWING HEART in chest area — key element */}
      <circle cx="98" cy="108" r="12" fill={sd} fillOpacity="0.12" filter="url(#sinc-glow-f)" />
      <circle cx="98" cy="108" r="7" fill={sd} fillOpacity="0.2" />
      <path d="M98 104c-1.5-2.5-5-3-7-1s-1 5 1.5 7l5.5 5 5.5-5c2.5-2 3-5 1-7s-5-.5-6.5 1z" fill={sd} fillOpacity="0.5" stroke={sd} strokeWidth="1" />
      {/* Light rays ascending from heart upward */}
      <path d="M98 96l0-20" stroke={sd} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M92 94l-8-18" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <path d="M104 94l8-18" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <path d="M88 92l-14-10" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      <path d="M108 92l14-10" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      {/* Light particles rising */}
      <circle cx="98" cy="60" r="3" fill={sd} fillOpacity="0.3" />
      <circle cx="86" cy="68" r="2" fill={sl} opacity="0.25" />
      <circle cx="110" cy="68" r="2" fill={sl} opacity="0.25" />
      <circle cx="94" cy="50" r="1.5" fill={sl} opacity="0.2" />
      <circle cx="104" cy="46" r="1.5" fill={sl} opacity="0.2" />
      {/* Ascending glow at top */}
      <circle cx="98" cy="40" r="16" fill={sd} fillOpacity="0.06" filter="url(#sinc-soft)" />
      {/* Stars in the light */}
      <path d="M98 32l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill={sl} opacity="0.35" />
      <circle cx="82" cy="44" r="1" fill={sl} opacity="0.2" />
      <circle cx="116" cy="40" r="1.2" fill={sl} opacity="0.2" />
      {/* Thought bubble showing pure intention */}
      <ellipse cx="140" cy="60" rx="20" ry="14" stroke={sl} strokeWidth="0.8" opacity="0.25" fill={sd} fillOpacity="0.03" />
      <circle cx="128" cy="78" r="3" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <circle cx="124" cy="84" r="1.8" stroke={sl} strokeWidth="0.5" opacity="0.15" />
      {/* Heart in thought */}
      <path d="M140 56c-1-1.5-3-2-4.5-.5s-.5 3.5 1 4.5l3.5 3 3.5-3c1.5-1 2-3 .5-4.5s-3-.5-4 .5z" fill={sd} fillOpacity="0.3" />
    </svg>
  );
}

export function SafeFromHarmIllustration() {
  // Shield made of interlocking hands protecting a community of small figures, olive branches
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="safe" />
      <circle cx="100" cy="100" r="65" fill="url(#safe-glow)" />
      {/* Large protective shield shape */}
      <path d="M100 24c-30 6-55 14-55 36v40c0 36 24 56 55 72c31-16 55-36 55-72V60c0-22-25-30-55-36z" stroke={s} strokeWidth="2" fill={sd} fillOpacity="0.04" />
      <path d="M100 32c-26 5-47 12-47 30v36c0 30 20 48 47 62c27-14 47-32 47-62V62c0-18-21-25-47-30z" stroke={sl} strokeWidth="0.8" opacity="0.2" />
      {/* Shield inner glow */}
      <ellipse cx="100" cy="90" rx="35" ry="45" fill={sd} fillOpacity="0.05" filter="url(#safe-soft)" />
      {/* Decorative shield pattern — interlocking arch */}
      <path d="M80 60c0-6 9-10 20-10s20 4 20 10" stroke={sl} strokeWidth="1" opacity="0.3" />
      <path d="M85 56c0-4 7-8 15-8s15 4 15 8" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Community of small figures inside shield */}
      {/* Center figure */}
      <circle cx="100" cy="90" r="6" stroke={s} strokeWidth="1.2" />
      <path d="M100 96v10" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M94 106l-4 12" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <path d="M106 106l4 12" stroke={s} strokeWidth="1" strokeLinecap="round" />
      {/* Left figure */}
      <circle cx="76" cy="98" r="5" stroke={s} strokeWidth="1" />
      <path d="M76 103v8" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <path d="M72 111l-3 10" stroke={s} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M80 111l3 10" stroke={s} strokeWidth="0.8" strokeLinecap="round" />
      {/* Right figure */}
      <circle cx="124" cy="98" r="5" stroke={s} strokeWidth="1" />
      <path d="M124 103v8" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <path d="M120 111l-3 10" stroke={s} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M128 111l3 10" stroke={s} strokeWidth="0.8" strokeLinecap="round" />
      {/* Small child figure */}
      <circle cx="90" cy="104" r="3.5" stroke={sl} strokeWidth="0.8" />
      <path d="M90 107.5v6" stroke={sl} strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="110" cy="104" r="3.5" stroke={sl} strokeWidth="0.8" />
      <path d="M110 107.5v6" stroke={sl} strokeWidth="0.8" strokeLinecap="round" />
      {/* Hands reaching inward (creating the shield boundary) */}
      {/* Left hand */}
      <path d="M50 70c4-1 8 1 12 4l6 8" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 68l3 1 2-3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M46 72l3-1 1 3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      {/* Right hand */}
      <path d="M150 70c-4-1-8 1-12 4l-6 8" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M152 68l-3 1-2-3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M154 72l-3-1-1 3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      {/* Olive branches on shield sides */}
      <path d="M56 130c6-8 12-14 20-18" stroke={s} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M60 128c-2-1-3-4-1-5s4 0 4 2c1 2-1 4-3 3z" fill={sd} fillOpacity="0.25" />
      <path d="M66 122c-2-1-3-4-1-5s4 0 4 2c1 2-1 4-3 3z" fill={sd} fillOpacity="0.2" />
      <path d="M144 130c-6-8-12-14-20-18" stroke={s} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M140 128c2-1 3-4 1-5s-4 0-4 2c-1 2 1 4 3 3z" fill={sd} fillOpacity="0.25" />
      <path d="M134 122c2-1 3-4 1-5s-4 0-4 2c-1 2 1 4 3 3z" fill={sd} fillOpacity="0.2" />
      {/* Shield top radiance */}
      <circle cx="100" cy="30" r="5" fill={sd} fillOpacity="0.15" />
      <path d="M100 20l0 6" stroke={sd} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M94 22l3 4" stroke={sl} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
      <path d="M106 22l-3 4" stroke={sl} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
      {/* Ground line */}
      <path d="M60 155h80" stroke={sl} strokeWidth="0.5" opacity="0.12" />
    </svg>
  );
}

export function PurificationIllustration() {
  // Ornate water pitcher pouring into a basin, crescent moon reflected in water, ripples expanding
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="pur" />
      <circle cx="100" cy="110" r="60" fill="url(#pur-glow)" />
      {/* Crescent moon above */}
      <path d="M100 18c-10 0-18 8-18 18s8 18 18 18c-6 0-11-8-11-18s5-18 11-18z" stroke={s} strokeWidth="1.5" fill={sd} fillOpacity="0.12" />
      {/* Stars around moon */}
      <path d="M120 20l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill={sl} opacity="0.4" />
      <circle cx="130" cy="32" r="1.5" fill={sl} opacity="0.3" />
      <circle cx="78" cy="22" r="1" fill={sl} opacity="0.25" />
      <circle cx="126" cy="14" r="1" fill={sl} opacity="0.2" />
      {/* Ornate water pitcher (ibrik) */}
      <path d="M58 62c-2-8 2-16 10-20h12c8 4 12 12 10 20l-4 16c-1 4-4 6-8 6h-8c-4 0-7-2-8-6l-4-16z" stroke={s} strokeWidth="1.8" fill={sd} fillOpacity="0.06" />
      {/* Pitcher handle */}
      <path d="M54 50c-6-2-10 2-10 8s4 14 10 16" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Pitcher spout */}
      <path d="M82 52c4-2 8-1 10 2l2 6" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      {/* Pitcher decorative lines */}
      <path d="M62 58h24" stroke={sl} strokeWidth="0.6" opacity="0.3" />
      <path d="M64 64h20" stroke={sl} strokeWidth="0.6" opacity="0.25" />
      <path d="M66 70h16" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Water stream pouring */}
      <path d="M94 60c2 4 4 14 6 28c2 14 0 20-2 26" stroke={sd} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M90 64c1 6 4 16 8 28" stroke={sl} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <path d="M96 58c2 8 6 20 4 34" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      {/* Water drops */}
      <path d="M92 80l-1.5 4c-.5 1.5.5 3 1.5 3s2-1.5 1.5-3l-1.5-4z" fill={sd} opacity="0.4" />
      <path d="M100 74l-1 3c-.3 1 .3 2 1 2s1.3-1 1-2l-1-3z" fill={sd} opacity="0.35" />
      {/* Basin / bowl */}
      <path d="M50 120c0-4 4-8 10-10h80c6 2 10 6 10 10v4c0 14-10 26-24 30H74c-14-4-24-16-24-30v-4z" stroke={s} strokeWidth="1.8" fill={sd} fillOpacity="0.05" />
      {/* Water surface in basin */}
      <path d="M58 120h84" stroke={sd} strokeWidth="1" opacity="0.3" />
      {/* Ripple circles in water */}
      <ellipse cx="98" cy="124" rx="8" ry="2.5" stroke={sd} strokeWidth="1" opacity="0.4" />
      <ellipse cx="98" cy="124" rx="16" ry="4" stroke={sl} strokeWidth="0.8" opacity="0.25" />
      <ellipse cx="98" cy="124" rx="26" ry="5.5" stroke={sl} strokeWidth="0.6" opacity="0.15" />
      <ellipse cx="98" cy="124" rx="36" ry="7" stroke={sl} strokeWidth="0.4" opacity="0.08" />
      {/* Crescent reflection in water */}
      <path d="M96 128c-3 0-5 2-5 5s2 5 5 5c-2 0-3-2-3-5s1-5 3-5z" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Rising mist / purification glow */}
      <path d="M70 116c2-4 4-6 8-8" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.15" />
      <path d="M120 114c-2-4-4-6-8-8" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.15" />
      {/* Basin base */}
      <path d="M74 155c4 2 12 4 26 4s22-2 26-4" stroke={sl} strokeWidth="1" opacity="0.3" />
      <path d="M90 159v8" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M110 159v8" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M84 167h32" stroke={sl} strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

export function SpeechIllustration() {
  // Ornate lamp/lantern with flame; words/letters flow out as a vine that blooms into flowers
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="sp" />
      {/* Ambient glow from lamp */}
      <circle cx="60" cy="100" r="40" fill="url(#sp-glow)" />
      {/* Ornate lantern body */}
      <path d="M46 80h28v40c0 4-3 8-7 8H53c-4 0-7-4-7-8V80z" stroke={s} strokeWidth="1.8" fill={sd} fillOpacity="0.06" />
      {/* Lantern top dome */}
      <path d="M46 80c0-8 6-14 14-14s14 6 14 80" stroke={s} strokeWidth="1.8" />
      {/* Lantern finial */}
      <path d="M60 66v-6" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="58" r="3" stroke={s} strokeWidth="1" fill={sd} fillOpacity="0.15" />
      {/* Lantern decorative patterns */}
      <path d="M50 84h20" stroke={sl} strokeWidth="0.5" opacity="0.3" />
      <path d="M50 90h20" stroke={sl} strokeWidth="0.5" opacity="0.3" />
      <path d="M60 80v40" stroke={sl} strokeWidth="0.4" opacity="0.2" />
      {/* Lantern glass panels */}
      <rect x="48" y="82" width="10" height="16" rx="1" stroke={sl} strokeWidth="0.5" fill={sd} fillOpacity="0.04" opacity="0.4" />
      <rect x="62" y="82" width="10" height="16" rx="1" stroke={sl} strokeWidth="0.5" fill={sd} fillOpacity="0.04" opacity="0.4" />
      {/* Lantern base */}
      <path d="M50 120h20" stroke={s} strokeWidth="1.5" />
      <path d="M54 120v4h12v-4" stroke={s} strokeWidth="1" />
      {/* Flame inside */}
      <path d="M60 94c-2-4-1-8 0-10c1-2 2 0 2 2c1-3 2-5 3-4c1 1-1 4-2 6c2-1 3 1 2 3c-1 2-3 4-5 4s-4-2-5-4c-1-2 0-3 2-3" fill={sd} fillOpacity="0.4" stroke={sd} strokeWidth="0.8" />
      <circle cx="60" cy="92" r="6" fill={sd} fillOpacity="0.15" filter="url(#sp-glow-f)" />
      {/* === VINE flowing out from lamp === */}
      <path d="M74 92c8-4 16-2 24 2c8 4 14 2 20-2c6-4 12-2 18 2c6 4 12 4 18 0" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Vine branches */}
      <path d="M90 88c2-8 8-14 14-12" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M106 96c-2 6 0 12 6 14" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M122 88c2-6 6-10 12-8" stroke={s} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M138 96c-2 4 0 10 6 10" stroke={sl} strokeWidth="1" strokeLinecap="round" />
      <path d="M150 92c2-4 6-6 10-4" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* Leaves along vine */}
      <path d="M86 86c3-3 8-2 9 2s-3 6-6 5c-3-1-5-4-3-7z" fill={sd} fillOpacity="0.25" stroke={sd} strokeWidth="0.8" />
      <path d="M96 96c4 2 8 0 8-4s-4-5-7-3c-3 2-3 5-1 7z" fill={sd} fillOpacity="0.2" stroke={sd} strokeWidth="0.8" />
      <path d="M112 82c3-2 7-1 8 3s-2 6-5 5c-3-1-5-5-3-8z" fill={s} fillOpacity="0.2" stroke={sl} strokeWidth="0.8" />
      <path d="M128 98c4 1 7-1 7-5s-3-5-6-4c-3 1-4 5-1 7" fill={sd} fillOpacity="0.15" stroke={sl} strokeWidth="0.7" />
      <path d="M144 86c2-2 6-2 7 1s-1 5-4 5c-3 0-5-3-3-6z" fill={s} fillOpacity="0.15" stroke={sl} strokeWidth="0.6" />
      {/* Flowers blooming at vine endpoints */}
      {/* Flower 1 — full bloom */}
      <circle cx="104" cy="76" r="6" stroke={sd} strokeWidth="1.2" opacity="0.5" />
      <circle cx="104" cy="76" r="3" fill={sd} fillOpacity="0.3" />
      <path d="M104 70v-2M98 76h-2M110 76h2M104 82v2" stroke={sl} strokeWidth="0.6" opacity="0.3" />
      {/* Flower 2 */}
      <circle cx="134" cy="80" r="5" stroke={s} strokeWidth="1" opacity="0.4" />
      <circle cx="134" cy="80" r="2.5" fill={s} fillOpacity="0.25" />
      <path d="M134 75v-1.5M129 80h-1.5M139 80h1.5M134 85v1.5" stroke={sl} strokeWidth="0.5" opacity="0.25" />
      {/* Flower 3 — budding */}
      <circle cx="112" cy="110" r="4" stroke={sl} strokeWidth="0.8" opacity="0.35" />
      <circle cx="112" cy="110" r="1.5" fill={sl} fillOpacity="0.25" />
      {/* Flower 4 */}
      <circle cx="160" cy="88" r="4.5" stroke={sl} strokeWidth="0.8" opacity="0.3" />
      <circle cx="160" cy="88" r="2" fill={sl} fillOpacity="0.2" />
      {/* Floating petals */}
      <path d="M146 72c1-2 4-3 4-1s-2 4-3 3" fill={sl} opacity="0.25" />
      <path d="M156 78c0-2 3-3 3-1s-1 4-2 3" fill={sl} opacity="0.2" />
      <path d="M166 82c1-1 3-1 3 1s-2 3-3 2" fill={sl} opacity="0.15" />
      {/* Light particles from flame following vine */}
      <circle cx="82" cy="88" r="1.5" fill={sd} fillOpacity="0.3" />
      <circle cx="96" cy="82" r="1" fill={sd} fillOpacity="0.25" />
      <circle cx="118" cy="84" r="1" fill={sd} fillOpacity="0.2" />
      <circle cx="148" cy="88" r="1" fill={sl} opacity="0.15" />
    </svg>
  );
}

export function SelfControlIllustration() {
  // A serene lion lying calmly with a gentle aura, flames swirling around but not touching it
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="ctrl" />
      {/* Protective calm aura */}
      <circle cx="100" cy="100" r="52" fill="url(#ctrl-glow)" />
      <circle cx="100" cy="100" r="45" stroke={sd} strokeWidth="0.8" strokeDasharray="4 6" opacity="0.15" />
      <circle cx="100" cy="100" r="55" stroke={sl} strokeWidth="0.5" strokeDasharray="3 8" opacity="0.08" />
      {/* Swirling flames / chaos outside aura */}
      {/* Left flames */}
      <path d="M22 130c6-14 4-30 10-44c4-10 6-20 10-30" stroke={sl} strokeWidth="1.8" strokeLinecap="round" opacity="0.25" />
      <path d="M18 120c4-10 6-24 12-36c4-8 4-18 8-26" stroke={sl} strokeWidth="1.2" strokeLinecap="round" opacity="0.18" />
      <path d="M30 140c4-8 2-18 6-28c4-10 2-18 8-26" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.12" />
      {/* Right flames */}
      <path d="M178 130c-6-14-4-30-10-44c-4-10-6-20-10-30" stroke={sl} strokeWidth="1.8" strokeLinecap="round" opacity="0.25" />
      <path d="M182 120c-4-10-6-24-12-36c-4-8-4-18-8-26" stroke={sl} strokeWidth="1.2" strokeLinecap="round" opacity="0.18" />
      <path d="M170 140c-4-8-2-18-6-28c-4-10-2-18-8-26" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.12" />
      {/* Bottom flame wisps */}
      <path d="M40 158c2-6 4-10 8-14" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.1" />
      <path d="M160 158c-2-6-4-10-8-14" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.1" />
      {/* === Seated figure meditating peacefully === */}
      {/* Head */}
      <circle cx="100" cy="72" r="14" stroke={s} strokeWidth="2" />
      {/* Peaceful closed eyes */}
      <path d="M93 70c2.5-1.5 5-1.5 6 0" stroke={sl} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M101 70c2.5-1.5 5-1.5 6 0" stroke={sl} strokeWidth="1.5" strokeLinecap="round" />
      {/* Gentle smile */}
      <path d="M95 77c3 2.5 7 2.5 10 0" stroke={sl} strokeWidth="1" strokeLinecap="round" />
      {/* Body */}
      <path d="M100 86v16" stroke={s} strokeWidth="2" strokeLinecap="round" />
      {/* Cross-legged position */}
      <path d="M86 118c4-8 8-14 14-16c6 2 10 8 14 16" stroke={s} strokeWidth="2" strokeLinecap="round" />
      <path d="M82 122c4 0 8-2 12-2h12c4 0 8 2 12 2" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      {/* Arms resting on knees (mudra-like pose) */}
      <path d="M100 94l-18 14" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M100 94l18 14" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      {/* Hands on knees */}
      <circle cx="82" cy="108" r="3.5" stroke={sl} strokeWidth="1" />
      <circle cx="118" cy="108" r="3.5" stroke={sl} strokeWidth="1" />
      {/* Inner peace glow from heart */}
      <circle cx="100" cy="92" r="8" fill={sd} fillOpacity="0.2" filter="url(#ctrl-soft)" />
      <circle cx="100" cy="92" r="4" fill={sd} fillOpacity="0.3" />
      {/* Radiating calm lines */}
      <path d="M100 82l0-4" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M90 86l-3-2" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      <path d="M110 86l3-2" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      {/* Dropped sword on the ground beside — true strength is restraint */}
      <path d="M138 134l12-36" stroke={sl} strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      <path d="M148 100l5-3-5-3" stroke={sl} strokeWidth="1.2" opacity="0.2" />
      {/* Sword hilt */}
      <path d="M136 138l6-2" stroke={sl} strokeWidth="1.5" opacity="0.2" />
      {/* Ground line */}
      <path d="M50 150h100" stroke={sl} strokeWidth="0.5" opacity="0.1" />
    </svg>
  );
}

export function StrangerIllustration() {
  // Lone lantern on a winding desert path under vast starry sky with crescent moon
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="str" />
      {/* Vast starry sky */}
      <rect x="0" y="0" width="200" height="130" fill="url(#str-sky)" />
      {/* Stars scattered across sky */}
      <circle cx="30" cy="18" r="1.5" fill={sl} opacity="0.5" />
      <circle cx="55" cy="30" r="1" fill={sl} opacity="0.4" />
      <circle cx="80" cy="12" r="1.5" fill={sl} opacity="0.35" />
      <circle cx="110" cy="22" r="1" fill={sl} opacity="0.3" />
      <circle cx="145" cy="16" r="1.5" fill={sl} opacity="0.4" />
      <circle cx="170" cy="30" r="1" fill={sl} opacity="0.35" />
      <circle cx="160" cy="10" r="1" fill={sl} opacity="0.25" />
      <circle cx="40" cy="42" r="1" fill={sl} opacity="0.2" />
      <circle cx="130" cy="40" r="1" fill={sl} opacity="0.25" />
      <circle cx="90" cy="38" r="0.8" fill={sl} opacity="0.2" />
      <circle cx="175" cy="46" r="0.8" fill={sl} opacity="0.15" />
      <circle cx="22" cy="55" r="0.8" fill={sl} opacity="0.15" />
      {/* Crescent moon */}
      <path d="M155 30c-8 0-15 7-15 15s7 15 15 15c-5 0-9-7-9-15s4-15 9-15z" stroke={s} strokeWidth="1.5" fill={sd} fillOpacity="0.15" />
      {/* Guiding star (brighter) */}
      <path d="M140 22l2 4 4.5 .8-3.5 3 .8 4.5-4-2-4 2 .8-4.5-3.5-3 4.5-.8z" fill={sd} fillOpacity="0.5" stroke={sd} strokeWidth="0.5" />
      {/* Desert dunes — layered for depth */}
      <path d="M0 130c20-10 40-18 70-16s50 10 70 6s30-10 60-8" stroke={sl} strokeWidth="0.8" fill={sd} fillOpacity="0.03" opacity="0.3" />
      <path d="M0 140c30-8 50-14 80-10s40 8 60 4s30-10 60-6v72H0z" fill={sd} fillOpacity="0.05" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Winding path receding to horizon */}
      <path d="M20 185c10-5 20-15 35-28c15-13 22-22 35-32c13-10 22-14 38-18c16-4 28-4 42-2" stroke={s} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
      <path d="M25 190c10-5 20-14 34-27c14-13 22-24 36-34c14-10 24-12 36-16" stroke={sl} strokeWidth="0.8" opacity="0.12" />
      {/* === Lone figure walking on the path === */}
      {/* Head */}
      <circle cx="72" cy="112" r="7" stroke={s} strokeWidth="1.5" />
      {/* Traveler's cloak/garment */}
      <path d="M72 119v6c0 3-2 6-5 10" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 119c2 3 3 8 5 14" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      {/* Walking legs */}
      <path d="M67 135l-5 14" stroke={s} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M77 133l6 16" stroke={s} strokeWidth="1.3" strokeLinecap="round" />
      {/* Walking stick */}
      <path d="M58 116l-12 42" stroke={s} strokeWidth="2" strokeLinecap="round" />
      {/* Arm holding stick */}
      <path d="M72 122l-14-6" stroke={s} strokeWidth="1.3" strokeLinecap="round" />
      {/* Bundle on back */}
      <ellipse cx="80" cy="118" rx="5" ry="6" stroke={sl} strokeWidth="1" transform="rotate(-10 80 118)" opacity="0.4" />
      {/* === Lantern the traveler carries === */}
      <path d="M82 108h-4v-8h4z" stroke={sd} strokeWidth="0.8" fill={sd} fillOpacity="0.15" />
      <path d="M78 100c0-2 1.5-4 3-4s3 2 3 4" stroke={sd} strokeWidth="0.8" />
      <circle cx="80" cy="102" r="2" fill={sd} fillOpacity="0.4" />
      <circle cx="80" cy="102" r="6" fill={sd} fillOpacity="0.1" filter="url(#str-soft)" />
      {/* Lantern glow on ground */}
      <ellipse cx="76" cy="140" rx="12" ry="3" fill={sd} fillOpacity="0.06" />
      {/* Footprints behind */}
      <ellipse cx="46" cy="160" rx="2.5" ry="1" fill={sl} opacity="0.12" />
      <ellipse cx="38" cy="166" rx="2.5" ry="1" fill={sl} opacity="0.08" />
      <ellipse cx="30" cy="170" rx="2" ry="1" fill={sl} opacity="0.05" />
      {/* Distant horizon glow */}
      <ellipse cx="160" cy="106" rx="30" ry="10" fill={sd} fillOpacity="0.04" filter="url(#str-glow-f)" />
    </svg>
  );
}

export function QuranIllustration() {
  // Open Quran on an ornate rehal (book stand) with light emanating, knowledge particles dispersing
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="qr" />
      {/* Central radiance */}
      <circle cx="100" cy="80" r="60" fill="url(#qr-glow)" />
      {/* Major light rays emanating from book */}
      <path d="M100 50l0-24" stroke={sd} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M86 52l-14-20" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M114 52l14-20" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M76 58l-20-12" stroke={sl} strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
      <path d="M124 58l20-12" stroke={sl} strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
      <path d="M68 66l-24-4" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
      <path d="M132 66l24-4" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
      {/* Light glow at top */}
      <circle cx="100" cy="26" r="10" fill={sd} fillOpacity="0.12" filter="url(#qr-glow-f)" />
      <circle cx="100" cy="26" r="5" fill={sd} fillOpacity="0.2" />
      {/* === Open Quran book === */}
      <path d="M100 60L50 48v56l50 14 50-14V48L100 60z" stroke={s} strokeWidth="2" fill={sd} fillOpacity="0.04" />
      {/* Spine */}
      <path d="M100 60v58" stroke={s} strokeWidth="1.5" />
      {/* Left page lines (text) */}
      <path d="M58 56l36 6" stroke={sl} strokeWidth="0.5" opacity="0.3" />
      <path d="M58 62l36 5" stroke={sl} strokeWidth="0.5" opacity="0.28" />
      <path d="M58 68l36 4" stroke={sl} strokeWidth="0.5" opacity="0.26" />
      <path d="M58 74l36 3" stroke={sl} strokeWidth="0.5" opacity="0.24" />
      <path d="M58 80l36 2" stroke={sl} strokeWidth="0.5" opacity="0.22" />
      <path d="M58 86l36 2" stroke={sl} strokeWidth="0.5" opacity="0.2" />
      <path d="M58 92l36 1" stroke={sl} strokeWidth="0.5" opacity="0.18" />
      {/* Right page lines */}
      <path d="M142 56l-36 6" stroke={sl} strokeWidth="0.5" opacity="0.3" />
      <path d="M142 62l-36 5" stroke={sl} strokeWidth="0.5" opacity="0.28" />
      <path d="M142 68l-36 4" stroke={sl} strokeWidth="0.5" opacity="0.26" />
      <path d="M142 74l-36 3" stroke={sl} strokeWidth="0.5" opacity="0.24" />
      <path d="M142 80l-36 2" stroke={sl} strokeWidth="0.5" opacity="0.22" />
      <path d="M142 86l-36 2" stroke={sl} strokeWidth="0.5" opacity="0.2" />
      <path d="M142 92l-36 1" stroke={sl} strokeWidth="0.5" opacity="0.18" />
      {/* Ornate center medallion on book */}
      <circle cx="100" cy="78" r="5" stroke={sd} strokeWidth="1" fill={sd} fillOpacity="0.15" />
      <circle cx="100" cy="78" r="8" stroke={sl} strokeWidth="0.5" opacity="0.2" />
      <path d="M100 73v-2M100 83v2M95 78h-2M105 78h2" stroke={sd} strokeWidth="0.5" opacity="0.3" />
      {/* === Rehal (book stand) === */}
      <path d="M70 118l30 16 30-16" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M74 120l26 14" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <path d="M126 120l-26 14" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Stand legs */}
      <path d="M100 134v14" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M90 148h20" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      {/* Cross-beam on stand */}
      <path d="M84 140l16 6 16-6" stroke={sl} strokeWidth="0.8" opacity="0.3" />
      {/* === Teaching hands on sides === */}
      {/* Left hand reaching / teaching */}
      <path d="M22 105c4-3 10-2 14 2l8 8" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 102l3 1 2-3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M18 106l3-1 1 3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M22 108l2-3" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
      {/* Right hand receiving */}
      <path d="M178 105c-4-3-10-2-14 2l-8 8" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M180 102l-3 1-2-3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M182 106l-3-1-1 3" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M178 108l-2-3" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
      {/* Knowledge particles flowing outward */}
      <circle cx="38" cy="110" r="2.5" fill={sd} fillOpacity="0.25" />
      <circle cx="48" cy="104" r="1.5" fill={sd} fillOpacity="0.2" />
      <circle cx="162" cy="110" r="2.5" fill={sd} fillOpacity="0.25" />
      <circle cx="152" cy="104" r="1.5" fill={sd} fillOpacity="0.2" />
      <circle cx="58" cy="98" r="1" fill={sl} opacity="0.15" />
      <circle cx="142" cy="98" r="1" fill={sl} opacity="0.15" />
      {/* Stars */}
      <path d="M30" stroke={sl} />
      <circle cx="30" cy="30" r="1.5" fill={sl} opacity="0.25" />
      <circle cx="170" cy="30" r="1.5" fill={sl} opacity="0.25" />
      <path d="M100 12l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill={sl} opacity="0.3" />
    </svg>
  );
}

export function MercyIllustration() {
  // An open doorway with warm light flooding through, stepping stones leading to it
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="mer" />
      {/* Light flooding from doorway */}
      <path d="M60 40l-30 130h140l-30-130z" fill={sd} fillOpacity="0.04" />
      <path d="M70 50l-20 120h100l-20-120z" fill={sd} fillOpacity="0.04" />
      {/* Door frame — ornate pointed arch (Islamic arch) */}
      <path d="M60 170v-100c0-20 18-36 40-36s40 16 40 36v100" stroke={s} strokeWidth="2.5" fill="none" />
      {/* Inner arch */}
      <path d="M66 170v-96c0-18 15-32 34-32s34 14 34 32v96" stroke={sl} strokeWidth="0.8" opacity="0.25" />
      {/* Arch keystone decoration */}
      <circle cx="100" cy="38" r="4" stroke={sd} strokeWidth="1" fill={sd} fillOpacity="0.15" />
      <circle cx="100" cy="38" r="7" stroke={sl} strokeWidth="0.5" opacity="0.15" />
      {/* Door frame decorative patterns */}
      <path d="M66 60h2M66 70h2M66 80h2M66 90h2M66 100h2M66 110h2M66 120h2" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <path d="M132 60h2M132 70h2M132 80h2M132 90h2M132 100h2M132 110h2M132 120h2" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      {/* Light inside doorway */}
      <ellipse cx="100" cy="100" rx="28" ry="50" fill={sd} fillOpacity="0.08" filter="url(#mer-glow-f)" />
      <ellipse cx="100" cy="90" rx="18" ry="35" fill={sd} fillOpacity="0.1" filter="url(#mer-soft)" />
      {/* Central warm glow */}
      <circle cx="100" cy="85" r="15" fill={sd} fillOpacity="0.2" filter="url(#mer-glow-f)" />
      <circle cx="100" cy="85" r="8" fill={sl} fillOpacity="0.15" />
      {/* Light rays from door center */}
      <path d="M100 70v-16" stroke={sd} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M90 72l-6-12" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      <path d="M110 72l6-12" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      {/* === Stepping stones path leading to door === */}
      <ellipse cx="100" cy="170" rx="14" ry="4" fill={sd} fillOpacity="0.08" stroke={sl} strokeWidth="0.8" opacity="0.3" />
      <ellipse cx="100" cy="158" rx="12" ry="3.5" fill={sd} fillOpacity="0.1" stroke={sl} strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="100" cy="148" rx="10" ry="3" fill={sd} fillOpacity="0.12" stroke={sl} strokeWidth="0.8" opacity="0.4" />
      <ellipse cx="100" cy="139" rx="8" ry="2.5" fill={sd} fillOpacity="0.14" stroke={s} strokeWidth="0.8" opacity="0.45" />
      <ellipse cx="100" cy="132" rx="7" ry="2" fill={sd} fillOpacity="0.16" stroke={s} strokeWidth="0.8" opacity="0.5" />
      {/* Small welcoming figure silhouette inside the door light */}
      <circle cx="100" cy="108" r="5" stroke={sd} strokeWidth="0.8" opacity="0.3" />
      <path d="M100 113v7" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      {/* Arms open wide — welcoming gesture */}
      <path d="M100 116l-8 4" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      <path d="M100 116l8 4" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      {/* Ground */}
      <path d="M30 175h140" stroke={sl} strokeWidth="0.5" opacity="0.12" />
      {/* Ambient particles */}
      <circle cx="80" cy="60" r="1.5" fill={sl} opacity="0.2" />
      <circle cx="120" cy="62" r="1" fill={sl} opacity="0.2" />
      <circle cx="86" cy="48" r="1" fill={sl} opacity="0.15" />
      <circle cx="114" cy="50" r="1" fill={sl} opacity="0.15" />
    </svg>
  );
}

export function FamilyIllustration() {
  // Two trees growing together with intertwined trunks, shared canopy, under Islamic arch with crescent
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="fam" />
      <circle cx="100" cy="90" r="60" fill="url(#fam-glow)" />
      {/* Ornate Islamic arch frame */}
      <path d="M32 170v-90c0-28 30-50 68-50s68 22 68 50v90" stroke={s} strokeWidth="1.5" fill="none" />
      <path d="M38 170v-86c0-26 28-46 62-46s62 20 62 46v86" stroke={sl} strokeWidth="0.5" opacity="0.15" />
      {/* Arch keystone */}
      <circle cx="100" cy="32" r="3" stroke={sd} strokeWidth="0.8" fill={sd} fillOpacity="0.15" />
      {/* Crescent at top */}
      <path d="M100 10c-5 0-9 4-9 9s4 9 9 9c-3 0-5.5-4-5.5-9s2.5-9 5.5-9z" stroke={sd} strokeWidth="1.2" fill={sd} fillOpacity="0.15" />
      <circle cx="108" cy="12" r="1.5" fill={sl} opacity="0.4" />
      {/* === Two intertwined trees === */}
      {/* Left trunk */}
      <path d="M82 170c0-12-2-24 0-36c2-12 6-18 8-26c2-8 2-16 4-22" stroke={s} strokeWidth="2.5" strokeLinecap="round" />
      {/* Right trunk */}
      <path d="M118 170c0-12 2-24 0-36c-2-12-6-18-8-26c-2-8-2-16-4-22" stroke={s} strokeWidth="2.5" strokeLinecap="round" />
      {/* Trunks intertwine in the middle */}
      <path d="M94 86c4 6 8 8 12 4" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M96 96c3 4 7 6 10 2" stroke={s} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      {/* Roots */}
      <path d="M82 170c-4 2-8 4-14 4" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M82 170c-2 3-4 6-10 8" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M118 170c4 2 8 4 14 4" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M118 170c2 3 4 6 10 8" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      {/* === Shared canopy / leaves === */}
      {/* Large circular canopy */}
      <ellipse cx="100" cy="68" rx="40" ry="30" fill={sd} fillOpacity="0.06" />
      {/* Leaf clusters */}
      <circle cx="80" cy="56" r="12" fill={sd} fillOpacity="0.08" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <circle cx="100" cy="48" r="14" fill={sd} fillOpacity="0.08" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <circle cx="120" cy="56" r="12" fill={sd} fillOpacity="0.08" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <circle cx="88" cy="42" r="10" fill={sd} fillOpacity="0.06" stroke={sl} strokeWidth="0.5" opacity="0.15" />
      <circle cx="112" cy="42" r="10" fill={sd} fillOpacity="0.06" stroke={sl} strokeWidth="0.5" opacity="0.15" />
      <circle cx="70" cy="64" r="8" fill={sd} fillOpacity="0.05" stroke={sl} strokeWidth="0.4" opacity="0.12" />
      <circle cx="130" cy="64" r="8" fill={sd} fillOpacity="0.05" stroke={sl} strokeWidth="0.4" opacity="0.12" />
      {/* Individual leaves */}
      <path d="M76 50c3-3 8-2 9 2s-3 5-6 4c-3-1-5-4-3-6z" fill={sd} fillOpacity="0.2" />
      <path d="M92 40c3-2 7-1 7 3s-3 5-6 4c-3-1-3-5-1-7z" fill={sd} fillOpacity="0.2" />
      <path d="M108 38c-3-2-7-1-7 3s3 5 6 4c3-1 3-5 1-7z" fill={sd} fillOpacity="0.2" />
      <path d="M124 50c-3-3-8-2-9 2s3 5 6 4c3-1 5-4 3-6z" fill={sd} fillOpacity="0.2" />
      <path d="M100 36c2-2 5-1 5 2s-3 4-5 3c-2-1-2-3 0-5z" fill={s} fillOpacity="0.15" />
      {/* Branches reaching into canopy */}
      <path d="M94 86l-10-16" stroke={s} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M94 86l-20-22" stroke={s} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M106 86l10-16" stroke={s} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M106 86l20-22" stroke={s} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M100 84l0-20" stroke={s} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      {/* Heart formed where trunks meet */}
      <path d="M100 104c-2-3-6-4-8-2s-1 6 1.5 8l6.5 5 6.5-5c2.5-2 3-6 1-8s-5.5-1-7.5 2z" fill={sd} fillOpacity="0.3" stroke={sd} strokeWidth="1" />
      <circle cx="100" cy="106" r="10" fill={sd} fillOpacity="0.08" filter="url(#fam-soft)" />
      {/* Ground */}
      <path d="M50 175h100" stroke={sl} strokeWidth="0.5" opacity="0.1" />
    </svg>
  );
}

export function BestCharacterIllustration() {
  // Lighthouse figure emanating warm concentric waves of light, small figures drawn toward the light
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id="char" />
      {/* Radiating concentric circles */}
      <circle cx="100" cy="80" r="70" stroke={sl} strokeWidth="0.4" strokeDasharray="4 8" opacity="0.08" />
      <circle cx="100" cy="80" r="58" stroke={sl} strokeWidth="0.5" strokeDasharray="4 6" opacity="0.1" />
      <circle cx="100" cy="80" r="46" stroke={sl} strokeWidth="0.6" strokeDasharray="3 5" opacity="0.13" />
      <circle cx="100" cy="80" r="34" stroke={sd} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.17" />
      <circle cx="100" cy="80" r="22" stroke={sd} strokeWidth="1" strokeDasharray="2 3" opacity="0.2" />
      {/* Central ambient glow */}
      <circle cx="100" cy="80" r="30" fill={sd} fillOpacity="0.08" filter="url(#char-glow-f)" />
      {/* === Central figure standing tall === */}
      {/* Head */}
      <circle cx="100" cy="52" r="14" stroke={s} strokeWidth="2" />
      {/* Peaceful warm expression */}
      <path d="M93 50c2.5-1.5 5-1.5 6 0" stroke={sl} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M101 50c2.5-1.5 5-1.5 6 0" stroke={sl} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M95 57c3 2.5 7 2.5 10 0" stroke={sl} strokeWidth="1" strokeLinecap="round" />
      {/* Body */}
      <path d="M100 66v24" stroke={s} strokeWidth="2" strokeLinecap="round" />
      {/* Arms open wide — welcoming all */}
      <path d="M100 74l-26 8" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M100 74l26 8" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      {/* Open hands */}
      <path d="M74 82l-3-2M72 84l-4 0M74 86l-3 2" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M126 82l3-2M128 84l4 0M126 86l3 2" stroke={sl} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Legs */}
      <path d="M92 90l-10 36" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M108 90l10 36" stroke={s} strokeWidth="1.8" strokeLinecap="round" />
      {/* === Glowing heart === */}
      <circle cx="100" cy="78" r="8" fill={sd} fillOpacity="0.25" filter="url(#char-soft)" />
      <circle cx="100" cy="78" r="4" fill={sd} fillOpacity="0.4" />
      {/* Heart shape */}
      <path d="M100 76c-1-1.5-3.5-2-5-.5s-.5 3.5 1 4.5l4 3.5 4-3.5c1.5-1 2-3 .5-4.5s-3.5-.5-4.5.5z" fill={sl} fillOpacity="0.3" />
      {/* Light rays from heart */}
      <path d="M100 68l0-4" stroke={sd} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M108 72l4-3" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M92 72l-4-3" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M110 80l4 0" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      <path d="M90 80l-4 0" stroke={sd} strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      {/* === Small figures drawn toward the light === */}
      {/* Left group */}
      <circle cx="32" cy="120" r="5.5" stroke={sl} strokeWidth="0.8" opacity="0.3" />
      <path d="M32 125.5v7" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M29 132l-3 6" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      <path d="M35 132l3 6" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      {/* Walking toward center */}
      <path d="M40 128l8-4" stroke={sl} strokeWidth="0.5" strokeLinecap="round" strokeDasharray="2 2" opacity="0.15" />
      <circle cx="52" cy="112" r="4.5" stroke={sl} strokeWidth="0.7" opacity="0.25" />
      <path d="M52 116.5v6" stroke={sl} strokeWidth="0.7" strokeLinecap="round" opacity="0.25" />
      {/* Right group */}
      <circle cx="168" cy="120" r="5.5" stroke={sl} strokeWidth="0.8" opacity="0.3" />
      <path d="M168 125.5v7" stroke={sl} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M165 132l-3 6" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      <path d="M171 132l3 6" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      <path d="M160 128l-8-4" stroke={sl} strokeWidth="0.5" strokeLinecap="round" strokeDasharray="2 2" opacity="0.15" />
      <circle cx="148" cy="112" r="4.5" stroke={sl} strokeWidth="0.7" opacity="0.25" />
      <path d="M148 116.5v6" stroke={sl} strokeWidth="0.7" strokeLinecap="round" opacity="0.25" />
      {/* Bottom center figures */}
      <circle cx="78" cy="140" r="4" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <path d="M78 144v5" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.2" />
      <circle cx="122" cy="140" r="4" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <path d="M122 144v5" stroke={sl} strokeWidth="0.6" strokeLinecap="round" opacity="0.2" />
      {/* Sparkles around */}
      <path d="M44 80l1.5-3 1.5 3M44 80l-3 1.5 3 1.5" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <path d="M156 80l1.5-3 1.5 3M156 80l-3 1.5 3 1.5" stroke={sl} strokeWidth="0.6" opacity="0.2" />
      <circle cx="60" cy="50" r="1.5" fill={sl} opacity="0.2" />
      <circle cx="140" cy="50" r="1.5" fill={sl} opacity="0.2" />
      {/* Ground */}
      <path d="M30 155h140" stroke={sl} strokeWidth="0.4" opacity="0.08" />
    </svg>
  );
}
