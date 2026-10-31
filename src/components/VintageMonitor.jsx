import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Contrast, Power } from 'lucide-react';
import MonitorChassis from './MonitorChassis';
import './VintageMonitor.css';

const channels = [['home', 'HOME'], ['work', 'WORK'], ['about', 'ABOUT'], ['contact', 'CONTACT']];
const colours = ['Colour', 'Amber', 'Mono'];

export default function VintageMonitor() {
  const frame = useRef(null);
  const cleanupFrame = useRef(() => {});
  const address = useRef(window.location.pathname + window.location.search + window.location.hash);
  const [source, setSource] = useState(() => window.location.pathname + window.location.search + window.location.hash);
  const [powered, setPowered] = useState(true);
  const [ready, setReady] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [colour, setColour] = useState(0);
  const [osd, setOsd] = useState('');

  useEffect(() => {
    if (!osd) return;
    const timer = setTimeout(() => setOsd(''), 1600);
    return () => clearTimeout(timer);
  }, [osd]);

  useEffect(() => {
    const navigate = () => {
      const next = window.location.pathname + window.location.search + window.location.hash;
      if (next !== address.current) {
        address.current = next;
        if (frame.current) frame.current.contentWindow.location.replace(next);
      }
    };
    window.addEventListener('popstate', navigate);
    window.addEventListener('hashchange', navigate);
    return () => {
      cleanupFrame.current();
      window.removeEventListener('popstate', navigate);
      window.removeEventListener('hashchange', navigate);
    };
  }, []);

  const loaded = () => {
    cleanupFrame.current();
    const element = frame.current;
    const child = element.contentWindow;
    const syncAddress = () => {
      address.current = child.location.pathname + child.location.search + child.location.hash;
      window.history.replaceState(null, '', address.current);
      document.title = child.document.title;
    };
    const screenReady = () => setReady(true);
    child.addEventListener('hashchange', syncAddress);
    child.addEventListener('popstate', syncAddress);
    element.addEventListener('portfolio:ready', screenReady);
    cleanupFrame.current = () => {
      child.removeEventListener('hashchange', syncAddress);
      child.removeEventListener('popstate', syncAddress);
      element.removeEventListener('portfolio:ready', screenReady);
    };
    syncAddress();
    if (!child.document.querySelector('.preloader-container')) setReady(true);
  };

  const changeChannel = direction => {
    const child = frame.current?.contentWindow;
    if (!child || !ready) return;
    const onProject = child.location.pathname.startsWith('/work/');
    const available = channels.filter(([id]) => onProject || child.document.getElementById(id));
    if (!available.length) return;
    const current = onProject ? 'work' : child.location.hash.slice(1) || 'home';
    const index = Math.max(0, available.findIndex(([id]) => id === current));
    const [id, label] = available[(index + direction + available.length) % available.length];
    setOsd(`CHANNEL  ${label}`);
    if (onProject) { setReady(false); child.location.assign(`/#${id}`); }
    else {
      child.history.pushState(null, '', `/#${id}`);
      child.dispatchEvent(new child.HashChangeEvent('hashchange'));
      child.dispatchEvent(new child.CustomEvent('portfolio:navigate', { detail: id }));
    }
  };

  const togglePower = () => {
    setOsd('');
    setReady(false);
    cleanupFrame.current();
    if (!powered) setSource(address.current);
    setPowered(value => !value);
  };

  return (
    <main className="crt-room">
      <a className="crt-skip" href="#monitor-controls">Skip to monitor controls</a>
      <div className={`crt-machine ${powered ? 'is-powered' : 'is-off'}`}>
        <div className="crt-shell-fallback" aria-hidden="true" />
        <div className="crt-screen">
          {powered && <div className={`crt-picture crt-picture--${colours[colour].toLowerCase()}`} style={{ '--picture-brightness': brightness / 100 }}>
            {/* A separate viewport preserves the portfolio's fixed navigation and scroll choreography. */}
            <iframe ref={frame} src={source} onLoad={loaded} title="Saad Akhtar portfolio"
              data-portfolio-screen="true" allow="autoplay; clipboard-write" />
          </div>}
          <div className="crt-glass" aria-hidden="true" />
          <div className="crt-afterglow" aria-hidden="true" />
          {powered && osd && <output className="crt-osd" aria-live="polite">{osd}</output>}
        </div>
        <MonitorChassis />
        <div className="crt-brand" aria-label="Saad Akhtar personal monitor">
          <strong>SAAD<span> AKHTAR</span></strong>
          <small>PERSONAL MONITOR <b>SA–01</b></small>
        </div>
        <div className="crt-vents" aria-hidden="true" />
        <div className="crt-controls" id="monitor-controls" role="group" aria-label="Monitor controls" tabIndex={-1}>
          <div className="crt-control-group">
            <div className="crt-channel-pair">
              <button type="button" className="crt-key" onClick={() => changeChannel(-1)} disabled={!powered || !ready} aria-label="Previous portfolio channel"><ChevronLeft size={16} /></button>
              <button type="button" className="crt-key" onClick={() => changeChannel(1)} disabled={!powered || !ready} aria-label="Next portfolio channel"><ChevronRight size={16} /></button>
            </div>
            <span aria-hidden="true">CHANNEL</span>
          </div>
          <div className="crt-control-group">
            <button type="button" className="crt-key" disabled={!powered} aria-label={`Picture colour: ${colours[colour]}. Change colour mode`} onClick={() => {
              const next = (colour + 1) % colours.length;
              setColour(next); setOsd(`PICTURE  ${colours[next].toUpperCase()}`);
            }}><Contrast size={17} /></button>
            <span aria-hidden="true">COLOUR</span>
          </div>
          <label className="crt-control-group crt-brightness">
            <span className="crt-dial" aria-hidden="true" style={{ '--dial-angle': `${(brightness - 70) / 45 * 250 - 125}deg` }}><i /></span>
            <input type="range" min="70" max="115" step="5" value={brightness} disabled={!powered} aria-label="Screen brightness" aria-valuetext={`${brightness} percent`} onChange={event => {
              const value = Number(event.target.value);
              setBrightness(value); setOsd(`BRIGHTNESS  ${value}`);
            }} />
            <span aria-hidden="true">BRIGHTNESS</span>
          </label>
          <div className="crt-control-group crt-power-group">
            <button type="button" className="crt-key crt-power" onClick={togglePower} aria-label={powered ? 'Turn monitor off' : 'Turn monitor on'} aria-pressed={powered}><Power size={17} /></button>
            <span aria-hidden="true"><i className="crt-led" /> POWER</span>
          </div>
        </div>
        <div className="crt-feet" aria-hidden="true" />
      </div>
      <p className="crt-room-caption" aria-hidden="true">A PERSONAL SIGNAL. <span>SAAD AKHTAR</span></p>
    </main>
  );
}
