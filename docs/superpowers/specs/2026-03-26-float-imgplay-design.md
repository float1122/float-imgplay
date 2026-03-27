# float-imgplay Design Spec

## Overview

Image-to-sound player library. Scans pixel data from images and generates rule-based music via Web Audio API. Drop-in usage: add a CSS class, initialize, done.

## Naming

| Item | Value |
|---|---|
| npm package | `float-imgplay` |
| JS class | `FloatImgPlay` |
| CSS prefix | `.float-imgplay` |
| Global (IIFE) | `window.FloatImgPlay` |
| GitHub repo | `float-imgplay` |

## Project Location

`imgPlay/` directory inside the current working directory.

## Project Structure

```
imgPlay/
  src/
    float-imgplay.js        # Main library source (ESM)
    float-imgplay.css        # Recommended CSS
  dist/                      # Build output (gitignored except for npm publish)
    float-imgplay.esm.js
    float-imgplay.umd.js
    float-imgplay.iife.js
    float-imgplay.iife.min.js
    float-imgplay.css
  examples/
    basic.html               # Usage demo page
  package.json
  rollup.config.js
  .gitignore
  .npmignore
  README.md
  LICENSE                    # MIT
```

## Build System

**Rollup** with the following plugins:
- `@rollup/plugin-terser` — minification for IIFE build
- `rollup-plugin-copy` — copy CSS to dist

### Build Outputs

| File | Format | Use Case |
|---|---|---|
| `dist/float-imgplay.esm.js` | ESM | `import { FloatImgPlay } from 'float-imgplay'` |
| `dist/float-imgplay.umd.js` | UMD | `require('float-imgplay')` / AMD |
| `dist/float-imgplay.iife.js` | IIFE | `<script src>` → `window.FloatImgPlay` |
| `dist/float-imgplay.iife.min.js` | IIFE minified | CDN / JS sharing sites |
| `dist/float-imgplay.css` | CSS | Optional recommended styles |

## package.json Key Fields

```json
{
  "name": "float-imgplay",
  "version": "1.0.0",
  "description": "Image-to-sound player. Scans pixel data and generates rule-based music via Web Audio API.",
  "main": "dist/float-imgplay.umd.js",
  "module": "dist/float-imgplay.esm.js",
  "browser": "dist/float-imgplay.iife.min.js",
  "unpkg": "dist/float-imgplay.iife.min.js",
  "jsdelivr": "dist/float-imgplay.iife.min.js",
  "exports": {
    ".": {
      "import": "./dist/float-imgplay.esm.js",
      "require": "./dist/float-imgplay.umd.js",
      "default": "./dist/float-imgplay.iife.min.js"
    },
    "./css": "./dist/float-imgplay.css"
  },
  "files": ["dist/", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  }
}
```

## Code Changes from Original

Original `RidmImageAudio` IIFE library is converted to ESM with all naming changes:

- Class: `RidmImageAudio` → `FloatImgPlay`
- Default selector: `.ridm-image-audio` → `.float-imgplay`
- CSS classes: `ridm-image-audio--ready` → `float-imgplay--ready`, etc.
- UI classes: `ridm-image-audio-ui` → `float-imgplay-ui`, etc.
- Console warnings: `[RidmImageAudio]` → `[FloatImgPlay]`

Source rewritten as ESM (`export class FloatImgPlay`), Rollup handles UMD/IIFE wrapping.

## Library Features (unchanged from original)

- Class-based drop-in: add `.float-imgplay` class to any element
- Supports: `<img>`, child `<img>`, `background-image`
- Click-to-play with centered play button overlay
- Volume slider (bottom-right)
- Autoplay with visibility-only option
- Stop when hidden: IntersectionObserver + visibilitychange + elementFromPoint() occlusion
- Audio synthesis: Web Audio API oscillator/filter/gain nodes
- Configurable: volume, pitch, waveform, tempo, scale, filter, envelope, sampling density

## Distribution Channels

1. **npm** — `npm install float-imgplay`
2. **CDN** — unpkg.com/float-imgplay, cdn.jsdelivr.net/npm/float-imgplay (automatic from npm)
3. **JS sharing sites** — upload `dist/float-imgplay.iife.min.js` directly
4. **GitHub** — source + releases with dist files attached

## Usage Examples

### Script tag (CDN)
```html
<link rel="stylesheet" href="https://unpkg.com/float-imgplay/dist/float-imgplay.css">
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
