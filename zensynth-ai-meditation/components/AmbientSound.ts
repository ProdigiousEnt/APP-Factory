
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

    // 2. Theme-Specific Events
    if (lowercaseTheme.includes('storm') || lowercaseTheme.includes('thunder') || lowercaseTheme.includes('lightning') || lowercaseTheme.includes('rain')) {
      this.generateThunderEvents();
      this.generateRainEvents();
    } else if (lowercaseTheme.includes('ocean') || lowercaseTheme.includes('wave') || lowercaseTheme.includes('sea') || lowercaseTheme.includes('beach')) {
      this.generateOceanWaveEvents();
    } else if (lowercaseTheme.includes('viking') || lowercaseTheme.includes('ancient') || lowercaseTheme.includes('nordic') || lowercaseTheme.includes('mountain') || lowercaseTheme.includes('fjord') || lowercaseTheme.includes('horn')) {
      this.generateAncientHornEvents();
      this.generateWindEvents();
    } else if (lowercaseTheme.includes('space') || lowercaseTheme.includes('cosmic') || lowercaseTheme.includes('galaxy') || lowercaseTheme.includes('star')) {
      this.generateSpaceEvents();
    } else if (lowercaseTheme.includes('forest') || lowercaseTheme.includes('nature') || lowercaseTheme.includes('woods') || lowercaseTheme.includes('garden') || lowercaseTheme.includes('jungle')) {
      this.generateNatureEvents();
      this.generateWindEvents();
    } else if (lowercaseTheme.includes('city') || lowercaseTheme.includes('street') || lowercaseTheme.includes('urban') || lowercaseTheme.includes('traffic')) {
      this.generateCityEvents();
    } else {
      // Default: gentle nature sounds
      this.generateNatureEvents();
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

  private generateThunderEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    const createThunder = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;

      const now = this.audioCtx.currentTime;
      const duration = 2 + Math.random() * 3;

      // Create rumbling thunder with noise
      const bufferSize = 4096;
      const buffer = this.audioCtx.createBuffer(1, bufferSize * 10, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + duration * 0.2);
      filter.frequency.exponentialRampToValueAtTime(50, now + duration);
      filter.Q.value = 2;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(now);
      source.stop(now + duration);

      // Random delay before next thunder (15-45 seconds)
      const nextDelay = 15000 + Math.random() * 30000;
      setTimeout(() => createThunder(), nextDelay);
    };

    // First thunder after 5-10 seconds
    setTimeout(() => createThunder(), 5000 + Math.random() * 5000);
  }

  private generateRainEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    // Continuous rain noise
    const bufferSize = 4096;
    const node = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);

    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
    };

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    node.connect(filter);
    filter.connect(this.masterGain);
    this.nodes.push(node, filter);
  }

  private generateOceanWaveEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    const createWave = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;

      const now = this.audioCtx.currentTime;
      const duration = 6 + Math.random() * 4;

      // Create wave crash with filtered noise
      const bufferSize = 4096;
      const buffer = this.audioCtx.createBuffer(1, bufferSize * 20, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        const envelope = Math.sin((i / data.length) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.8;
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + duration * 0.3);
      filter.frequency.exponentialRampToValueAtTime(200, now + duration);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + duration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(now);
      source.stop(now + duration);

      // Waves every 8-15 seconds
      const nextDelay = 8000 + Math.random() * 7000;
      setTimeout(() => createWave(), nextDelay);
    };

    createWave();
  }

  private generateWindEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    // Continuous wind with LFO modulation
    const bufferSize = 4096;
    const node = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);

    let lastOut = 0;
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.05 * white)) / 1.05;
        lastOut = output[i];
        output[i] *= 0.3;
      }
    };

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.8;

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    node.connect(filter);
    filter.connect(this.masterGain);
    lfo.start();

    this.nodes.push(node, filter, lfo, lfoGain);
  }

  private generateSpaceEvents() {
    if (!this.audioCtx || !this.masterGain) return;

    // Deep space ambience with slow evolving tones
    const createSpaceTone = () => {
      if (!this.audioCtx || !this.masterGain || !this.isStarted) return;

      const now = this.audioCtx.currentTime;
      const duration = 15 + Math.random() * 10;

      const freq = 40 + Math.random() * 80;
      const oscs = [
        this.createOsc(freq, 'sine', 0.02),
        this.createOsc(freq * 1.5, 'sine', 0.015),
        this.createOsc(freq * 2, 'sine', 0.01)
      ];

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 5;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + duration * 0.3);
      gain.gain.setValueAtTime(0.08, now + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      oscs.forEach(o => o.connect(filter));
      filter.connect(gain);
      gain.connect(this.masterGain);

      oscs.forEach(o => {
        o.start(now);
        o.stop(now + duration);
      });

      // Next tone after 10-20 seconds
      const nextDelay = 10000 + Math.random() * 10000;
      setTimeout(() => createSpaceTone(), nextDelay);
    };

    createSpaceTone();
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
