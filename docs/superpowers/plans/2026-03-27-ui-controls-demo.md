# UI Controls Extension & Demo Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add speed control, settings popup, vertical volume, clickToPlay option, playAll/stopAll API, and rebuild demo with 8 diverse images showing all UI combinations.

**Architecture:** Extend `_buildUI()` in `float-imgplay.js` with three new UI elements (speed slider, settings button, settings popup). Add new options to `_defaults()`. Redesign volume from horizontal to vertical. Update demo page with per-element registration for 8 images.

**Tech Stack:** Vanilla JS (Web Audio API), CSS, HTML. No external dependencies.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/float-imgplay.js` | Modify | New defaults, `_buildUI()` expansion, `_buildSettingsPopup()`, `_bindInstanceEvents()` updates, `playAll()`/`stopAll()`, `clickToPlay` logic |
| `src/float-imgplay.css` | Modify | Vertical volume styles, speed control styles, settings popup styles |
| `docs/index.html` | Modify | 8 demo images, per-element registration, Play All buttons |
| `docs/float-imgplay.iife.js` | Rebuild | Updated build output |
| `examples/basic.html` | Sync | Copy of docs/index.html |

---

### Task 1: Add New Options to Defaults

**Files:**
- Modify: `src/float-imgplay.js:177-234` (`_defaults()` method)
- Modify: `src/float-imgplay.js:196-203` (`classNames` object)

- [ ] **Step 1: Add new default options**

In `src/float-imgplay.js`, in the `_defaults()` method, add the three new options after `showVolumeControl`:

```js
// In _defaults(), after line 184 (showVolumeControl: true,)
showSpeedControl: false,
showSettingsButton: false,
clickToPlay: true,
```

And add new class names to the `classNames` object after `volumeInput`:

```js
// In classNames object, after volumeInput line:
speedWrap: "float-imgplay-speed",
speedInput: "float-imgplay-speed-input",
settingsBtn: "float-imgplay-settings",
settingsPopup: "float-imgplay-settings-popup"
```

- [ ] **Step 2: Verify build passes**

Run: `cd "/Users/jangfolk/Library/CloudStorage/GoogleDrive-jangfolk806@gmail.com/내 드라이브/dev/development/imgPlay" && npx rollup -c`
Expected: All 4 bundles created without errors.

- [ ] **Step 3: Commit**

```bash
git add src/float-imgplay.js
git commit -m "feat: add showSpeedControl, showSettingsButton, clickToPlay defaults"
```

---

### Task 2: Redesign Volume Control to Vertical

**Files:**
- Modify: `src/float-imgplay.js:549-585` (volume section in `_buildUI()`)
- Modify: `src/float-imgplay.css`

- [ ] **Step 1: Update volume rendering in `_buildUI()`**

Replace the entire volume control section (the `if (showVolumeControl)` block at lines 549-585) with vertical orientation:

```js
    let volumeWrap = null;
    let volumeInput = null;
    if (showVolumeControl) {
      volumeWrap = document.createElement("div");
      volumeWrap.className = classNames.volumeWrap;
      Object.assign(volumeWrap.style, {
        position: "absolute",
        right: "6px",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "auto",
        background: "rgba(0,0,0,0.48)",
        color: "#fff",
        padding: "10px 6px",
        borderRadius: "14px",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px"
      });

      volumeInput = document.createElement("input");
      volumeInput.type = "range";
      volumeInput.min = "0";
      volumeInput.max = "1";
      volumeInput.step = "0.01";
      volumeInput.value = String(audio.masterVolume);
      volumeInput.className = classNames.volumeInput;
      volumeInput.setAttribute("orient", "vertical");
      Object.assign(volumeInput.style, {
        writingMode: "vertical-lr",
        direction: "rtl",
        width: "20px",
        height: "70px",
        appearance: "slider-vertical",
        WebkitAppearance: "slider-vertical"
      });

      const label = document.createElement("span");
      label.textContent = "\u{1F50A}";
      label.style.fontSize = "11px";

      volumeWrap.appendChild(volumeInput);
      volumeWrap.appendChild(label);
      uiRoot.appendChild(volumeWrap);
    }
```

- [ ] **Step 2: Add vertical volume CSS**

Append to `src/float-imgplay.css`:

```css
.float-imgplay-volume input[type="range"] {
  writing-mode: vertical-lr;
  direction: rtl;
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
}
```

- [ ] **Step 3: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/float-imgplay.js src/float-imgplay.css
git commit -m "feat: redesign volume control to vertical orientation"
```

