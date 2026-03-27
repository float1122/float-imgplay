/**
 * AudioEngine — plays mp3/wav/ogg audio files referenced in imgplay metadata.
 *
 * meta.audio format:
 *   { url: "https://...", type: "mp3" }  // type is optional
 *
 * Uses Web Audio API AudioBufferSourceNode for precise control
 * (start/stop timing, integration with AudioContext).
 */

export class AudioEngine {
  canHandle(source, meta) {
    return !!(meta && meta.audio && meta.audio.url);
  }

  /**
   * Analyze = fetch and decode the audio file.
   * Returns a "score" that is actually the decoded AudioBuffer,
   * wrapped to match the Engine interface.
   */
  async analyze(source, audioOpts) {
    const audioUrl = source._audioMeta?.url;
    if (!audioUrl) {
      return { score: null, meta: { type: "audio" } };
    }

    return {
      score: { audioUrl },
      meta: { type: "audio", url: audioUrl }
    };
  }

  /**
   * Play the audio buffer.
   * audioOpts.masterVolume is respected via a GainNode.
   */
  play(score, audioCtx, audioOpts) {
    const nodes = [];
    const timers = [];

    if (!score || !score.audioBuffer) {
      return { nodes, timers, totalDuration: 0 };
    }

    const bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = score.audioBuffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(audioOpts.masterVolume, audioCtx.currentTime);

    bufferSource.connect(gain);
    gain.connect(audioCtx.destination);

    bufferSource.start(0);
    nodes.push(bufferSource, gain);

    return {
      nodes,
      timers,
      totalDuration: score.audioBuffer.duration,
      bufferSource
    };
  }

  stop(handle) {
    if (handle.timers) {
      handle.timers.forEach((id) => clearTimeout(id));
    }
    if (handle.bufferSource) {
      try { handle.bufferSource.stop(0); } catch {}
    }
    if (handle.nodes) {
      handle.nodes.forEach((node) => {
        try { if (typeof node.disconnect === "function") node.disconnect(); } catch {}
      });
    }
  }
}

/**
 * Helper: fetch and decode an audio URL into an AudioBuffer.
 * Called by Core before play() when AudioEngine is selected.
 */
AudioEngine.fetchAndDecode = async function(url, audioCtx) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`[FloatImgPlay] AudioEngine fetch failed: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
};
