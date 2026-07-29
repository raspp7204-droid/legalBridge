/**
 * Chat sounds, synthesised with the Web Audio API — no audio files, so
 * nothing to download and nothing to 404. Send is a short rising blip;
 * receive is a two-note chime pitched lower so the two are never confused.
 */

let ctx: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Browsers suspend the context until the page has been interacted with.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function note(
  ac: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  peak: number,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);

  // Quick attack, smooth decay — a click-free blip.
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export function playSend() {
  const ac = context();
  if (!ac) return;
  const t = ac.currentTime;
  note(ac, 660, t, 0.09, 0.05);
  note(ac, 880, t + 0.05, 0.11, 0.045);
}

export function playReceive() {
  const ac = context();
  if (!ac) return;
  const t = ac.currentTime;
  note(ac, 523.25, t, 0.13, 0.055);
  note(ac, 392, t + 0.11, 0.18, 0.05);
}
