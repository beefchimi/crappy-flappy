type SoundType = 'flap' | 'score' | 'hit';

let audioCtx: AudioContext | null = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}

export function playSound(type: SoundType) {
  ensureAudioCtx();
  if (!audioCtx) return;
  const ctx = audioCtx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);

  switch (type) {
    case 'flap':
      o.type = 'square';
      o.frequency.value = 440;
      g.gain.value = 0.15;
      o.start();
      o.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.08);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      o.stop(ctx.currentTime + 0.12);
      break;
    case 'score':
      o.type = 'triangle';
      o.frequency.value = 880;
      g.gain.value = 0.18;
      o.start();
      o.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.12);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      o.stop(ctx.currentTime + 0.18);
      break;
    case 'hit':
      o.type = 'sawtooth';
      o.frequency.value = 220;
      g.gain.value = 0.22;
      o.start();
      o.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.18);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
      o.stop(ctx.currentTime + 0.22);
      break;
  }
} 