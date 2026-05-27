// Iconography — line icons for jewelry categories, nav, and UI

const Icon = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4.4 4.6-7 8-7s6.8 2.6 8 7"/>
    </svg>
  ),
  Bag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 20s-7-4.5-9-9.2C1.4 7.3 4 4 7.2 4 9 4 10.6 4.9 12 6.4 13.4 4.9 15 4 16.8 4 20 4 22.6 7.3 21 10.8 19 15.5 12 20 12 20Z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  ),
  Pinterest: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9"/><path d="M11 21c-.5-1.5 0-3.5.5-5.5L13.5 8"/>
      <path d="M9 13c.5 1.4 2 2.2 3.5 2.2 2.5 0 4.5-2.3 4.5-5 0-2.7-2-4.7-5-4.7-3.3 0-5.5 2.4-5.5 5 0 1.2.5 2.4 1.4 3"/>
    </svg>
  ),
  TikTok: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M14 4v10a4 4 0 1 1-4-4"/><path d="M14 4c0 2.5 2 4.5 4.5 4.5"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.9 6.4 7 .8-5.2 4.8 1.5 6.9L12 17.6 5.8 21l1.5-6.9L2.1 9.2l7-.8L12 2z"/>
    </svg>
  ),
  Diamond: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M14 22h36L32 56 14 22Z"/>
      <path d="M14 22l8-10h20l8 10"/>
      <path d="M22 12l-8 10M42 12l8 10"/>
      <path d="M22 22h20"/>
      <path d="M22 22l10 34 10-34"/>
      <path d="M14 22l18 8 18-8"/>
    </svg>
  ),
};

