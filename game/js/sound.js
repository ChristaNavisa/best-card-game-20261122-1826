// Ember Harbor — tiny WebAudio bleeps, synthesized in-page, no audio files.
// Everything is guarded: no AudioContext, no sound, no crash.

let audioContext = null;

export function ensureAudio() {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  } catch {
    audioContext = null;
  }
}

export function playTone(kind) {
  if (!audioContext) return;
  try {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const notes = { play: 520, surge: 780, win: 660, lose: 220, draw: 440 };
    osc.frequency.setValueAtTime(notes[kind] || 440, now);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Sound is garnish; a failure must never break the game.
  }
}