---

### Task 3: Add Speed Control

**Files:**
- Modify: `src/float-imgplay.js` (`_buildUI()` method — add after volume section)
- Modify: `src/float-imgplay.js` (`_bindInstanceEvents()` — add speed handler)
- Modify: `src/float-imgplay.js` (`inst.ui` object — add speed refs)
- Modify: `src/float-imgplay.js` (`unregister()` — cleanup speed listener)

- [ ] **Step 1: Add speed control rendering in `_buildUI()`**

In `_buildUI()`, destructure the new option at the top (line 500):

```js
const { classNames, showPlayOverlay, showVolumeControl, showSpeedControl, showSettingsButton, overlayIcon, overlayPlayText, zIndexUI, audio } = inst.opts;
```

After the volume control block and before `el.classList.add(classNames.initialized)`, add:

```js
    let speedWrap = null;
    let speedInput = null;
    let speedLabel = null;
    if (showSpeedControl) {
      speedWrap = document.createElement("div");
      speedWrap.className = classNames.speedWrap;
      Object.assign(speedWrap.style, {
        position: "absolute",
        left: "8px",
        bottom: "8px",
        pointerEvents: "auto",
        background: "rgba(0,0,0,0.48)",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "14px",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px"
      });

      const slowIcon = document.createElement("span");
      slowIcon.textContent = "\u{1F422}";
      slowIcon.style.fontSize = "10px";

      speedInput = document.createElement("input");
      speedInput.type = "range";
      speedInput.min = "40";
      speedInput.max = "240";
      speedInput.step = "1";
      speedInput.value = String(audio.tempo);
      speedInput.className = classNames.speedInput;
      speedInput.style.width = "70px";

      const fastIcon = document.createElement("span");
      fastIcon.textContent = "\u{1F407}";
      fastIcon.style.fontSize = "10px";

      speedLabel = document.createElement("span");
      speedLabel.textContent = audio.tempo + "";
      speedLabel.style.minWidth = "28px";
      speedLabel.style.textAlign = "center";
      speedLabel.style.fontWeight = "600";

      speedWrap.appendChild(slowIcon);
      speedWrap.appendChild(speedInput);
      speedWrap.appendChild(fastIcon);
      speedWrap.appendChild(speedLabel);
      uiRoot.appendChild(speedWrap);
    }
```

- [ ] **Step 2: Update `inst.ui` object**

Update the `inst.ui` assignment (currently at end of `_buildUI`) to include speed refs:

```js
    inst.ui = { root: uiRoot, playBtn, volumeWrap, volumeInput, speedWrap, speedInput, speedLabel };
```

- [ ] **Step 3: Add speed event handler in `_bindInstanceEvents()`**

After the `inst._onVolumeInput` handler (line 640), add:

```js
    inst._onSpeedInput = (e) => {
      const bpm = Number(e.target.value);
      inst.opts.audio.tempo = bpm;
      if (inst.ui?.speedLabel) inst.ui.speedLabel.textContent = bpm + "";
      if (inst.isPlaying) {
        this._stopInstance(inst);
        inst.currentScore = null;
        this._prepareAnalysis(inst);
        this._playInstance(inst);
      }
    };
```

After the volume event listener line (643), add:

```js
    if (inst.ui?.speedInput) inst.ui.speedInput.addEventListener("input", inst._onSpeedInput);
```

- [ ] **Step 4: Update `_onElClick` to ignore speed control clicks**

In `_bindInstanceEvents()`, update the `_onElClick` handler to also ignore speed wrap clicks. Replace the existing check:

```js
    inst._onElClick = (e) => {
      if (inst.ui?.volumeInput && (e.target === inst.ui.volumeInput || inst.ui.volumeWrap?.contains(e.target))) {
        return;
      }
      if (inst.ui?.speedInput && (e.target === inst.ui.speedInput || inst.ui.speedWrap?.contains(e.target))) {
        return;
      }
      if (!inst.ui?.playBtn) {
        if (inst.isPlaying) this._stopInstance(inst);
        else this._playInstance(inst);
      }
    };
```

- [ ] **Step 5: Update `unregister()` for speed cleanup**

In `unregister()` (around line 119-120), add speed cleanup:

```js
    if (inst.ui?.speedInput) inst.ui.speedInput.removeEventListener("input", inst._onSpeedInput);
```