/* Jewelry-specific category & product SVGs (line-art placeholders) */
const RingIcon = ({ size = 200 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2">
    <ellipse cx="100" cy="130" rx="48" ry="42"/>
    <ellipse cx="100" cy="130" rx="36" ry="32" opacity=".45"/>
    <path d="M82 92l18-26 18 26-18 14-18-14Z" fill="currentColor" fillOpacity=".25"/>
    <path d="M82 92l18-26 18 26-18 14-18-14Z"/>
    <path d="M100 66v40M82 92l36 14M118 92l-36 14"/>
  </svg>
);

const NecklaceIcon = ({ size = 200 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M30 40c20 60 50 90 70 90s50-30 70-90"/>
    <circle cx="100" cy="146" r="22"/>
    <circle cx="100" cy="146" r="13" opacity=".5"/>
    <path d="M100 130v32M84 146h32" opacity=".5"/>
  </svg>
);

const EarringIcon = ({ size = 200 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2">
    <g>
      <path d="M68 50c0 14-10 22-10 32 0 8 6 14 14 14s14-6 14-14c0-10-10-18-10-32a4 4 0 0 0-8 0Z"/>
      <circle cx="72" cy="128" r="20"/>
      <circle cx="72" cy="128" r="11" opacity=".5"/>
      <path d="M72 110v36M54 128h36" opacity=".5"/>
    </g>
    <g>
      <path d="M124 50c0 14-10 22-10 32 0 8 6 14 14 14s14-6 14-14c0-10-10-18-10-32a4 4 0 0 0-8 0Z"/>
      <circle cx="128" cy="128" r="20"/>
      <circle cx="128" cy="128" r="11" opacity=".5"/>
      <path d="M128 110v36M110 128h36" opacity=".5"/>
    </g>
  </svg>
);

const BraceletIcon = ({ size = 200 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2">
    <ellipse cx="100" cy="100" rx="74" ry="32"/>
    <ellipse cx="100" cy="100" rx="62" ry="24" opacity=".35"/>
    {[26, 50, 74, 100, 126, 150, 174].map((x, i) => (
      <circle key={i} cx={x} cy="100" r={i === 3 ? 7 : 4} fill="currentColor" fillOpacity={i === 3 ? .35 : .18}/>
    ))}
  </svg>
);

const PendantIcon = ({ size = 200 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M30 50c30 30 70 30 140 0"/>
    <path d="M100 90l-18 20 18 36 18-36-18-20Z" fill="currentColor" fillOpacity=".22"/>
    <path d="M100 90l-18 20 18 36 18-36-18-20Z"/>
    <path d="M82 110h36M100 90v56" opacity=".4"/>
  </svg>
);

const StoneRing = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <ellipse cx="100" cy="138" rx="44" ry="38"/>
    <ellipse cx="100" cy="138" rx="33" ry="28" opacity=".5"/>
    <path d="M84 96l16-26 16 26-16 14-16-14Z" fill="currentColor" fillOpacity=".25"/>
    <path d="M84 96l16-26 16 26-16 14-16-14Z"/>
    <path d="M100 70v40M84 96l32 14M116 96l-32 14"/>
  </svg>
);
const ChainNecklace = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <path d="M28 36c20 64 52 96 72 96s52-32 72-96"/>
    <circle cx="100" cy="148" r="20"/>
    <path d="M100 134v28M86 148h28" opacity=".4"/>
    <circle cx="100" cy="148" r="11" opacity=".55"/>
  </svg>
);
const TennisBracelet = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <ellipse cx="100" cy="100" rx="78" ry="34"/>
    {Array.from({length: 11}).map((_, i) => {
      const x = 22 + i * 15.6;
      return <path key={i} d={`M${x} 94l4 6-4 6-4-6 4-6Z`} fill="currentColor" fillOpacity=".22"/>
    })}
    {Array.from({length: 11}).map((_, i) => {
      const x = 22 + i * 15.6;
      return <path key={i} d={`M${x} 94l4 6-4 6-4-6 4-6Z`}/>
    })}
  </svg>
);
const Studs = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <g transform="translate(64,100)">
      <path d="M-12 0l12-16 12 16-12 12-12-12Z" fill="currentColor" fillOpacity=".25"/>
      <path d="M-12 0l12-16 12 16-12 12-12-12Z"/>
      <path d="M0-16V12M-12 0l24 12M12 0L-12 12"/>
    </g>
    <g transform="translate(136,100)">
      <path d="M-12 0l12-16 12 16-12 12-12-12Z" fill="currentColor" fillOpacity=".25"/>
      <path d="M-12 0l12-16 12 16-12 12-12-12Z"/>
      <path d="M0-16V12M-12 0l24 12M12 0L-12 12"/>
    </g>
  </svg>
);
const Pendant = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <path d="M28 56c30 30 70 30 144 0"/>
    <circle cx="100" cy="118" r="32"/>
    <circle cx="100" cy="118" r="20" opacity=".5"/>
    <path d="M100 86v64M68 118h64" opacity=".4"/>
    <circle cx="100" cy="118" r="6" fill="currentColor" fillOpacity=".5"/>
  </svg>
);
const SignetRing = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <ellipse cx="100" cy="130" rx="48" ry="42"/>
    <ellipse cx="100" cy="130" rx="36" ry="32" opacity=".45"/>
    <rect x="78" y="68" width="44" height="36" rx="3" fill="currentColor" fillOpacity=".22"/>
    <rect x="78" y="68" width="44" height="36" rx="3"/>
    <path d="M88 86l8-8 8 8-8 8-8-8Z" opacity=".7"/>
  </svg>
);
const Bangle = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <ellipse cx="100" cy="100" rx="70" ry="30"/>
    <ellipse cx="100" cy="100" rx="60" ry="22" opacity=".35"/>
    <circle cx="100" cy="78" r="8" fill="currentColor" fillOpacity=".3"/>
    <circle cx="100" cy="78" r="8"/>
  </svg>
);
const Hoops = () => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1">
    <circle cx="72" cy="110" r="32"/>
    <circle cx="72" cy="110" r="22" opacity=".4"/>
    <circle cx="128" cy="110" r="32"/>
    <circle cx="128" cy="110" r="22" opacity=".4"/>
  </svg>
);

Object.assign(window, {
  Icon, RingIcon, NecklaceIcon, EarringIcon, BraceletIcon, PendantIcon,
  StoneRing, ChainNecklace, TennisBracelet, Studs, Pendant, SignetRing, Bangle, Hoops
});
