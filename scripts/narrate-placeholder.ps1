# Placeholder narration: renders each Showcase line from src/content.js to public/showcase/audio/<id>.wav
# with the Windows desktop voice. Replace with recorded or stock-TTS files when the real voice is chosen.
# Rerun after editing any Showcase line so audio and captions match:  powershell -File scripts/narrate-placeholder.ps1
param([string]$Root = '.')
$Root = (Resolve-Path $Root).Path
Add-Type -AssemblyName System.Speech
$json = node --input-type=module -e "import('file:///$($Root -replace '\\','/')/src/content.js').then(m => console.log(JSON.stringify(Object.fromEntries(Object.entries(m.content.showcase).map(([k, v]) => [k, v.line])))))"
$lines = $json | ConvertFrom-Json
$out = Join-Path $Root 'public/showcase/audio'
New-Item -ItemType Directory -Force $out | Out-Null
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($p in $lines.PSObject.Properties) {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice('Microsoft David Desktop')
  $file = Join-Path $out "$($p.Name).wav"
  $synth.SetOutputToWaveFile($file, $format)
  $text = [System.Security.SecurityElement]::Escape($p.Value)
  $ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><prosody rate='-15%' pitch='-12%'>$text</prosody></speak>"
  $synth.SpeakSsml($ssml)
  $synth.Dispose()
  "{0}  {1:N0} KB" -f $file, ((Get-Item $file).Length / 1KB)
}
