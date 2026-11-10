// The drop's faces: just eyes, big and glossy, and they do all the expressing. Drawn in a 100 × 100 box laid
// over the drop's body. `happy` is its resting look, `shy` is what it does when it gets bashful, and MOODS are
// the looks a hover can bring out.

const L = 36, R = 64, Y = 48, RX = 9, RY = 12.5;

// A glossy eye: a black oval, one big soft highlight and a small second sparkle.
const Eye = ({ x, s = 1 }) => (
  <g className="eye-g">
    <ellipse className="eye" cx={x} cy={Y} rx={RX * s} ry={RY * s} />
    <ellipse className="spark" cx={x + 2.6 * s} cy={Y - 4.2 * s} rx={3.6 * s} ry={4.6 * s} transform={`rotate(-18 ${x + 2.6 * s} ${Y - 4.2 * s})`} />
    <circle className="spark" cx={x - 3.2 * s} cy={Y + 5.6 * s} r={1.7 * s} />
  </g>
);
// Happy-closed (^), or sleepy-closed (u) when down.
const Arc = ({ x, down = false }) => <path className="line" d={`M${x - RX} ${Y + 2} Q${x} ${Y + (down ? 10 : -11)} ${x + RX} ${Y + 2}`} />;
// Half-lidded: the bottom of the oval under a straight lid.
const Lid = ({ x }) => (
  <g className="eye-g">
    <path className="eye" d={`M${x - RX} ${Y} A${RX} ${RY} 0 0 0 ${x + RX} ${Y}Z`} />
    <circle className="spark" cx={x + 2.4} cy={Y + 3.4} r={1.9} />
    <path className="line" d={`M${x - RX - 1.5} ${Y} L${x + RX + 1.5} ${Y}`} />
  </g>
);
const Blush = ({ strong = false }) => (
  <g className="blush" opacity={strong ? 0.95 : 0.5}>
    <ellipse cx="20" cy="64" rx="8" ry="4.6" />
    <ellipse cx="80" cy="64" rx="8" ry="4.6" />
  </g>
);
const heart = x => `M${x} ${Y + 10} C${x - 15} ${Y} ${x - 8} ${Y - 15} ${x} ${Y - 7} C${x + 8} ${Y - 15} ${x + 15} ${Y} ${x} ${Y + 10}Z`;
const star = x => `M${x} ${Y - 13} Q${x + 2.2} ${Y - 2.2} ${x + 13} ${Y} Q${x + 2.2} ${Y + 2.2} ${x} ${Y + 13} Q${x - 2.2} ${Y + 2.2} ${x - 13} ${Y} Q${x - 2.2} ${Y - 2.2} ${x} ${Y - 13}Z`;
const spiral = x => `M${x} ${Y} m-1.2 0 a1.2 1.2 0 1 1 2.4 0 a3 3 0 1 1 -6 0 a4.8 4.8 0 1 1 9.6 0 a6.6 6.6 0 1 1 -13.2 0`;

export const FACES = {
  happy: <><Blush /><Eye x={L} /><Eye x={R} /></>,
  joy: <><Blush /><Arc x={L} /><Arc x={R} /></>,
  wink: <><Blush /><Eye x={L} /><Arc x={R} /></>,
  wow: <><Eye x={L} s={1.22} /><Eye x={R} s={1.22} /></>,
  love: <><Blush strong /><path className="heart" d={heart(L)} /><path className="heart" d={heart(R)} /></>,
  star: <><Blush /><path className="star" d={star(L)} /><path className="star" d={star(R)} /></>,
  smug: <><Blush /><Lid x={L} /><Lid x={R} /></>,
  sleepy: <><Arc x={L} down /><Arc x={R} down /><text className="zzz" x="72" y="26">z</text></>,
  dizzy: <><path className="line" d={spiral(L)} /><path className="line" d={spiral(R)} /></>,
  shy: <><Blush strong /><path className="line" d={`M27 ${Y - 7} L40 ${Y} L27 ${Y + 7}`} /><path className="line" d={`M73 ${Y - 7} L60 ${Y} L73 ${Y + 7}`} /></>,
};

export const MOODS = ['joy', 'wink', 'wow', 'love', 'star', 'smug', 'sleepy', 'dizzy'];
