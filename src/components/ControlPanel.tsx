import { ui } from './../data/content';
import { ChevronLeft, ChevronRight, Contrast } from 'lucide-react';
import { content } from '../data/content';
import { monitor, useMonitor } from '../store/useMonitor';
import { KeyButton } from './KeyButton';
import { Knob } from './Knob';
import { SpeakerGrille } from './SpeakerGrille';
import { PowerButton } from './PowerButton';
import { Led } from './Led';
export function ControlPanel() {
  const { muted } = useMonitor();
  return <div className="control-panel">
    <div className="brand-block"><strong>{content.name}</strong><span>{ui.personalMonitor}<b>{ui.sa012}</b></span></div>
    <div className="speaker-block"><SpeakerGrille /><span>{muted ? ui.soundOffM : ui.soundOnM}</span></div>
    <div className="hardware-controls">
      <div className="control-group"><div className="channel-keys"><KeyButton label={ui.previousChannel} onPress={() => monitor.step(-1)} repeat><ChevronLeft size={21} /></KeyButton><KeyButton label={ui.nextChannel} onPress={() => monitor.step(1)} repeat><ChevronRight size={21} /></KeyButton></div><span>{ui.channel}</span></div>
      <div className="control-group"><KeyButton label={ui.cycleColourMode} onPress={monitor.colour} className="colour-button"><Contrast size={22} /></KeyButton><span>{ui.colour}</span></div>
      <div className="control-group"><Knob /><span>{ui.brightness}</span></div>
      <div className="hardware-divider" /><div className="control-group power-group"><PowerButton /><span><Led />{ui.power}</span></div>
    </div>
  </div>;
}
