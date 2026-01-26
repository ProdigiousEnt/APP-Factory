
/**
 * Advanced Procedural Soundscape Generator
 * Creates dynamic, theme-aware environments using Web Audio synthesis.
 */
export class AmbientSoundscape {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private isStarted = false;

  start(theme: string) {
    if (this.isStarted && this.audioCtx?.state !== 'suspended') return;

    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isStarted) return;
    this.isStarted = true;

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
    this.masterGain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 2);

    const lowercaseTheme = theme.toLowerCase();

    // 1. Core Atmosphere (Noise Floor)
    this.createAtmosphere(lowercaseTheme);

    // 2. Contextual Events - Explicitly check for 'horn'
    if (
      lowercaseTheme.includes('viking') || 
      lowercaseTheme.includes('ancient') || 
      lowercaseTheme.includes('nordic') || 
      lowercaseTheme.includes('mountain') || 
      lowercaseTheme.includes('fjord') ||
      lowercaseTheme.includes('horn')
    ) {
      this.generateAncientHornEvents();
    }
    
    if (lowercaseTheme.includes('city') || lowercaseTheme.includes('street') || lowercaseTheme.includes('urban') || lowercaseTheme.includes('traffic')) {
      this.generateCityEvents();
    } else if (lowercaseTheme.includes('forest') || lowercaseTheme.includes('nature') || lowercaseTheme.includes('woods') || lowercaseTheme.includes('garden')) {
      this.generateNatureEvents();
    } else if (lowercaseTheme.includes('water') || lowercaseTheme.includes('ocean') || lowercaseTheme.includes('rain')) {
      this.generateWaterEvents();
    }
  }

  private createAtmosphere(theme: string) {
    if (!this.audioCtx || !this.masterGain) return;

    const bufferSize = 4096;
    let lastOut = 0.0;
    const node = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
    
    const isNature = theme.includes('forest') || theme.includes('nature') || theme.includes('mountain') || theme.includes('viking') || theme.includes('fjord') || theme.includes('horn');

    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (isNature) {
          // Deep Brown Noise for mountains/fjords
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.0;
        } else {
          // Pink-ish noise for urban
          output[i] = (lastOut + (0.1 * white)) / 1.1;
          lastOut = output[i];
          output[i] *= 0.4;
        }
      }
    };

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isNature ? 350 : 700;

    node.connect(filter);
    filter.connect(this.masterGain);
    this.nodes.push(node, filter);
  }

  /**
   * Generates a powerful, resonant, distant Viking-style horn blast.
   */
  private generateAncientHornEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    const createVikingHorn = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;

      const now = this.audioCtx.currentTime;
      const duration = 5 + Math.random() * 4;
      
      // Create a thick sound using multiple detuned oscillators for that "brass" feel
      const oscs = [
        this.createOsc(55, 'sawtooth', 0.05),   // Sub-bass root
        this.createOsc(110, 'sawtooth', 0.06),  // Main frequency
        this.createOsc(110.8, 'sawtooth', 0.04), // Detuned harmonic
        this.createOsc(164.8, 'triangle', 0.03), // P5 harmonic
        this.createOsc(220, 'square', 0.01)     // Brassy grit
      ];

      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.4); // Open up the brassiness
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);
      filter.Q.value = 8; // High resonance for that "cry"

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 2.0); // Majestic slow swelling attack
      gain.gain.setValueAtTime(0.12, now + duration - 2.0);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      oscs.forEach(o => o.connect(filter));
      filter.connect(gain);
      gain.connect(this.masterGain!);

      oscs.forEach(o => {
        o.start(now);
        o.stop(now + duration);
      });

      // Random delay before the next horn call
      const nextDelay = 12000 + Math.random() * 20000;
      setTimeout(() => createVikingHorn(), nextDelay);
    };

    // First horn occurs shortly after starting
    setTimeout(() => createVikingHorn(), 3000);
  }

  private createOsc(freq: number, type: OscillatorType, volume: number): OscillatorNode {
    const osc = this.audioCtx!.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
    return osc;
  }

  private generateCityEvents() {
    if (!this.audioCtx || !this.masterGain) return;
    const createHorn = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, this.audioCtx.currentTime);
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.audioCtx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 2.5);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 3);
      setTimeout(() => createHorn(), 10000 + Math.random() * 15000);
    };
    createHorn();
  }

  private generateNatureEvents() {
    if (!this.audioCtx || !this.masterGain) return;
    const createChirp = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.008, this.audioCtx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
      setTimeout(() => createChirp(), 5000 + Math.random() * 12000);
    };
    createChirp();
  }

  private generateWaterEvents() {
    if (!this.audioCtx || !this.masterGain) return;
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    if (this.masterGain) {
      lfoGain.connect(this.masterGain.gain);
    }
    lfo.start();
    this.nodes.push(lfo, lfoGain);
  }

  stop() {
    this.isStarted = false;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1.5);
      setTimeout(() => {
        this.audioCtx?.close();
        this.audioCtx = null;
      }, 1600);
    }
  }
}
