/**
 * MetaParser — extracts imgplay metadata from images.
 *
 * Supported sources (checked in order):
 * 1. PNG tEXt chunk with key "imgplay"
 * 2. EXIF UserComment containing imgplay JSON
 * 3. Sidecar JSON file at <image-url>.imgplay.json
 *
 * All methods are async because they may fetch data.
 * Static `parse(source)` returns synchronous empty meta (for init),
 * while `parseAsync(source)` does the full extraction.
 */

const EMPTY_META = Object.freeze({ midi: null, audio: null, engine: null });

export class MetaParser {
  /**
   * Synchronous parse — returns empty meta.
   * Used during initial registration before async parse completes.
   */
  static parse(source) {
    return { midi: null, audio: null, engine: null };
  }

  /**
   * Full async parse — tries all sources in order.
   * Returns first valid imgplay meta found, or empty meta.
   */
  static async parseAsync(source) {
    if (!source || !source.url) return { ...EMPTY_META };

    try {
      // 1. Try PNG tEXt chunk
      const pngMeta = await MetaParser._parsePngText(source.url);
      if (pngMeta) return pngMeta;
    } catch {}

    try {
      // 2. Try EXIF UserComment
      const exifMeta = await MetaParser._parseExif(source.url);
      if (exifMeta) return exifMeta;
    } catch {}

    try {
      // 3. Try sidecar JSON
      const sidecarMeta = await MetaParser._parseSidecar(source.url);
      if (sidecarMeta) return sidecarMeta;
    } catch {}

    return { ...EMPTY_META };
  }

