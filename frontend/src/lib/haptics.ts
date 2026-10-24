/**
 * موتور بازخورد لمسی و آکوستیک (Tactile & Acoustic Haptic Engine)
 * ترکیب لرزش فیزیکی موبایل (navigator.vibrate) با پالس آکوستیک Web Audio API
 */
export function triggerTactileHaptic(kind: 'tick' | 'thump' | 'ribbon' = 'tick') {
  if (typeof window === 'undefined') return;

  // ۱. بازخورد فیزیکی روی دستگاه‌های لمسی
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(kind === 'thump' ? 10 : kind === 'ribbon' ? [6, 20, 4] : 5);
    } catch {
      // نادیده‌گیری در مرورگرهای بدون مجوز
    }
  }

  // ۲. سنتز صدای مکانیکی ظریف بدون نیاز به فایل صوتی خارجی
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    if (kind === 'thump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.028);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    } else if (kind === 'ribbon') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.022);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.012);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.032);
    setTimeout(() => {
      ctx.close().catch((err) => { console.debug('AudioContext close ignored:', err); });
    }, 60);
  } catch (e) {
    console.debug('Haptics AudioContext error:', e);
  }
}
