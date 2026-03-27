# float-imgplay

Image-to-sound player. Scans pixel data from images and generates rule-based music via Web Audio API.

Drop a CSS class on any image element, initialize, done.

## Install

```bash
npm install float-imgplay
```

### CDN

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/float-imgplay/dist/float-imgplay.css">
<script src="https://unpkg.com/float-imgplay"></script>

<!-- jsdelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/float-imgplay/dist/float-imgplay.css">
<script src="https://cdn.jsdelivr.net/npm/float-imgplay"></script>
```

## Usage

### Script tag

```html
<div class="float-imgplay">
  <img src="/images/photo.jpg" alt="" width="320" height="320">
</div>

<script src="https://unpkg.com/float-imgplay"></script>
<script>
  new FloatImgPlay({ selector: '.float-imgplay' }).init();
</script>
```

### ESM

```js
import { FloatImgPlay } from 'float-imgplay';

const player = new FloatImgPlay({ selector: '.float-imgplay' });
player.init();
```

### CommonJS

```js
const { FloatImgPlay } = require('float-imgplay');
```

### Background image

```html
<div class="float-imgplay"
     style="background-image:url('/images/sky.jpg'); width:320px; height:320px;">
</div>
```

## Options

```js
const player = new FloatImgPlay({
  selector: '.float-imgplay',
  autoplay: false,
  autoplayWhenVisibleOnly: true,
  stopWhenHidden: true,
  showPlayOverlay: true,
  showVolumeControl: true,

  audio: {
    masterVolume: 0.25,
    pitchShiftSemitones: 0,
    waveform: 'triangle',       // sine | square | sawtooth | triangle
    tempo: 100,
    noteDurationBeats: 0.5,
    restThreshold: 28,
    sampleColumns: 24,
    sampleRows: [0.25, 0.5, 0.75],
    filterType: 'lowpass',
    filterBaseHz: 900,
    filterVelocityAmount: 3000,
    attack: 0.02,
    release: 0.03,
    scaleMode: 'auto',          // auto | major | minor | pentatonic
    rootMode: 'filename-first-char', // filename-first-char | fixed
    fixedRootMidi: 60,
    octaveContrastThreshold: 100,
    octaveShiftSemitones: 12
  }
});
```

| Option | Default | Description |
|---|---|---|
| `selector` | `'.float-imgplay'` | CSS selector for target elements |
| `autoplay` | `false` | Auto-play on init |
| `autoplayWhenVisibleOnly` | `true` | Only autoplay when visible |
| `stopWhenHidden` | `true` | Stop when scrolled away / tab hidden / occluded |
| `showPlayOverlay` | `true` | Show centered play button |
| `showVolumeControl` | `true` | Show volume slider |
| `audio.masterVolume` | `0.25` | Master volume (0-1) |
| `audio.waveform` | `'triangle'` | Oscillator type |
| `audio.tempo` | `100` | BPM |
| `audio.scaleMode` | `'auto'` | Scale selection mode |
| `audio.filterType` | `'lowpass'` | BiquadFilter type |

### Per-element options

```js
const player = new FloatImgPlay({ selector: '.float-imgplay' });
player.init();

const hero = document.querySelector('#hero');
player.register(hero, {
  autoplay: true,
  audio: { waveform: 'sawtooth', tempo: 132, scaleMode: 'minor' }
});
```

## API

| Method | Description |
|---|---|
| `init()` | Initialize and register all matching elements |
| `destroy()` | Remove all instances and event listeners |
| `register(el, options?)` | Register a single element with optional overrides |
| `unregister(el)` | Remove a single element |
| `play(el)` | Play audio for an element |
| `stop(el)` | Stop audio for an element |
| `pause(el)` | Alias for `stop()` |
| `refresh()` | Re-analyze all images (e.g., after src change) |

## CSS

```js
import 'float-imgplay/css';
```

```html
<link rel="stylesheet" href="https://unpkg.com/float-imgplay/dist/float-imgplay.css">
```

## How it works

1. **Pixel scanning** - Downscales image to 64px, samples pixel rows at configurable positions
2. **Pitch mapping** - Brightness maps to scale degree, red/blue contrast triggers octave shifts
3. **Duration** - Blue-dominant pixels get longer notes, red-dominant get shorter
4. **Velocity** - Color saturation maps to note velocity
5. **Synthesis** - Web Audio API oscillator/filter/gain node chain produces sound
6. **Visibility** - IntersectionObserver + visibilitychange + elementFromPoint() occlusion detection

## License

MIT