  /**
   * Parse PNG tEXt chunks for key "imgplay".
   * PNG tEXt chunk format: keyword (null-terminated) + text data
   */
  static async _parsePngText(url) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;

    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);

    // Verify PNG signature: 137 80 78 71 13 10 26 10
    if (bytes.length < 8 ||
        bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) {
      return null;
    }

    let offset = 8; // skip PNG signature

    while (offset + 12 <= bytes.length) {
      const chunkLen = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                       (bytes[offset + 2] << 8) | bytes[offset + 3];
      const chunkType = String.fromCharCode(
        bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]
      );

      if (chunkType === "tEXt" && chunkLen > 0) {
        const dataStart = offset + 8;
        const dataEnd = dataStart + chunkLen;
        if (dataEnd <= bytes.length) {
          const chunkData = bytes.slice(dataStart, dataEnd);
          // Find null separator between keyword and text
          const nullIdx = chunkData.indexOf(0);
          if (nullIdx > 0) {
            const keyword = MetaParser._bytesToString(chunkData.slice(0, nullIdx));
            if (keyword === "imgplay") {
              const textData = MetaParser._bytesToString(chunkData.slice(nullIdx + 1));
              return MetaParser._parseJsonMeta(textData);
            }
          }
        }
      }

      // Also check iTXt (international text) chunks
      if (chunkType === "iTXt" && chunkLen > 0) {
        const dataStart = offset + 8;
        const dataEnd = dataStart + chunkLen;
        if (dataEnd <= bytes.length) {
          const chunkData = bytes.slice(dataStart, dataEnd);
          const nullIdx = chunkData.indexOf(0);
          if (nullIdx > 0) {
            const keyword = MetaParser._bytesToString(chunkData.slice(0, nullIdx));
            if (keyword === "imgplay") {
              // iTXt: keyword \0 compression_flag \0 compression_method \0 lang \0 translated \0 text
              let pos = nullIdx + 1;
              // Skip compression flag, method
              pos = chunkData.indexOf(0, pos) + 1; // skip after compression
              if (pos === 0) pos = nullIdx + 3;
              // Skip language tag
              pos = chunkData.indexOf(0, pos) + 1;
              if (pos === 0) return null;
              // Skip translated keyword
              pos = chunkData.indexOf(0, pos) + 1;
              if (pos === 0) return null;
              const textData = MetaParser._bytesToString(chunkData.slice(pos));
              return MetaParser._parseJsonMeta(textData);
            }
          }
        }
      }

      if (chunkType === "IEND") break;

      // Move to next chunk: 4(length) + 4(type) + chunkLen(data) + 4(CRC)
      offset += 12 + chunkLen;
    }

    return null;
  }

  /**
   * Parse EXIF data for UserComment containing imgplay JSON.
   * Looks for JPEG APP1 EXIF marker or TIFF-in-PNG.
   */
  static async _parseExif(url) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;

    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);

    // JPEG check: starts with 0xFF 0xD8
    if (bytes.length < 4) return null;

    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      return MetaParser._parseJpegExif(bytes);
    }

    return null;
  }

  /**
   * Parse JPEG EXIF for UserComment tag (0x9286).
   */
  static _parseJpegExif(bytes) {
    let offset = 2;

    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 0xFF) break;

      const marker = bytes[offset + 1];
      // APP1 = 0xE1 (EXIF)
      if (marker === 0xE1) {
        const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
        const segStart = offset + 4;
        const segEnd = offset + 2 + segLen;

        // Check "Exif\0\0" header
        if (segEnd <= bytes.length &&
            bytes[segStart] === 0x45 && bytes[segStart + 1] === 0x78 &&
            bytes[segStart + 2] === 0x69 && bytes[segStart + 3] === 0x66 &&
            bytes[segStart + 4] === 0x00 && bytes[segStart + 5] === 0x00) {

          const tiffStart = segStart + 6;
          return MetaParser._parseTiffForUserComment(bytes, tiffStart, segEnd);
        }
      }

      // Skip non-APP1 segments
      if (marker === 0xDA) break; // Start of scan = end of metadata
      const len = (bytes[offset + 2] << 8) | bytes[offset + 3];
      offset += 2 + len;
    }

    return null;
  }

  /**
   * Scan TIFF IFD entries for UserComment tag (0x9286).
   */
  static _parseTiffForUserComment(bytes, tiffStart, maxEnd) {
    if (tiffStart + 8 > maxEnd) return null;

    const isLE = bytes[tiffStart] === 0x49 && bytes[tiffStart + 1] === 0x49;

    const read16 = (off) => {
      const a = tiffStart + off;
      if (a + 2 > maxEnd) return 0;
      return isLE
        ? bytes[a] | (bytes[a + 1] << 8)
        : (bytes[a] << 8) | bytes[a + 1];
    };

    const read32 = (off) => {
      const a = tiffStart + off;
      if (a + 4 > maxEnd) return 0;
      return isLE
        ? bytes[a] | (bytes[a + 1] << 8) | (bytes[a + 2] << 16) | (bytes[a + 3] << 24)
        : (bytes[a] << 24) | (bytes[a + 1] << 16) | (bytes[a + 2] << 8) | bytes[a + 3];
    };

    const scanIFD = (ifdOffset) => {
      if (ifdOffset + 2 > maxEnd - tiffStart) return null;
      const count = read16(ifdOffset);

      for (let i = 0; i < count; i++) {
        const entryOff = ifdOffset + 2 + i * 12;
        if (entryOff + 12 > maxEnd - tiffStart) break;

        const tag = read16(entryOff);
        const type = read16(entryOff + 2);
        const numValues = read32(entryOff + 4);
        const valueOff = read32(entryOff + 8);

        // UserComment = 0x9286
        if (tag === 0x9286 && numValues > 8) {
          const dataOff = tiffStart + valueOff;
          if (dataOff + numValues <= maxEnd) {
            // UserComment starts with 8-byte encoding prefix
            const textBytes = bytes.slice(dataOff + 8, dataOff + numValues);
            const text = MetaParser._bytesToString(textBytes).trim().replace(/\0+$/, "");
            const meta = MetaParser._parseJsonMeta(text);
            if (meta) return meta;
          }
        }

        // ExifIFD pointer = 0x8769
        if (tag === 0x8769) {
          const subResult = scanIFD(valueOff);
          if (subResult) return subResult;
        }
      }

      return null;
    };

    const firstIFDOffset = read32(4);
    return scanIFD(firstIFDOffset);
  }

  /**
   * Fetch sidecar JSON: <image-url>.imgplay.json
   */
  static async _parseSidecar(url) {
    const sidecarUrl = url + ".imgplay.json";
    const res = await fetch(sidecarUrl, { mode: "cors" });
    if (!res.ok) return null;

    const text = await res.text();
    return MetaParser._parseJsonMeta(text);
  }

  /**
   * Parse JSON string into imgplay meta structure.
   * Expects: { "imgplay": { "midi": ..., "audio": ..., "engine": ... } }
   * or direct: { "midi": ..., "audio": ..., "engine": ... }
   */
  static _parseJsonMeta(text) {
    try {
      const json = JSON.parse(text);
      const data = json.imgplay || json;

      const result = {
        midi: data.midi || null,
        audio: data.audio || null,
        engine: data.engine || null
      };

      // Only return if at least one field is non-null
      if (result.midi || result.audio || result.engine) {
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Convert Uint8Array to string (UTF-8).
   */
  static _bytesToString(bytes) {
    try {
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      // Fallback for environments without TextDecoder
      let s = "";
      for (let i = 0; i < bytes.length; i++) {
        s += String.fromCharCode(bytes[i]);
      }
      return s;
    }
  }
}
