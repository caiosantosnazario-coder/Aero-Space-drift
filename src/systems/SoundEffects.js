/**
 * SoundEffects — Simple retro sound effects generated procedurally.
 * No external files needed.
 */
export class SoundEffects {
  static context = null;

  static init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Generates a "Crash/Explosion" sound using white noise.
   */
  static playCrash() {
    if (!this.context) this.init();
    if (this.context.state === 'suspended') this.context.resume();

    const ctx = this.context;
    const sampleRate = ctx.sampleRate;
    const duration = 0.4;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with white noise that decays
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.pow(1 - t, 2.5); // Fast decay
      data[i] = (Math.random() * 2 - 1) * envelope * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Filter to make it sound "crunchy"
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
  }

  /**
   * Generates a "Near Miss" zing sound.
   */
  static playNearMiss() {
    if (!this.context) this.init();
    if (this.context.state === 'suspended') this.context.resume();

    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
}
