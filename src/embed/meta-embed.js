/**
 * MetaEmbed — embeds imgplay metadata into PNG files.
 *
 * Takes a PNG image + MIDI file (or JSON metadata) and produces
 * a new PNG with an "imgplay" tEXt chunk containing the data.
 *
 * Usage:
 *   const blob = await MetaEmbed.embedMidi(pngFile, midiFile);
 *   MetaEmbed.download(blob, "image-with-midi.png");
 */

export class MetaEmbed {
  /**
   * Embed a MIDI file into a PNG image as base64 in tEXt chunk.
   *
   * @param {File|Blob|ArrayBuffer} pngSource - PNG image
   * @param {File|Blob|ArrayBuffer} midiSource - MIDI file
   * @param {Object} extraMeta - additional metadata to merge
   * @returns {Promise<Blob>} new PNG with embedded MIDI
   */
  static async embedMidi(pngSource, midiSource, extraMeta = {}) {
    const pngBuf = await MetaEmbed._toArrayBuffer(pngSource);
    const midiBuf = await MetaEmbed._toArrayBuffer(midiSource);

    const midiBase64 = MetaEmbed._arrayBufferToBase64(midiBuf);

    const meta = Object.assign({
      midi: { data: midiBase64 }
    }, extraMeta);

    return MetaEmbed.embedJson(pngBuf, meta);
  }

  /**
   * Embed an audio URL reference into a PNG image.
   *
   * @param {File|Blob|ArrayBuffer} pngSource - PNG image
   * @param {string} audioUrl - URL to audio file
   * @param {Object} extraMeta - additional metadata
   * @returns {Promise<Blob>} new PNG with embedded audio reference
   */
  static async embedAudioUrl(pngSource, audioUrl, extraMeta = {}) {
    const pngBuf = await MetaEmbed._toArrayBuffer(pngSource);

    const meta = Object.assign({
      audio: { url: audioUrl }
    }, extraMeta);

    return MetaEmbed.embedJson(pngBuf, meta);
  }

  /**
   * Embed arbitrary imgplay JSON metadata into a PNG.
   *
   * @param {ArrayBuffer} pngBuffer - PNG file bytes
   * @param {Object} meta - metadata object (midi, audio, engine fields)
   * @returns {Blob} new PNG with tEXt chunk
   */
  static embedJson(pngBuffer, meta) {
    const pngBytes = new Uint8Array(pngBuffer);

    // Verify PNG signature
    if (pngBytes.length < 8 ||
        pngBytes[0] !== 0x89 || pngBytes[1] !== 0x50 ||
        pngBytes[2] !== 0x4E || pngBytes[3] !== 0x47) {
      throw new Error("[MetaEmbed] Not a valid PNG file");
    }

    const jsonStr = JSON.stringify({ imgplay: meta });
    const textChunk = MetaEmbed._createTextChunk("imgplay", jsonStr);

    // Find insertion point: after IHDR chunk (first chunk after signature)
    // PNG: 8-byte signature, then chunks (4 len + 4 type + data + 4 CRC)
    const ihdrLen = (pngBytes[8] << 24) | (pngBytes[9] << 16) |
                    (pngBytes[10] << 8) | pngBytes[11];
    const insertAt = 8 + 12 + ihdrLen; // after signature + IHDR chunk

    // Build new PNG: before + tEXt chunk + after
    const before = pngBytes.slice(0, insertAt);
    const after = pngBytes.slice(insertAt);

    const result = new Uint8Array(before.length + textChunk.length + after.length);
    result.set(before, 0);
    result.set(textChunk, before.length);
    result.set(after, before.length + textChunk.length);

    return new Blob([result], { type: "image/png" });
  }

