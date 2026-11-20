# Synthesizes the narration clips for the demo video with the offline Windows voice (System.Speech / SAPI).
# Called by scripts/record-video.mjs when NARRATE=1. Manifest: JSON array of { file, text }.
param([Parameter(Mandatory = $true)][string]$Manifest)

$ErrorActionPreference = 'Stop'  # make synthesis errors exit non-zero so Node reports them
Add-Type -AssemblyName System.Speech
# PS 5.1 returns a JSON array as ONE object; do not wrap in @() (it would nest). foreach enumerates it, or a lone object.
$items = Get-Content -Raw -Encoding UTF8 $Manifest | ConvertFrom-Json

$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = @($s.GetInstalledVoices() | Where-Object { $_.Enabled })
if ($voices.Count -eq 0) { Write-Error 'No enabled Windows speech voices found.'; exit 2 }
$pick = if ($env:VOICE_NAME) { $voices | Where-Object { $_.VoiceInfo.Name -like "*$($env:VOICE_NAME)*" } | Select-Object -First 1 } else { $null }
if (-not $pick) { $pick = $voices | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' -and $_.VoiceInfo.Gender -eq 'Female' } | Select-Object -First 1 }
if (-not $pick) { $pick = $voices | Select-Object -First 1 }
$s.SelectVoice($pick.VoiceInfo.Name)
$s.Rate = -1
Write-Output "voice: $($pick.VoiceInfo.Name)"

foreach ($i in $items) {
  $s.SetOutputToWaveFile($i.file)
  $s.Speak($i.text)
  $s.SetOutputToNull()
}
$s.Dispose()