- [ ] **Step 6: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/float-imgplay.js
git commit -m "feat: add speed control slider (tempo, bottom-left)"
```

---

### Task 4: Add clickToPlay Option

**Files:**
- Modify: `src/float-imgplay.js` (`_bindInstanceEvents()` — `_onElClick` handler)

- [ ] **Step 1: Add clickToPlay guard**

In `_bindInstanceEvents()`, update the `_onElClick` handler to check `clickToPlay`. The handler should now be:

```js
    inst._onElClick = (e) => {
      if (inst.ui?.volumeInput && (e.target === inst.ui.volumeInput || inst.ui.volumeWrap?.contains(e.target))) {
        return;
      }
      if (inst.ui?.speedInput && (e.target === inst.ui.speedInput || inst.ui.speedWrap?.contains(e.target))) {
        return;
      }
      if (inst.opts.clickToPlay === false) {
        return;
      }
      if (!inst.ui?.playBtn) {
        if (inst.isPlaying) this._stopInstance(inst);
        else this._playInstance(inst);
      }
    };
```

- [ ] **Step 2: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/float-imgplay.js
git commit -m "feat: add clickToPlay option to disable image click playback"
```

---

### Task 5: Add playAll() and stopAll() API Methods

**Files:**
- Modify: `src/float-imgplay.js` (add after `pause()` method, around line 144)

- [ ] **Step 1: Add playAll() and stopAll()**

After the `pause(target)` method (line 144), add:

```js
  playAll() {
    this.instances.forEach((inst) => {
      this._playInstance(inst);
    });
    return this;
  }

  stopAll() {
    this.instances.forEach((inst) => {
      this._stopInstance(inst);
    });
    return this;
  }
```

