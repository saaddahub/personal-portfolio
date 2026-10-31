import { ui, messages } from './../../data/content';
import { useState, type FormEvent } from 'react';
import { content } from '../../data/content';
import { monitor } from '../../store/useMonitor';
import { sfx } from '../../audio/sfx';
export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'error'>('idle'); const [error, setError] = useState('');
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const name = String(data.get('name')).trim(), email = String(data.get('email')).trim(), message = String(data.get('message')).trim();
    if (!name || !email || !message) { setError(ui.addYourNameEmailAndAMessage); return; }
    setStatus('sending'); setError(''); const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
    try {
      if (endpoint) {
        const response = await fetch(endpoint, { method: ui.post, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name, email, message }), signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(ui.theReceiverDidNotAcceptYourMessage);
        setStatus('sent'); form.reset(); sfx.play('chime'); monitor.announce(ui.transmissionReceived);
      } else {
        await new Promise(resolve => setTimeout(resolve, 700));
        window.location.href = `mailto:${content.email}?subject=${encodeURIComponent(messages.mailSubject(name))}&body=${encodeURIComponent(messages.mailBody(message, name, email))}`;
        setStatus('mail'); monitor.announce(ui.messagePreparedInYourMailApp);
      }
    } catch (cause) { setStatus('error'); setError(cause instanceof Error ? cause.message : ui.signalLostTryAgainOrUseThe); }
  }
  async function copy() { try { await navigator.clipboard.writeText(content.email); monitor.announce(ui.emailCopied); } catch { monitor.announce(ui.copyUnavailableSelectTheEmailBelow); } }
  return <section><h1>{ui.letSMake}<br /><em>{ui.aConnection}</em></h1><p>{ui.noSwitchboardJustMeOnTheOther}</p><div className="contact-layout"><form onSubmit={send} className="message-terminal"><label>{ui.label01YourName}<input name="name" autoComplete="name" required maxLength={100} placeholder={ui.whoSTransmitting} /></label><label>{ui.label02ReturnAddress}<input type="email" name="email" autoComplete="email" required maxLength={254} placeholder={ui.youSomewhereGood} /></label><label>{ui.label03YourMessage}<textarea name="message" required maxLength={5000} rows={3} placeholder={ui.anIdeaAQuestionAHello} /></label><button className="transmit-button" disabled={status === 'sending'} type="submit">{status === 'sending' ? ui.transmitting : ui.transmitMessage}</button><p role="status" className="form-status">{status === 'sent' ? ui.messageReceivedThanksForTuningIn : status === 'mail' ? ui.yourMailAppHasTheDraftPress : import.meta.env.VITE_CONTACT_ENDPOINT ? ui.directTransmissionEnabled : ui.opensYourMailAppToSend}</p>{error && <p role="alert" className="form-error">{error}</p>}</form><div className="contact-links"><h2>{ui.otherFrequencies}</h2><a href={`mailto:${content.email}`}>{ui.email}</a><a className="email-address" href={`mailto:${content.email}`}>{content.email}</a><button onClick={copy}>{ui.copyAddress}</button>{content.links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{ui.symbol3}{link.label[0]}{ui.symbol4}{link.label}{ui.symbol5}</a>)}<p>{content.location}<br />{ui.utc0500}</p></div></div></section>;
}
