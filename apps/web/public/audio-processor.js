// AudioWorkletProcessor to capture audio for the Gemini Live stream.
// Carried over VERBATIM from the original app (do not alter the framing).
class PCM16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array();
    this.targetSampleRate = 16000;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0];
    const newBuffer = new Float32Array(this.buffer.length + channelData.length);
    newBuffer.set(this.buffer);
    newBuffer.set(channelData, this.buffer.length);
    this.buffer = newBuffer;

    // Send ~4096 frames at a time; the main thread encodes to base64 PCM16.
    if (this.buffer.length >= 4096) {
      this.port.postMessage(this.buffer);
      this.buffer = new Float32Array();
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCM16Processor);
