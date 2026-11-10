// The drop's faces: eyes and brows only, drawn in a 100 × 100 box laid over its body. Its default is `chill`,
// relaxed and unbothered; brows give it attitude without a mouth. MOODS come out on hover, IDLE when it is
// bored, and `irritated`, `talk`, `surprised` and `shy` are called up by what is going on.

const L = 35.5, R = 64.5, Y = 50, RX = 8.2, RY = 10.6, BY = 32.5; // eye centres, eye size, brow line

const Eye = ({ x, s = 1, dx = 0 }) => (
  <g className="eye-g">
    <ellipse className="eye" cx={x + dx} cy={Y} rx={RX * s} ry={RY * s} />
    <circle className="spark" cx={x + dx + 2 * s} cy={Y - 3.2 * s} r={1.9 * s} />
  </g>
);
// The lower part of an eye under a lid: heavier `cover` = sleepier; `tilt` slants the lid.
const Lidded = ({ x, cover = 0.35, tilt = 0, dx = 0 }) => {
  const cx = x + dx, top = Y - RY + RY * 2 * cover, w = RX * Math.sqrt(1 - ((top - Y) / RY) ** 2);
  return (
    <g className="eye-g">
      <path className="eye" d={`M${cx - w} ${top - tilt} L${cx + w} ${top + tilt} A${RX} ${RY} 0 ${top < Y ? 1 : 0} 1 ${cx - w} ${top - tilt}Z`} />
      <path className="lid" d={`M${cx - w - 1.6} ${top - tilt - 0.4} L${cx + w + 1.6} ${top + tilt + 0.4}`} />
    </g>
  );
};
// Looking up (an eye-roll): only the top of the eye shows above the lower lid.
const Up = ({ x }) => (
  <g className="eye-g">
    <path className="eye" d={`M${x - RX} ${Y - 2} A${RX} ${RY} 0 0 1 ${x + RX} ${Y - 2}Z`} />
    <path className="lid" d={`M${x - RX - 1.5} ${Y - 2} L${x + RX + 1.5} ${Y - 2}`} />
  </g>
);
// A narrowed slit, tilted for a glare.
const Slit = ({ x, tilt = 0 }) => <path className="eye" d={`M${x - RX - 1} ${Y - tilt} Q${x} ${Y - 4.6} ${x + RX + 1} ${Y + tilt} Q${x} ${Y + 3.4} ${x - RX - 1} ${Y - tilt}Z`} />;
const Flat = ({ x }) => <path className="line" d={`M${x - RX} ${Y} L${x + RX} ${Y}`} />;
const Arc = ({ x }) => <path className="line" d={`M${x - RX - 1} ${Y + 2} Q${x} ${Y - 8} ${x + RX + 1} ${Y + 2}`} />;
const Chevron = ({ x, right }) => <path className="line" d={right ? `M${x + 6} ${Y - 6} L${x - 5} ${Y} L${x + 6} ${Y + 6}` : `M${x - 6} ${Y - 6} L${x + 5} ${Y} L${x - 6} ${Y + 6}`} />;
// A brow over an eye: `a` is how far its inner end drops (negative lifts it), `up` raises the whole brow.
const Brow = ({ x, a = 0, up = 0, side }) => {
  const inner = side === 'l' ? x + 8.5 : x - 8.5, outer = side === 'l' ? x - 8.5 : x + 8.5;
  return <path className="brow" d={`M${outer} ${BY - up - a * 0.4} L${inner} ${BY - up + a}`} />;
};
const Brows = ({ a = 0, up = 0, la, ra, lu, ru }) => <><Brow x={L} side="l" a={la ?? a} up={lu ?? up} /><Brow x={R} side="r" a={ra ?? a} up={ru ?? up} /></>;
const Shades = () => (
  <g className="shades">
    <path d="M21 43 h25 v7 q0 8 -12.5 8 q-12.5 0 -12.5 -8Z" />
    <path d="M54 43 h25 v7 q0 8 -12.5 8 q-12.5 0 -12.5 -8Z" />
    <path className="shades-bar" d="M19 43.5 h62" />
    <path className="shades-shine" d="M26 47 l6 -2.4 M59 47 l6 -2.4" />
  </g>
);
// The manga anger mark: four short arcs bowed in toward an empty centre.
const Tick = () => <path className="tick" d="M72 13 Q76 18 80 13 M72 29 Q76 24 80 29 M68 17 Q73 21 68 25 M84 17 Q79 21 84 25" />;
const Sweat = () => <path className="sweat" d="M76 26 q-4 6 0 8 q4 -2 0 -8Z" />;
const spiral = x => `M${x} ${Y} m-1.2 0 a1.2 1.2 0 1 1 2.4 0 a3.2 3.2 0 1 1 -6.4 0 a5.2 5.2 0 1 1 10.4 0 a7.2 7.2 0 1 1 -14.4 0 a9.2 9.2 0 1 1 18.4 0`;
const Blush = () => <g className="blush"><ellipse cx="22" cy="63" rx="7" ry="3.8" /><ellipse cx="78" cy="63" rx="7" ry="3.8" /></g>;

