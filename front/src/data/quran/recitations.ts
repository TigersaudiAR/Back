/**
 * Lightweight base64-encoded WAV placeholder used to provide offline recitation audio.
 * The data is stored in a plain-text .b64 file so it plays nicely with git diff tooling.
 */
import placeholderBase64 from "./recitations/placeholder.wav.b64?raw";

const BASE64_SNIPPET = placeholderBase64.replace(/\s+/g, "");

export const RECITATION_AUDIO_BASE64: Record<string, string> = {
  alafasy: BASE64_SNIPPET,
  mahermuaiqly: BASE64_SNIPPET,
  husary: BASE64_SNIPPET
};

export const RECITATION_MIME_TYPE = "audio/wav";