- [ ] **Step 2: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/float-imgplay.js
git commit -m "feat: add playAll() and stopAll() API methods"
```

---

### Task 6: Add Settings Button and Popup

This is the largest task. The settings button (gear icon) opens an overlay popup on the image with instrument/ensemble selection and advanced audio options.

**Files:**
- Modify: `src/float-imgplay.js` — Add settings button in `_buildUI()`, add `_buildSettingsPopup()` method, add `_applySettingsToInstance()` method, update event bindings and cleanup

- [ ] **Step 1: Add settings button rendering in `_buildUI()`**

After the speed control block (before `el.classList.add(classNames.initialized)`), add:

```js
    let settingsBtn = null;
    if (showSettingsButton) {
      settingsBtn = document.createElement("button");
      settingsBtn.type = "button";
      settingsBtn.className = classNames.settingsBtn;
      settingsBtn.setAttribute("aria-label", "Settings");
      settingsBtn.textContent = "\u2699";
      Object.assign(settingsBtn.style, {
        position: "absolute",
        top: "8px",
        right: showVolumeControl ? "36px" : "8px",
        pointerEvents: "auto",
        border: "0",
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        fontSize: "16px",
        lineHeight: "1",
        background: "rgba(0,0,0,0.55)",
        color: "#fff",
        backdropFilter: "blur(10px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      });
      uiRoot.appendChild(settingsBtn);
    }
```

- [ ] **Step 2: Update `inst.ui` to include settings refs**

```js
    inst.ui = { root: uiRoot, playBtn, volumeWrap, volumeInput, speedWrap, speedInput, speedLabel, settingsBtn, settingsPopup: null };
```

- [ ] **Step 3: Add `_buildSettingsPopup()` method**

After `_setPauseBtnContent()` (around line 612), add the full popup builder method:

```js
  _buildSettingsPopup(inst) {
    const popup = document.createElement("div");
    popup.className = inst.opts.classNames.settingsPopup;
    Object.assign(popup.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "auto",
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(12px)",
      color: "#fff",
      zIndex: String(inst.opts.zIndexUI + 10),
      overflowY: "auto",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "11px"
    });

    // Header
    const header = document.createElement("div");
    Object.assign(header.style, { display: "flex", justifyContent: "space-between", alignItems: "center" });
    const title = document.createElement("span");
    title.textContent = "Settings";
    title.style.fontWeight = "700";
    title.style.fontSize = "13px";
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "\u2715";
    Object.assign(closeBtn.style, {
      border: "0", background: "rgba(255,255,255,0.15)", color: "#fff",
      borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer",
      fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center"
    });
    header.appendChild(title);
    header.appendChild(closeBtn);
    popup.appendChild(header);

    // Instrument section
    const instSection = document.createElement("div");
    const instTitle = document.createElement("div");
    instTitle.textContent = "Instruments";
    instTitle.style.fontWeight = "600";
    instTitle.style.marginBottom = "4px";
    instSection.appendChild(instTitle);

    const instGrid = document.createElement("div");
    Object.assign(instGrid.style, {
      display: "flex", flexWrap: "wrap", gap: "4px"
    });

    const instrumentNames = Object.keys(INSTRUMENT_PRESETS);
    const allInstNames = ["none"].concat(instrumentNames);
    const instBtns = {};

    allInstNames.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = name === "none" ? "Default" : INSTRUMENT_PRESETS[name].name;
      Object.assign(btn.style, {
        border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)",
        color: "#fff", borderRadius: "12px", padding: "3px 8px", cursor: "pointer",
        fontSize: "10px", transition: "all 0.15s"
      });
      instBtns[name] = btn;
      instGrid.appendChild(btn);
    });
    instSection.appendChild(instGrid);
    popup.appendChild(instSection);

    // Ensemble section
    const ensSection = document.createElement("div");
    const ensTitle = document.createElement("div");
    ensTitle.textContent = "Ensembles";
    ensTitle.style.fontWeight = "600";
    ensTitle.style.marginBottom = "4px";
    ensSection.appendChild(ensTitle);

    const ensGrid = document.createElement("div");
    Object.assign(ensGrid.style, {
      display: "flex", flexWrap: "wrap", gap: "4px"
    });

    const ensembleNames = Object.keys(ENSEMBLE_PRESETS);
    const ensBtns = {};

    ensembleNames.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = ENSEMBLE_PRESETS[name].name;
      Object.assign(btn.style, {
        border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)",
        color: "#fff", borderRadius: "12px", padding: "3px 8px", cursor: "pointer",
        fontSize: "10px", transition: "all 0.15s"
      });
      ensBtns[name] = btn;
      ensGrid.appendChild(btn);
    });
    ensSection.appendChild(ensGrid);
    popup.appendChild(ensSection);

    // Advanced toggle
    const advToggle = document.createElement("button");
    advToggle.type = "button";
    advToggle.textContent = "\u25B8 Advanced";
    Object.assign(advToggle.style, {
      border: "0", background: "none", color: "#aaa", cursor: "pointer",
      fontSize: "11px", textAlign: "left", padding: "4px 0", fontWeight: "600"
    });

    const advPanel = document.createElement("div");
    advPanel.style.display = "none";

    // Advanced option rows
    const advOpts = [
      { key: "waveform", label: "Waveform", type: "select", options: ["sine", "square", "sawtooth", "triangle"] },
      { key: "tempo", label: "Tempo", type: "range", min: 40, max: 240, step: 1 },
      { key: "masterVolume", label: "Volume", type: "range", min: 0, max: 1, step: 0.01 },
      { key: "scaleMode", label: "Scale", type: "select", options: ["auto", "major", "minor", "pentatonic"] },
      { key: "rootMode", label: "Root", type: "select", options: ["filename-first-char", "fixed"] },
      { key: "fixedRootMidi", label: "Root MIDI", type: "range", min: 36, max: 84, step: 1 },
      { key: "pitchShiftSemitones", label: "Pitch Shift", type: "range", min: -24, max: 24, step: 1 },
      { key: "filterType", label: "Filter", type: "select", options: ["lowpass", "highpass", "bandpass", "notch", "allpass"] },
      { key: "filterBaseHz", label: "Filter Hz", type: "range", min: 100, max: 8000, step: 50 },
      { key: "filterVelocityAmount", label: "Filter Vel", type: "range", min: 0, max: 8000, step: 100 },
      { key: "attack", label: "Attack", type: "range", min: 0.001, max: 0.5, step: 0.001 },
      { key: "release", label: "Release", type: "range", min: 0.001, max: 0.5, step: 0.001 },
      { key: "noteDurationBeats", label: "Duration", type: "range", min: 0.1, max: 2, step: 0.1 },
      { key: "sampleColumns", label: "Columns", type: "range", min: 4, max: 64, step: 1 },
      { key: "restThreshold", label: "Rest Thr", type: "range", min: 0, max: 128, step: 1 },
      { key: "brightDuration", label: "Bright Dur", type: "range", min: 0.05, max: 1, step: 0.01 },
      { key: "blueDuration", label: "Blue Dur", type: "range", min: 0.05, max: 1, step: 0.01 },
      { key: "neutralDuration", label: "Neutral Dur", type: "range", min: 0.05, max: 1, step: 0.01 }
    ];

    const advInputs = {};

    advOpts.forEach((opt) => {
      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "flex", alignItems: "center", gap: "6px", padding: "2px 0"
      });
      const lbl = document.createElement("label");
      lbl.textContent = opt.label;
      Object.assign(lbl.style, { minWidth: "70px", fontSize: "10px", color: "#aaa" });
      row.appendChild(lbl);

      if (opt.type === "range") {
        const input = document.createElement("input");
        input.type = "range";
        input.min = String(opt.min);
        input.max = String(opt.max);
        input.step = String(opt.step);
        input.value = String(inst.opts.audio[opt.key]);
        input.style.flex = "1";
        const val = document.createElement("span");
        val.textContent = inst.opts.audio[opt.key];
        val.style.minWidth = "36px";
        val.style.textAlign = "right";
        val.style.fontSize = "10px";
        val.style.color = "#6c5ce7";
        input.addEventListener("input", () => { val.textContent = input.value; });
        row.appendChild(input);
        row.appendChild(val);
        advInputs[opt.key] = input;
      } else if (opt.type === "select") {
        const sel = document.createElement("select");
        Object.assign(sel.style, {
          flex: "1", background: "#252542", border: "1px solid #3a3a5a",
          color: "#fff", padding: "2px 4px", borderRadius: "4px", fontSize: "10px"
        });
        opt.options.forEach((o) => {
          const optEl = document.createElement("option");
          optEl.value = o;
          optEl.textContent = o;
          if (inst.opts.audio[opt.key] === o) optEl.selected = true;
          sel.appendChild(optEl);
        });
        row.appendChild(sel);
        advInputs[opt.key] = sel;
      }

      advPanel.appendChild(row);
    });

    popup.appendChild(advToggle);
    popup.appendChild(advPanel);

    // Buttons row
    const btnRow = document.createElement("div");
    Object.assign(btnRow.style, {
      display: "flex", gap: "6px", justifyContent: "center", marginTop: "4px"
    });
    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.textContent = "Apply";
    Object.assign(applyBtn.style, {
      border: "0", background: "#6c5ce7", color: "#fff",
      borderRadius: "8px", padding: "6px 16px", cursor: "pointer",
      fontSize: "11px", fontWeight: "600"
    });
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.textContent = "Reset";
    Object.assign(resetBtn.style, {
      border: "0", background: "rgba(255,255,255,0.15)", color: "#ccc",
      borderRadius: "8px", padding: "6px 16px", cursor: "pointer",
      fontSize: "11px", fontWeight: "600"
    });
    btnRow.appendChild(applyBtn);
    btnRow.appendChild(resetBtn);
    popup.appendChild(btnRow);

    // --- Event Wiring ---
    let selectedInstrument = null;
    let selectedEnsemble = null;

    const highlightActive = () => {
      allInstNames.forEach((n) => {
        instBtns[n].style.background = (n === selectedInstrument || (n === "none" && !selectedInstrument && !selectedEnsemble))
          ? "rgba(108,92,231,0.5)" : "rgba(255,255,255,0.08)";
        instBtns[n].style.borderColor = (n === selectedInstrument || (n === "none" && !selectedInstrument && !selectedEnsemble))
          ? "#6c5ce7" : "rgba(255,255,255,0.2)";
      });
      ensembleNames.forEach((n) => {
        ensBtns[n].style.background = (n === selectedEnsemble) ? "rgba(108,92,231,0.5)" : "rgba(255,255,255,0.08)";
        ensBtns[n].style.borderColor = (n === selectedEnsemble) ? "#6c5ce7" : "rgba(255,255,255,0.2)";
      });
    };

    allInstNames.forEach((name) => {
      instBtns[name].addEventListener("click", () => {
        selectedEnsemble = null;
        selectedInstrument = (name === "none") ? null : name;
        highlightActive();
      });
    });

    ensembleNames.forEach((name) => {
      ensBtns[name].addEventListener("click", () => {
        selectedInstrument = null;
        selectedEnsemble = name;
        highlightActive();
      });
    });

    advToggle.addEventListener("click", () => {
      const open = advPanel.style.display !== "none";
      advPanel.style.display = open ? "none" : "block";
      advToggle.textContent = (open ? "\u25B8" : "\u25BE") + " Advanced";
    });

    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });

    applyBtn.addEventListener("click", () => {
      this._applySettingsToInstance(inst, selectedInstrument, selectedEnsemble, advInputs);
      popup.style.display = "none";
    });

    resetBtn.addEventListener("click", () => {
      selectedInstrument = null;
      selectedEnsemble = null;
      const defaults = this._defaults().audio;
      Object.keys(advInputs).forEach((key) => {
        const input = advInputs[key];
        if (defaults[key] !== undefined) {
          input.value = String(defaults[key]);
          if (input.type === "range") {
            input.dispatchEvent(new Event("input"));
          }
        }
      });
      highlightActive();
    });

    highlightActive();
    popup.style.display = "none";
    return popup;
  }
