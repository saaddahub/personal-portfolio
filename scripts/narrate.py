# Renders every narrated line (Showcase, The Tour, My Story) to public/showcase/audio/<key>.mp3
# with a British neural voice (Microsoft Edge's read-aloud voices, through edge-tts).
# Setup once:  pip install edge-tts
# Rerun after editing any line, so audio and captions match:  python scripts/narrate.py
# Other voices:  python scripts/narrate.py --voice en-GB-ThomasNeural   (list them: edge-tts --list-voices)
import argparse, asyncio, json, pathlib, subprocess

import edge_tts

root = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('--voice', default='en-GB-RyanNeural')
ap.add_argument('--rate', default='+0%')
args = ap.parse_args()

# Every narrated line on the site as [key, text]: Showcase `<chapter>.<n>`, The Tour `tour-<chapter>.<n>`,
# My Story `mine-<chapter>.<n>`. Keys match what src/narrator.js fetches.
read = """
const [{ content }, { lines }, { mine }] = await Promise.all([
  import('./src/content.js'), import('./src/story/tour/lines.js'), import('./src/story/mine/content.js')]);
const out = [];
const add = (prefix, id, voice) => voice.forEach(([, text], i) => out.push([`${prefix}${id}.${i}`, text]));
for (const [id, c] of Object.entries(content.showcase)) add('', id, c.voice);
for (const [id, v] of Object.entries(lines)) add('tour-', id, v);
for (const [id, c] of Object.entries(mine)) if (c?.voice) add('mine-', id, c.voice);
for (const [id, text] of Object.entries(content.drop)) out.push([`drop-${id}.0`, text]);
console.log(JSON.stringify(out));
"""
clips = json.loads(subprocess.run(['node', '--input-type=module', '-e', read], cwd=root, capture_output=True, text=True, check=True).stdout)

out = root / 'public/showcase/audio'
out.mkdir(parents=True, exist_ok=True)
for old in [*out.glob('*.mp3'), *out.glob('*.wav')]:  # the folder only holds generated clips; drop lines that no longer exist
    old.unlink()


async def main():
    for key, text in clips:
        path = out / f'{key}.mp3'
        await edge_tts.Communicate(text, args.voice, rate=args.rate).save(str(path))
        print(f'{path.name:24} {path.stat().st_size // 1024:3} KB  {text}')

asyncio.run(main())
