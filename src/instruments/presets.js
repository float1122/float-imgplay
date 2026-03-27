/**
 * Instrument presets and ensemble definitions.
 *
 * Each instrument preset defines Web Audio synthesis parameters
 * that shape a unique "voice" for image sonification.
 *
 * Each ensemble preset combines multiple instruments into a
 * multi-layer arrangement (e.g., orchestra, band, electronic).
 */

export const INSTRUMENT_PRESETS = {
  // --- Keys & Piano ---
  piano: {
    name: "Piano",
    waveform: "triangle",
    octaveShift: 0,
    volume: 0.28,
    attack: 0.01,
    release: 0.08,
    filterType: "lowpass",
    filterBaseHz: 2000,
    filterVelocityAmount: 3000,
    sampleRows: [0.3, 0.5, 0.7]
  },
  epiano: {
    name: "E.Piano",
    waveform: "sine",
    octaveShift: 0,
    volume: 0.25,
    attack: 0.005,
    release: 0.12,
    filterType: "lowpass",
    filterBaseHz: 1800,
    filterVelocityAmount: 2500,
    sampleRows: [0.3, 0.5, 0.7]
  },
  organ: {
    name: "Organ",
    waveform: "square",
    octaveShift: 0,
    volume: 0.18,
    attack: 0.01,
    release: 0.02,
    filterType: "lowpass",
    filterBaseHz: 1200,
    filterVelocityAmount: 2000,
    sampleRows: [0.25, 0.5, 0.75]
  },

  // --- Synth ---
  synthLead: {
    name: "Synth Lead",
    waveform: "sawtooth",
    octaveShift: 0,
    volume: 0.22,
    attack: 0.005,
    release: 0.03,
    filterType: "lowpass",
    filterBaseHz: 800,
    filterVelocityAmount: 5000,
    sampleRows: [0.4, 0.5, 0.6]
  },
  synthPad: {
    name: "Synth Pad",
    waveform: "sine",
    octaveShift: 0,
    volume: 0.15,
    attack: 0.15,
    release: 0.3,
    filterType: "lowpass",
    filterBaseHz: 600,
    filterVelocityAmount: 1500,
    sampleRows: [0.2, 0.5, 0.8]
  },

  // --- Bass ---
  bass: {
    name: "Bass",
    waveform: "square",
    octaveShift: -1,
    volume: 0.25,
    attack: 0.008,
    release: 0.04,
    filterType: "lowpass",
    filterBaseHz: 500,
    filterVelocityAmount: 1500,
    sampleRows: [0.6, 0.7, 0.8]
  },
  subBass: {
    name: "Sub Bass",
    waveform: "sine",
    octaveShift: -2,
    volume: 0.3,
    attack: 0.01,
    release: 0.05,
    filterType: "lowpass",
    filterBaseHz: 300,
    filterVelocityAmount: 600,
    sampleRows: [0.7, 0.8, 0.9]
  },

  // --- Plucked / Short ---
  pluck: {
    name: "Pluck",
    waveform: "triangle",
    octaveShift: 0,
    volume: 0.2,
    attack: 0.002,
    release: 0.01,
    filterType: "lowpass",
    filterBaseHz: 3000,
    filterVelocityAmount: 4000,
    sampleRows: [0.35, 0.5, 0.65]
  },

  // --- Orchestral ---
  strings: {
    name: "Strings",
    waveform: "sawtooth",
    octaveShift: 0,
    volume: 0.16,
    attack: 0.1,
    release: 0.15,
    filterType: "lowpass",
    filterBaseHz: 900,
    filterVelocityAmount: 2000,
    sampleRows: [0.2, 0.4, 0.6]
  },
  brass: {
    name: "Brass",
    waveform: "sawtooth",
    octaveShift: 0,
    volume: 0.2,
    attack: 0.03,
    release: 0.06,
    filterType: "lowpass",
    filterBaseHz: 600,
    filterVelocityAmount: 4000,
    sampleRows: [0.3, 0.5, 0.7]
  },
  flute: {
    name: "Flute",
    waveform: "sine",
    octaveShift: 1,
    volume: 0.15,
    attack: 0.04,
    release: 0.08,
    filterType: "lowpass",
    filterBaseHz: 2500,
    filterVelocityAmount: 2000,
    sampleRows: [0.2, 0.3, 0.4]
  },
  choir: {
    name: "Choir",
    waveform: "triangle",
    octaveShift: 0,
    volume: 0.14,
    attack: 0.12,
    release: 0.2,
    filterType: "lowpass",
    filterBaseHz: 800,
    filterVelocityAmount: 1800,
    sampleRows: [0.3, 0.5, 0.7]
  },

  // --- Percussion-like ---
  bell: {
    name: "Bell",
    waveform: "sine",
    octaveShift: 1,
    volume: 0.12,
    attack: 0.001,
    release: 0.4,
    filterType: "highpass",
    filterBaseHz: 1000,
    filterVelocityAmount: 3000,
    sampleRows: [0.2, 0.4]
  },
  marimba: {
    name: "Marimba",
    waveform: "triangle",
    octaveShift: 0,
    volume: 0.22,
    attack: 0.002,
    release: 0.06,
    filterType: "bandpass",
    filterBaseHz: 1500,
    filterVelocityAmount: 2500,
    sampleRows: [0.4, 0.5, 0.6]
  },

  // --- Guitar-like ---
  guitar: {
    name: "Guitar",
    waveform: "sawtooth",
    octaveShift: 0,
    volume: 0.2,
    attack: 0.003,
    release: 0.05,
    filterType: "lowpass",
    filterBaseHz: 1500,
    filterVelocityAmount: 3500,
    sampleRows: [0.35, 0.5, 0.65]
  },

  // --- Electronic / Special ---
  acid: {
    name: "Acid",
    waveform: "sawtooth",
    octaveShift: -1,
    volume: 0.2,
    attack: 0.003,
    release: 0.02,
    filterType: "lowpass",
    filterBaseHz: 300,
    filterVelocityAmount: 6000,
    sampleRows: [0.5, 0.6, 0.7]
  },
  chiptune: {
    name: "Chiptune",
    waveform: "square",
    octaveShift: 1,
    volume: 0.14,
    attack: 0.002,
    release: 0.01,
    filterType: "highpass",
    filterBaseHz: 200,
    filterVelocityAmount: 4000,
    sampleRows: [0.3, 0.5, 0.7]
  },
  warmPad: {
    name: "Warm Pad",
    waveform: "triangle",
    octaveShift: 0,
    volume: 0.15,
    attack: 0.2,
    release: 0.25,
    filterType: "lowpass",
    filterBaseHz: 700,
    filterVelocityAmount: 1200,
    sampleRows: [0.2, 0.5, 0.8]
  },
  glass: {
    name: "Glass",
    waveform: "sine",
    octaveShift: 1,
    volume: 0.1,
    attack: 0.001,
    release: 0.5,
    filterType: "highpass",
    filterBaseHz: 2000,
    filterVelocityAmount: 2000,
    sampleRows: [0.15, 0.35]
  },
  wobble: {
    name: "Wobble",
    waveform: "sawtooth",
    octaveShift: -1,
    volume: 0.22,
    attack: 0.01,
    release: 0.03,
    filterType: "lowpass",
    filterBaseHz: 200,
    filterVelocityAmount: 5000,
    sampleRows: [0.6, 0.75, 0.9]
  }
};