```

- [ ] **Step 4: Add `_applySettingsToInstance()` method**

After `_buildSettingsPopup()`, add:

```js
  _applySettingsToInstance(inst, instrumentName, ensembleName, advInputs) {
    // Read advanced values
    Object.keys(advInputs).forEach((key) => {
      const el = advInputs[key];
      const val = el.value;
      if (el.type === "range") {
        inst.opts.audio[key] = Number(val);
      } else {
        inst.opts.audio[key] = val;
      }
    });

    // Resolve instrument/ensemble
    if (ensembleName) {
      try {
        inst.opts.audio._instruments = resolveEnsemble(ensembleName);
      } catch { inst.opts.audio._instruments = null; }
    } else if (instrumentName) {
      try {
        inst.opts.audio._instruments = [resolveInstrument(instrumentName)];
      } catch { inst.opts.audio._instruments = null; }
    } else {
      inst.opts.audio._instruments = null;
    }

    // Re-analyze and replay
    this._stopInstance(inst);
    inst.currentScore = null;
    inst.currentMeta = null;
    this._prepareAnalysis(inst);

    // Update speed label if present
    if (inst.ui?.speedInput) {
      inst.ui.speedInput.value = String(inst.opts.audio.tempo);
      if (inst.ui.speedLabel) inst.ui.speedLabel.textContent = inst.opts.audio.tempo + "";
    }
    // Update volume slider if present
    if (inst.ui?.volumeInput) {
      inst.ui.volumeInput.value = String(inst.opts.audio.masterVolume);
    }
  }