  /**
   * Remove existing imgplay tEXt chunks from a PNG.
   *
   * @param {File|Blob|ArrayBuffer} pngSource - PNG image
   * @returns {Promise<Blob>} PNG without imgplay metadata
   */
  static async strip(pngSource) {
    const pngBuf = await MetaEmbed._toArrayBuffer(pngSource);
    const bytes = new Uint8Array(pngBuf);

    if (bytes.length < 8 ||
        bytes[0] !== 0x89 || bytes[1] !== 0x50) {
      throw new Error("[MetaEmbed] Not a valid PNG file");
    }

    const parts = [bytes.slice(0, 8)]; // PNG signature
    let offset = 8;

    while (offset + 12 <= bytes.length) {
      const chunkLen = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                       (bytes[offset + 2] << 8) | bytes[offset + 3];
      const chunkType = String.fromCharCode(
        bytes[offset + 4], bytes[offset + 5],
        bytes[offset + 6], bytes[offset + 7]
      );
      const fullChunkSize = 12 + chunkLen;

      // Check if this is an imgplay tEXt/iTXt chunk
      let isImgplay = false;
      if ((chunkType === "tEXt" || chunkType === "iTXt") && chunkLen > 0) {
        const dataStart = offset + 8;
        const dataEnd = dataStart + chunkLen;
        if (dataEnd <= bytes.length) {
          const chunkData = bytes.slice(dataStart, dataEnd);
          const nullIdx = chunkData.indexOf(0);
          if (nullIdx > 0) {
            const keyword = MetaEmbed._bytesToString(chunkData.slice(0, nullIdx));
            if (keyword === "imgplay") isImgplay = true;
          }
        }
      }

      if (!isImgplay) {
        parts.push(bytes.slice(offset, offset + fullChunkSize));
      }

      if (chunkType === "IEND") break;
      offset += fullChunkSize;
    }

    const totalLen = parts.reduce(function(sum, p) { return sum + p.length; }, 0);
    const result = new Uint8Array(totalLen);
    let pos = 0;
    parts.forEach(function(p) {
      result.set(p, pos);
      pos += p.length;
    });

    return new Blob([result], { type: "image/png" });
  }

  /**
   * Trigger browser download.
   */
  static download(blob, filename = "imgplay-embedded.png") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Internal helpers ---

  static _createTextChunk(keyword, text) {
    const keyBytes = MetaEmbed._stringToBytes(keyword);
    const textBytes = MetaEmbed._stringToBytes(text);

    // tEXt chunk data: keyword + null + text
    const dataLen = keyBytes.length + 1 + textBytes.length;
    const chunk = new Uint8Array(12 + dataLen);

    // Length (4 bytes, big-endian)
    chunk[0] = (dataLen >> 24) & 0xFF;
    chunk[1] = (dataLen >> 16) & 0xFF;
    chunk[2] = (dataLen >> 8) & 0xFF;
    chunk[3] = dataLen & 0xFF;

    // Type: "tEXt"
    chunk[4] = 0x74; // t
    chunk[5] = 0x45; // E
    chunk[6] = 0x58; // X
    chunk[7] = 0x74; // t

    // Data: keyword + null + text
    chunk.set(keyBytes, 8);
    chunk[8 + keyBytes.length] = 0; // null separator
    chunk.set(textBytes, 8 + keyBytes.length + 1);

    // CRC over type + data
    const crcData = chunk.slice(4, 8 + dataLen);
    const crc = MetaEmbed._crc32(crcData);
    const crcOffset = 8 + dataLen;
    chunk[crcOffset] = (crc >> 24) & 0xFF;
    chunk[crcOffset + 1] = (crc >> 16) & 0xFF;
    chunk[crcOffset + 2] = (crc >> 8) & 0xFF;
    chunk[crcOffset + 3] = crc & 0xFF;

    return chunk;
  }

  static _crc32(bytes) {
    if (!MetaEmbed._crcTable) {
      var table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
          if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
          else c = c >>> 1;
        }
        table[n] = c;
      }
      MetaEmbed._crcTable = table;
    }

    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = MetaEmbed._crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  static _stringToBytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF;
    }
    return bytes;
  }

  static _bytesToString(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) {
      s += String.fromCharCode(bytes[i]);
    }
    return s;
  }

  static async _toArrayBuffer(source) {
    if (source instanceof ArrayBuffer) return source;
    if (source instanceof Uint8Array) return source.buffer;
    if (source instanceof Blob || (typeof File !== "undefined" && source instanceof File)) {
      return source.arrayBuffer();
    }
    throw new Error("[MetaEmbed] Unsupported source type");
  }

  static _arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
