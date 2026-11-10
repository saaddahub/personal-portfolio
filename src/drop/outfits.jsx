// The drop's costumes, in the same 100 × 100 box as its face (the drop's visible body is the circle of radius 45
// at the centre). OUTFITS sit on a layer over the glass that is not clipped to the drop, so a bun can rise above
// it; parts that wear the body (coat, shawl) are clipped to its round shape. SPECS sit with the eyes, so they
// move when the drop looks around.

const round = 'url(#drop-round)';

export const OUTFITS = {
  // Speaking: black tie.
  coat: (
    <g className="outfit-coat">
      <g clipPath={round}>
        <rect className="coat" x="0" y="70" width="100" height="40" />
        <polygon className="shirt" points="41,70 59,70 50,90" />
        <polygon className="lapel" points="32,70 41,70 50,90 44,97" />
        <polygon className="lapel" points="68,70 59,70 50,90 56,97" />
        <path className="lapel-shine" d="M34 71 L44 92" />
        <polygon className="pocket" points="21,80 30,80 25,74.5" />
      </g>
      <path className="bow" d="M50 73.5 L39.5 68 Q38 73.5 39.5 79 Z" />
      <path className="bow" d="M50 73.5 L60.5 68 Q62 73.5 60.5 79 Z" />
      <rect className="bow-knot" x="47.3" y="70.8" width="5.4" height="5.4" rx="1.4" />
      <path className="bow-shine" d="M41.5 70.5 Q44 72 46 73" />
    </g>
  ),
  // Story Mode: the storyteller granny.
  granny: (
    <g className="outfit-granny">
      <g clipPath={round}>
        <path className="shawl" d="M0 73 Q7 80 14 73 Q21 80 28 73 Q35 80 42 73 Q50 80 58 73 Q65 80 72 73 Q79 80 86 73 Q93 80 100 73 L100 110 L0 110Z" />
        <path className="knit" d="M18 86 l3 4 l3 -4 M34 88 l3 4 l3 -4 M60 88 l3 4 l3 -4 M76 86 l3 4 l3 -4 M26 96 l3 4 l3 -4 M68 96 l3 4 l3 -4" />
      </g>
      <circle className="brooch" cx="50" cy="81" r="3.6" />
      <circle className="hair" cx="50" cy="-3" r="12" />
      <path className="hair-line" d="M43 -4 Q50 -14 57 -4 Q50 1 46 -3" />
      {[[27, 15, 8.5], [37.5, 9, 9.5], [50, 6.5, 10], [62.5, 9, 9.5], [73, 15, 8.5]].map(([cx, cy, r]) => <circle key={cx} className="hair" cx={cx} cy={cy} r={r} />)}
      <path className="hair-line" d="M31 13 q4 -4 8 0 M45 7 q5 -4 10 0 M61 9 q4 -4 8 0" />
      <g className="flower">
        {[0, 72, 144, 216, 288].map(a => <circle key={a} cx={64 + Math.cos((a * Math.PI) / 180) * 3.4} cy={-2 + Math.sin((a * Math.PI) / 180) * 3.4} r="2.6" />)}
        <circle className="flower-heart" cx="64" cy="-2" r="1.9" />
      </g>
    </g>
  ),
};

// Round spectacles for the granny, worn over the eyes.
export const SPECS = (
  <g className="specs">
    <circle cx="36" cy="48" r="14.5" />
    <circle cx="64" cy="48" r="14.5" />
    <path d="M48.6 46.5 Q50 43.6 51.4 46.5" />
    <path d="M21.5 45.5 L11 41.5 M78.5 45.5 L89 41.5" />
    <path className="specs-shine" d="M27 41 Q30 36.5 35 35.5 M55 41 Q58 36.5 63 35.5" />
  </g>
);
