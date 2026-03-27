# Phase 2: Meta Parser Implementation Plan

**Goal:** Implement MetaParser to extract imgplay metadata from PNG tEXt chunks, EXIF UserComment, and sidecar JSON files. Activate Mode Router real branching.

---

### Task 1: Implement PNG tEXt chunk parser
- Parse PNG binary for tEXt chunks with key "imgplay"
- Fetch image as ArrayBuffer, scan for tEXt signature

### Task 2: Implement EXIF UserComment parser
- Parse EXIF data for UserComment field containing imgplay JSON

### Task 3: Implement sidecar JSON fetcher
- Fetch `<image-url>.imgplay.json`, parse if exists

### Task 4: Wire MetaParser into Core
- MetaParser.parse returns real meta
- Mode Router uses meta to select engine

### Task 5: Build and verify