```

- [ ] **Step 5: Wire settings button in `_buildUI()` and `_bindInstanceEvents()`**

In `_buildUI()`, after creating `settingsBtn` and before `el.classList.add(classNames.initialized)`, add popup construction:

```js
    let settingsPopupEl = null;
    if (showSettingsButton) {
      settingsPopupEl = this._buildSettingsPopup(inst);
      uiRoot.appendChild(settingsPopupEl);
    }
```

Update `inst.ui` assignment to include `settingsPopup`:

```js
    inst.ui = { root: uiRoot, playBtn, volumeWrap, volumeInput, speedWrap, speedInput, speedLabel, settingsBtn, settingsPopup: settingsPopupEl };
```

In `_bindInstanceEvents()`, add settings button click handler after speed input listener:

```js
    if (inst.ui?.settingsBtn) {
      inst._onSettingsClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inst.ui.settingsPopup) {
          inst.ui.settingsPopup.style.display = inst.ui.settingsPopup.style.display === "none" ? "flex" : "none";
        }
      };
      inst.ui.settingsBtn.addEventListener("click", inst._onSettingsClick);
    }
```

Also update `_onElClick` to ignore settings popup and button clicks:

```js
      if (inst.ui?.settingsBtn && (e.target === inst.ui.settingsBtn || inst.ui.settingsPopup?.contains(e.target))) {
        return;
      }
```

- [ ] **Step 6: Update `unregister()` for settings cleanup**

In `unregister()`, add:

```js
    if (inst.ui?.settingsBtn) inst.ui.settingsBtn.removeEventListener("click", inst._onSettingsClick);
```

- [ ] **Step 7: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/float-imgplay.js
git commit -m "feat: add settings button with instrument/ensemble/advanced popup"
```

---

### Task 7: Add Settings Popup CSS

**Files:**
- Modify: `src/float-imgplay.css`

- [ ] **Step 1: Add settings popup CSS**

Append to `src/float-imgplay.css`:

```css
.float-imgplay-settings-popup {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.float-imgplay-settings-popup::-webkit-scrollbar {
  width: 4px;
}

.float-imgplay-settings-popup::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

.float-imgplay-speed input[type="range"],
.float-imgplay-settings-popup input[type="range"] {
  accent-color: #6c5ce7;
}
```