export const ENSEMBLE_PRESETS = {
  orchestra: {
    name: "Orchestra",
    instruments: [
      { preset: "strings", volume: 0.18 },
      { preset: "brass", volume: 0.14 },
      { preset: "flute", volume: 0.12 }
    ]
  },
  rockBand: {
    name: "Rock Band",
    instruments: [
      { preset: "guitar", volume: 0.22 },
      { preset: "bass", volume: 0.2 },
      { preset: "organ", volume: 0.12 }
    ]
  },
  electronic: {
    name: "Electronic",
    instruments: [
      { preset: "synthLead", volume: 0.2 },
      { preset: "subBass", volume: 0.22 },
      { preset: "synthPad", volume: 0.12 }
    ]
  },
  jazzTrio: {
    name: "Jazz Trio",
    instruments: [
      { preset: "epiano", volume: 0.25 },
      { preset: "bass", volume: 0.2 },
      { preset: "pluck", volume: 0.15 }
    ]
  },
  ambient: {
    name: "Ambient",
    instruments: [
      { preset: "warmPad", volume: 0.16 },
      { preset: "glass", volume: 0.1 },
      { preset: "choir", volume: 0.12 }
    ]
  },
  chiptuneBand: {
    name: "Chiptune Band",
    instruments: [
      { preset: "chiptune", volume: 0.16 },
      { preset: "chiptune", volume: 0.14, octaveShift: -2 },
      { preset: "bell", volume: 0.1 }
    ]
  },
  cinematic: {
    name: "Cinematic",
    instruments: [
      { preset: "strings", volume: 0.18 },
      { preset: "choir", volume: 0.14 },
      { preset: "subBass", volume: 0.2 }
    ]
  },
  lofi: {
    name: "Lo-Fi",
    instruments: [
      { preset: "epiano", volume: 0.2 },
      { preset: "warmPad", volume: 0.12 },
      { preset: "pluck", volume: 0.14 }
    ]
  },
  acidHouse: {
    name: "Acid House",
    instruments: [
      { preset: "acid", volume: 0.2 },
      { preset: "subBass", volume: 0.22 },
      { preset: "synthPad", volume: 0.1 }
    ]
  },
  minimal: {
    name: "Minimal",
    instruments: [
      { preset: "piano", volume: 0.25 },
      { preset: "bell", volume: 0.1 }
    ]
  }
};

/**
 * Resolve an instrument config from a preset name or raw config.
 * Merges preset defaults with overrides.
 */
export function resolveInstrument(config) {
  if (typeof config === "string") {
    const preset = INSTRUMENT_PRESETS[config];
    if (!preset) throw new Error("[FloatImgPlay] Unknown instrument preset: " + config);
    return { ...preset };
  }

  if (config.preset) {
    const preset = INSTRUMENT_PRESETS[config.preset];
    if (!preset) throw new Error("[FloatImgPlay] Unknown instrument preset: " + config.preset);
    const merged = { ...preset };
    Object.keys(config).forEach(k => {
      if (k !== "preset" && config[k] !== undefined) merged[k] = config[k];
    });
    return merged;
  }

  return config;
}

/**
 * Resolve an ensemble preset into an array of resolved instruments.
 */
export function resolveEnsemble(name) {
  const ensemble = ENSEMBLE_PRESETS[name];
  if (!ensemble) throw new Error("[FloatImgPlay] Unknown ensemble preset: " + name);
  return ensemble.instruments.map(resolveInstrument);
}