export const FACES = {
  chill: <><Lidded x={L} cover={0.38} /><Lidded x={R} cover={0.38} /><Brows up={-1} /></>,
  talk: <><Lidded x={L} cover={0.24} /><Lidded x={R} cover={0.24} /><Brows la={0} ra={-2} ru={2.5} /></>,
  smirk: <><Lidded x={L} cover={0.42} tilt={1.4} /><Slit x={R} tilt={-0.6} /><Brows la={1} ra={-3} ru={4} /></>,
  sideeye: <><Lidded x={L} cover={0.4} dx={3.4} /><Lidded x={R} cover={0.4} dx={3.4} /><Brows a={1.5} /></>,
  unimpressed: <><Flat x={L} /><Flat x={R} /><Brows /></>,
  roll: <><Up x={L} /><Up x={R} /><Brows up={3} a={-1} /></>,
  bored: <><Lidded x={L} cover={0.58} /><Lidded x={R} cover={0.58} /><Brows up={-1.5} /></>,
  bold: <><Lidded x={L} cover={0.3} tilt={-1.2} /><Lidded x={R} cover={0.3} tilt={1.2} /><Brows a={4} up={-1} /></>,
  cool: <><Shades /><Brows la={0} ra={-3} lu={-1} ru={3} /></>,
  funky: <><Eye x={L} s={1.25} /><Eye x={R} s={0.68} /><Brows la={-3} lu={4} ra={3} ru={-1} /></>,
  wink: <><Eye x={L} /><Arc x={R} /><Brows la={0} ra={-2} ru={2} /></>,
  laugh: <><Chevron x={L} /><Chevron x={R} right /><Brows up={3} a={-1.5} /></>,
  suspicious: <><Slit x={L} /><Slit x={R} /><Brows la={3.5} ra={-2.5} ru={3} /></>,
  surprised: <><Eye x={L} s={1.12} /><Eye x={R} s={1.12} /><Brows up={6} a={-1} /></>,
  dizzy: <><path className="line" d={spiral(L)} /><path className="line" d={spiral(R)} /><Brows up={2} a={-2} /></>,
  awkward: <><Eye x={L} s={0.9} /><Eye x={R} s={0.9} /><Brows a={-3.5} up={1} /><Sweat /></>,
  irritated: <><Slit x={L} tilt={1.6} /><Slit x={R} tilt={-1.6} /><Brows a={5.5} up={-1.5} /><Tick /></>,
  shy: <><Blush /><Chevron x={L} /><Chevron x={R} right /><Brows a={-3} up={1} /></>,
};

export const MOODS = ['smirk', 'sideeye', 'unimpressed', 'roll', 'bold', 'cool', 'funky', 'wink', 'laugh', 'suspicious', 'surprised', 'dizzy', 'awkward'];
export const IDLE = ['sideeye', 'roll', 'bored', 'unimpressed'];