- [ ] **Step 2: Build and verify**

Run: `npx rollup -c`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/float-imgplay.css
git commit -m "style: add settings popup and speed control CSS"
```

---

### Task 8: Rebuild Demo Page with 8 Images

**Files:**
- Modify: `docs/index.html` — Replace Live Demo section HTML (images grid, per-element JS)

- [ ] **Step 1: Replace Live Demo HTML section**

In `docs/index.html`, replace the Live Demo section (the `<div class="section">` containing `<h2>Live Demo` and the `<div class="grid" id="demo-grid">`) with:

```html
    <!-- ============ LIVE DEMO ============ -->
    <div class="section">
      <h2>Live Demo <span>8 images with different UI control combinations</span></h2>
      <div class="btn-row" style="margin-bottom: 16px;">
        <button class="btn btn-primary" id="btn-play-all">Play All</button>
        <button class="btn btn-danger" id="btn-stop-all-demo">Stop All</button>
      </div>
      <div class="grid" id="demo-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        <div>
          <div class="float-imgplay" id="demo-1">
            <img src="https://picsum.photos/seed/clouds/160/160" alt="Clouds" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">All Controls</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-2">
            <img src="https://picsum.photos/seed/volcano/160/160" alt="Volcano" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">No Controls (disabled)</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-3">
            <img src="https://picsum.photos/seed/landscape/160/160" alt="Landscape" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Play Only</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-4">
            <img src="https://picsum.photos/seed/portrait/160/160" alt="Portrait" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Volume Only</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-5">
            <img src="https://picsum.photos/seed/city/160/160" alt="City" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Speed Only</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-6">
            <img src="https://picsum.photos/seed/galaxy/160/160" alt="Galaxy" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Play + Volume</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-7">
            <img src="https://picsum.photos/seed/food/160/160" alt="Food" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Play + Speed</div>
        </div>
        <div>
          <div class="float-imgplay" id="demo-8">
            <img src="https://picsum.photos/seed/abstract/160/160" alt="Abstract" width="160" height="160">
          </div>
          <div style="text-align:center; font-size:10px; color:#666; margin-top:4px;">Speed + Volume</div>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Update demo JS — `initPlayer()` with per-element registration**

Replace the `initPlayer()` function and its call at the bottom of the script with:

```js
    function initPlayer() {
      if (player) {
        player.destroy();
        document.querySelectorAll('.float-imgplay .float-imgplay-ui').forEach(function(el) {
          el.parentNode.removeChild(el);
        });
        document.querySelectorAll('.float-imgplay').forEach(function(el) {
          el.classList.remove('float-imgplay--ready', 'float-imgplay--playing', 'float-imgplay--paused');
        });
      }

      var opts = getOptionsFromUI();

      // Add instrument/ensemble selection
      if (currentEnsemble) {
        opts.ensemble = currentEnsemble;
      } else if (currentInstrument) {
        opts.instruments = [{ preset: currentInstrument }];
      }

      // Global defaults: all controls OFF (per-element overrides below)
      opts.showPlayOverlay = false;
      opts.showVolumeControl = false;
      opts.showSpeedControl = false;
      opts.showSettingsButton = false;

      player = new FloatImgPlay.FloatImgPlay(opts);

      // Register demo images with individual UI combos
      var demoConfigs = [
        { id: 'demo-1', showPlayOverlay: true, showVolumeControl: true, showSpeedControl: true, showSettingsButton: true },
        { id: 'demo-2', showPlayOverlay: false, showVolumeControl: false, showSpeedControl: false, showSettingsButton: false, clickToPlay: false },
        { id: 'demo-3', showPlayOverlay: true, showVolumeControl: false, showSpeedControl: false, showSettingsButton: false },
        { id: 'demo-4', showPlayOverlay: false, showVolumeControl: true, showSpeedControl: false, showSettingsButton: false },
        { id: 'demo-5', showPlayOverlay: false, showVolumeControl: false, showSpeedControl: true, showSettingsButton: false },
        { id: 'demo-6', showPlayOverlay: true, showVolumeControl: true, showSpeedControl: false, showSettingsButton: false },
        { id: 'demo-7', showPlayOverlay: true, showVolumeControl: false, showSpeedControl: true, showSettingsButton: false },
        { id: 'demo-8', showPlayOverlay: false, showVolumeControl: true, showSpeedControl: true, showSettingsButton: false }
      ];

      demoConfigs.forEach(function(cfg) {
        var el = document.getElementById(cfg.id);
        if (el) {
          var perOpts = {};
          Object.keys(cfg).forEach(function(k) {
            if (k !== 'id') perOpts[k] = cfg[k];
          });
          player.register(el, perOpts);
        }
      });

      // Register uploaded images (from upload zone) with default UI
      document.querySelectorAll('#upload-grid .float-imgplay').forEach(function(el) {
        player.register(el);
      });

      player.init = function() { return player; }; // prevent double-init
      updateGeneratedCode();
    }
```

