// Renders every narrated line (Showcase, The Tour, My Story, the water drop) to public/showcase/audio/<key>.mp3
// with ElevenLabs. Story Mode has its own voice; everything else uses the default one.
// Setup once: npx -y @elevenlabs/cli@latest onboard init  (signs in and puts ELEVENLABS_API_KEY in .env.local).
// Rerun after editing any line, so audio and captions match:  npm run narrate
// A full run costs about a credit per character (~5,600), so re-render only what changed, by key prefix:
//   npm run narrate -- dashboards.2 tour-intro
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { readdir, unlink, writeFile } from 'node:fs/promises';
import { content } from '../src/content.js';
import { lines } from '../src/story/tour/lines.js';
import { mine } from '../src/story/mine/content.js';

// Free built-in voices. Saad's real picks are library voices, which need a paid ElevenLabs plan through the API;
// on a paid plan swap them back: 'MKlLqCItoCkvdhrxgtLv' (Grampa Werthers) and '0rEo3eAjssGDUCXHYENf' (Grandma Rachel).
const DEFAULT_VOICE = 'pqHfZKP75CvOlQylNhV4'; // Bill, wise and mature: the Showcase and the water drop
const STORY_VOICE = 'XrExE9yKIg1WjnnlVkGX'; // Matilda, warm alto: Story Mode, The Tour and My Story
const MODEL = 'eleven_v4';

// Every narrated line as [key, text]. Keys match what src/narrator.js fetches.
const clips = [];
const add = (prefix, id, voice) => voice.forEach(([, text], i) => clips.push([`${prefix}${id}.${i}`, text]));
for (const [id, c] of Object.entries(content.showcase)) add('', id, c.voice);
for (const [id, v] of Object.entries(lines)) add('tour-', id, v);
for (const [id, c] of Object.entries(mine)) if (c?.voice) add('mine-', id, c.voice);
for (const [id, text] of Object.entries(content.drop)) clips.push([`drop-${id}.0`, text]);

const only = process.argv.slice(2);
const out = new URL('../public/showcase/audio/', import.meta.url);
const client = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY

for (const [key, text] of clips) {
  if (only.length && !only.some(p => key.startsWith(p))) continue;
  const voice = /^(tour|mine)-/.test(key) ? STORY_VOICE : DEFAULT_VOICE;
  let audio;
  try {
    audio = Buffer.from(await new Response(await client.textToSpeech.convert(voice, { text, modelId: MODEL })).arrayBuffer());
  } catch (e) {
    console.error(`${key}: ${e.statusCode ?? ''} ${e.body ? JSON.stringify(e.body) : e.message}`);
    process.exitCode = 1; // not process.exit(): on Windows it can crash while the SDK's request is closing
    break;
  }
  await writeFile(new URL(`${key}.mp3`, out), audio); // only once the clip has arrived, so a failed run keeps the old one
  console.log(`${`${key}.mp3`.padEnd(24)} ${String(audio.length >> 10).padStart(3)} KB  ${text}`);
}

if (!only.length && !process.exitCode) { // a full run also drops clips for lines that no longer exist
  const keep = new Set(clips.map(([key]) => `${key}.mp3`));
  for (const f of await readdir(out)) if (f.endsWith('.mp3') && !keep.has(f)) await unlink(new URL(f, out));
}
