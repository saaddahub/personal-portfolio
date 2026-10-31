import { ui } from './../data/content';
import { monitor } from '../store/useMonitor';
export function TestCard() { return <section className="test-card"><div className="test-bars" /><div className="test-bars lower-bars" /><div className="test-card-label"><h1>{ui.noSignal}</h1><p>{ui.sa01Channel99}</p><p>{ui.thereSNothingOnThisFrequency}</p><button onClick={() => monitor.tune(1)}>{ui.tuneToHome}</button><p>{ui.pressToFindASignal}</p></div></section>; }