- [ ] **Step 3: Add Play All / Stop All button handlers**

After the `btn-stop-all` listener (around the existing stop all handler), add:

```js
    document.getElementById('btn-play-all').addEventListener('click', function() {
      if (player) player.playAll();
    });
    document.getElementById('btn-stop-all-demo').addEventListener('click', function() {
      if (player) player.stopAll();
    });
```

- [ ] **Step 4: Update API demo buttons to target demo-1 instead of demo-sky**

Replace all occurrences of `'demo-sky'` with `'demo-1'` in the API button handlers:

```js
    document.getElementById('api-play-first').addEventListener('click', function() {
      if (player) player.play(document.getElementById('demo-1'));
    });
    document.getElementById('api-stop-first').addEventListener('click', function() {
      if (player) player.stop(document.getElementById('demo-1'));
    });
```

Also update MIDI export handler:

```js
    document.getElementById('api-midi-export').addEventListener('click', function() {
      if (!player) return;
      var inst = player.instances.get(document.getElementById('demo-1'));
      // ... rest unchanged
    });
```

- [ ] **Step 5: Fix `initPlayer()` — don't use `player.init()` for per-element registration**

The demo now manually calls `player.register()` for each demo element instead of `player.init()` scanning by selector. Update `initPlayer()` so it does NOT call `player.init()` (since we register manually). The player constructor is called, then we register elements individually.

Replace:
```js
      player = new FloatImgPlay.FloatImgPlay(opts);
```

With:
```js
      // Don't set selector — we register manually
      delete opts.selector;
      player = new FloatImgPlay.FloatImgPlay(opts);
      // Bind global events (visibility, unlock, etc.)
      player._bindGlobalUnlock();
      document.addEventListener("visibilitychange", player._boundOnVisibilityChange, { passive: true });
      window.addEventListener("scroll", player._boundTick, { passive: true });
      window.addEventListener("resize", player._boundTick, { passive: true });
```

Actually, simpler approach — keep using `init()` but set selector to a non-matching class, then register manually:

```js
      opts.selector = '.float-imgplay-none'; // nothing matches
      player = new FloatImgPlay.FloatImgPlay(opts);
      player.init(); // binds global events, no elements found
```

Then register demo elements after `init()`.

- [ ] **Step 6: Build, copy IIFE, sync examples**

```bash
npx rollup -c
cp dist/float-imgplay.iife.js docs/float-imgplay.iife.js
cp docs/index.html examples/basic.html
```

- [ ] **Step 7: Commit**

```bash
git add docs/index.html docs/float-imgplay.iife.js examples/basic.html
git commit -m "feat: rebuild demo with 8 images and per-element UI combos"
```

---

### Task 9: Final Build and Push

**Files:**
- All modified files

- [ ] **Step 1: Full build**

```bash
cd "/Users/jangfolk/Library/CloudStorage/GoogleDrive-jangfolk806@gmail.com/내 드라이브/dev/development/imgPlay"
npx rollup -c
cp dist/float-imgplay.iife.js docs/float-imgplay.iife.js
cp docs/index.html examples/basic.html
```

- [ ] **Step 2: Test locally by opening docs/index.html in browser**

Verify:
- 8 images render at 160x160
- Image 1 shows all 4 controls (play, vertical volume, speed, settings gear)
- Image 2 shows no controls and click does nothing
- Image 3-8 show correct UI combinations
- Settings popup opens/closes, instrument/ensemble selection works
- Play All / Stop All buttons work
- Volume slider is vertical on right edge
- Speed slider shows BPM at bottom-left

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: complete UI controls extension and demo renewal

- Vertical volume slider (right edge)
- Speed control slider (bottom-left, 40-240 BPM)
- Settings popup (instruments, ensembles, advanced options)
- clickToPlay option
- playAll()/stopAll() API methods
- 8 demo images with different UI combinations
- Play All / Stop All buttons"

git push origin main
```
