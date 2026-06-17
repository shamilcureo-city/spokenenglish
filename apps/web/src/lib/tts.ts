/** Native-audio playback via the Web Speech API (for "hear it" / slow replay). */
export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, opts?: { slow?: boolean; lang?: string }): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Match the en-IN calibration of the drill; the browser falls back to its default
    // English voice when no en-IN voice is installed.
    u.lang = opts?.lang ?? 'en-IN';
    u.rate = opts?.slow ? 0.55 : 1;
    synth.speak(u);
  } catch {
    /* ignore */
  }
}
