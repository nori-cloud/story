// Main Speech class
export { Speech } from "./speech";
export type {
  SpeechConfig,
  TTSProviderType,
  STTProviderType,
  TextToSpeechResult,
} from "./speech";

// TTS exports
export type { TTSProvider, TTSOptions, TTSResult } from "./tts/provider";
export { ElevenLabsTTSProvider } from "./tts/elevenlabs";
export { NeurophonicTTSProvider } from "./tts/neuphonic";
export { KokoroTTSProvider } from "./tts/kokoro";
export { enhanceTextForSpeech } from "./tts/speech-enhancer";
export type { EnhanceTextResult } from "./tts/speech-enhancer";

// STT exports
export type { STTProvider, STTOptions, STTResult } from "./stt/provider";
export { WhisperSTTProvider } from "./stt/whisper";

// Backward compatibility - re-export as TextToSpeech
export { Speech as TextToSpeech } from "./speech";
