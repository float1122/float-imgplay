# float-imgplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the FloatImgPlay image-to-sound library for npm, GitHub, and CDN distribution with ESM/UMD/IIFE builds via Rollup.

**Architecture:** Single-file ESM source (`src/float-imgplay.js`) built by Rollup into three formats (ESM, UMD, IIFE+minified). CSS copied to dist. No runtime dependencies.

**Tech Stack:** Rollup, @rollup/plugin-terser, rollup-plugin-copy

---

### Task 1: Scaffold project structure

**Files:**
- Create: `imgPlay/package.json`
- Create: `imgPlay/.gitignore`
- Create: `imgPlay/.npmignore`
- Create: `imgPlay/LICENSE`

- [ ] **Step 1: Create directories**

```bash
cd "/Users/jangfolk/Library/CloudStorage/GoogleDrive-jangfolk806@gmail.com/내 드라이브/dev/development"
mkdir -p imgPlay/src imgPlay/dist imgPlay/examples
```

- [ ] **Step 2: Write package.json**

Create `imgPlay/package.json`:

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
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "image",
    "audio",
    "sound",
    "web-audio",
    "pixel",
    "music",
    "generative",
    "player"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "rollup-plugin-copy": "^3.5.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/user/float-imgplay.git"
  }
}
```

- [ ] **Step 3: Write .gitignore**

Create `imgPlay/.gitignore`:

```
node_modules/
dist/
.DS_Store
*.log
```

- [ ] **Step 4: Write .npmignore**

Create `imgPlay/.npmignore`:

```
src/
examples/
node_modules/
rollup.config.js
.gitignore
.DS_Store
*.log
docs/
```

- [ ] **Step 5: Write LICENSE**

Create `imgPlay/LICENSE` with MIT license text, copyright 2026 float-imgplay contributors.

- [ ] **Step 6: Initialize git and commit scaffold**

```bash
cd imgPlay
git init
git add package.json .gitignore .npmignore LICENSE
git commit -m "chore: scaffold float-imgplay project structure"
```

---

### Task 2: Write main library source (ESM)

**Files:**
- Create: `imgPlay/src/float-imgplay.js`

- [ ] **Step 1: Write src/float-imgplay.js**

Convert the original `RidmImageAudio` IIFE library to ESM format with all renames:
- `RidmImageAudio` -> `FloatImgPlay`
- `.ridm-image-audio` -> `.float-imgplay`
- `ridm-image-audio--ready` -> `float-imgplay--ready`
- `ridm-image-audio--playing` -> `float-imgplay--playing`
- `ridm-image-audio--paused` -> `float-imgplay--paused`
- `ridm-image-audio-ui` -> `float-imgplay-ui`
- `ridm-image-audio-play` -> `float-imgplay-play`
- `ridm-image-audio-volume` -> `float-imgplay-volume`
- `ridm-image-audio-volume-input` -> `float-imgplay-volume-input`
- `[RidmImageAudio]` -> `[FloatImgPlay]`

The file must:
- Remove the IIFE wrapper `(function(global) { ... })(window);`
- Use `export class FloatImgPlay { ... }` instead
- Add `export default FloatImgPlay;` at the end
- Keep all internal logic identical

Note on `innerHTML` usage: The library uses `innerHTML` to set play/pause button icons with hardcoded string literals (e.g., the play triangle character and pause bars). These are NOT user-supplied values - they are internal constants from the `overlayIcon` option which defaults to a Unicode character. This is safe because:
1. The values are developer-configured options, not end-user input
2. Default values are single Unicode characters
3. This is standard practice for UI widget libraries

- [ ] **Step 2: Verify file was written correctly**

Run: `head -5 imgPlay/src/float-imgplay.js` and `grep -c "FloatImgPlay" imgPlay/src/float-imgplay.js`
Expected: Header comment visible and 40+ FloatImgPlay occurrences

- [ ] **Step 3: Commit source**

```bash
cd imgPlay
git add src/float-imgplay.js
git commit -m "feat: add FloatImgPlay library source (ESM)"
```

---

### Task 3: Write CSS file

**Files:**
- Create: `imgPlay/src/float-imgplay.css`

- [ ] **Step 1: Write src/float-imgplay.css**

Create `imgPlay/src/float-imgplay.css`:

```css
.float-imgplay {
  position: relative;
  overflow: hidden;
}

.float-imgplay img {
  display: block;
  width: 100%;
  height: auto;
}

.float-imgplay--playing .float-imgplay-play {
  opacity: 0.85;
}

.float-imgplay--paused .float-imgplay-play,
.float-imgplay--ready .float-imgplay-play {
  opacity: 1;
}
```

- [ ] **Step 2: Commit CSS**

```bash
cd imgPlay
git add src/float-imgplay.css
git commit -m "feat: add recommended CSS styles"
```

---

### Task 4: Write Rollup config

**Files:**
- Create: `imgPlay/rollup.config.js`

- [ ] **Step 1: Write rollup.config.js**

Create `imgPlay/rollup.config.js`:

```js
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

const input = "src/float-imgplay.js";
const name = "FloatImgPlay";

export default [
  // ESM build
  {
    input,
    output: {
      file: "dist/float-imgplay.esm.js",
      format: "es"
    }
  },
  // UMD build
  {
    input,
    output: {
      file: "dist/float-imgplay.umd.js",
      format: "umd",
      name,
      exports: "named"
    }
  },
  // IIFE build (unminified)
  {
    input,
    output: {
      file: "dist/float-imgplay.iife.js",
      format: "iife",
      name,
      exports: "named"
    }
  },
  // IIFE build (minified) + copy CSS
  {
    input,
    output: {
      file: "dist/float-imgplay.iife.min.js",
      format: "iife",
      name,
      exports: "named"
    },
    plugins: [
      terser(),
      copy({
        targets: [
          { src: "src/float-imgplay.css", dest: "dist/" }
        ]
      })
    ]
  }
];
```

- [ ] **Step 2: Commit Rollup config**

```bash
cd imgPlay
git add rollup.config.js
git commit -m "build: add Rollup config for ESM/UMD/IIFE output"
```

---

### Task 5: Install dependencies and build

- [ ] **Step 1: Install dev dependencies**

```bash
cd imgPlay
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 2: Run build**

```bash
cd imgPlay
npm run build
```

Expected output: Four JS files and one CSS file in `dist/`:
- `dist/float-imgplay.esm.js`
- `dist/float-imgplay.umd.js`
- `dist/float-imgplay.iife.js`
- `dist/float-imgplay.iife.min.js`
- `dist/float-imgplay.css`

- [ ] **Step 3: Verify dist outputs exist**

```bash
ls -la imgPlay/dist/
```

Expected: All 5 files present. ESM/UMD/IIFE ~15-25KB unminified, minified ~8-12KB.

- [ ] **Step 4: Verify ESM export**

```bash
head -3 imgPlay/dist/float-imgplay.esm.js
```

Expected: Starts with `/*!` comment or `export class FloatImgPlay`

- [ ] **Step 5: Verify UMD wrapper**

```bash
head -5 imgPlay/dist/float-imgplay.umd.js
```

Expected: UMD factory wrapper with `FloatImgPlay` name

- [ ] **Step 6: Verify IIFE global**

```bash
grep "FloatImgPlay" imgPlay/dist/float-imgplay.iife.js | head -3
```

Expected: `var FloatImgPlay` visible

- [ ] **Step 7: Commit lock file**

```bash
cd imgPlay
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

---

### Task 6: Write example HTML

**Files:**
- Create: `imgPlay/examples/basic.html`

- [ ] **Step 1: Write examples/basic.html**

Create `imgPlay/examples/basic.html` with:
- HTML page with dark theme styling
- Two demo sections: img tag examples and background-image example
- Uses picsum.photos for sample images (seed/sky/320/320, seed/forest/320/320, seed/ocean/320/320)
- Loads `../dist/float-imgplay.css` and `../dist/float-imgplay.iife.js`
- Initializes with `new FloatImgPlay.FloatImgPlay({ selector: '.float-imgplay' }).init()`
- Note: IIFE build wraps exports in a namespace object, so access is `FloatImgPlay.FloatImgPlay`

- [ ] **Step 2: Commit example**

```bash
cd imgPlay
git add examples/basic.html
git commit -m "docs: add basic usage example"
```

---

### Task 7: Write README.md

**Files:**
- Create: `imgPlay/README.md`

- [ ] **Step 1: Write README.md**

Create `imgPlay/README.md` covering:
- Project description (image-to-sound player)
- Install: `npm install float-imgplay`
- CDN usage: unpkg and jsdelivr script tags
- Usage examples: Script tag, ESM import, CommonJS require, background-image
- Full options table with all audio parameters
- Per-element options example
- API methods table: init, destroy, register, unregister, play, stop, pause, refresh
- CSS import instructions
- "How it works" section: pixel scanning -> pitch/duration/velocity mapping -> Web Audio synthesis
- MIT license

- [ ] **Step 2: Commit README**

```bash
cd imgPlay
git add README.md
git commit -m "docs: add README with usage and API docs"
```

---

### Task 8: Final verification

- [ ] **Step 1: Verify npm pack output**

```bash
cd imgPlay
npm pack --dry-run
```

Expected: Lists `dist/`, `README.md`, `LICENSE`. Should NOT include `src/`, `examples/`, `node_modules/`.

- [ ] **Step 2: Verify package.json exports**

```bash
cd imgPlay
node -e "const pkg = require('./package.json'); console.log('main:', pkg.main); console.log('module:', pkg.module); console.log('browser:', pkg.browser);"
```

Expected:
```
main: dist/float-imgplay.umd.js
module: dist/float-imgplay.esm.js
browser: dist/float-imgplay.iife.min.js
```

- [ ] **Step 3: Final commit**

```bash
cd imgPlay
git add -A
git status
git commit -m "chore: finalize float-imgplay v1.0.0 for npm publish"
```
