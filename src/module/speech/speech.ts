import type { TTSProvider, TTSOptions, TTSResult } from "./tts/provider";
import type { STTProvider, STTOptions, STTResult } from "./stt/provider";
import { enhanceTextForSpeech } from "./tts/speech-enhancer";
import { ElevenLabsTTSProvider } from "./tts/elevenlabs";
import { NeurophonicTTSProvider } from "./tts/neuphonic";
import { KokoroTTSProvider } from "./tts/kokoro";
import { WhisperSTTProvider } from "./stt/whisper";

export type TTSProviderType = "elevenlabs" | "neuphonic" | "kokoro";
export type STTProviderType = "whisper";

export type SpeechConfig = {
  ttsProvider?: TTSProviderType;
  sttProvider?: STTProviderType;
  enhanceText?: boolean;
};

export type TextToSpeechResult = TTSResult & {
  enhancedText?: string;
};

/**
 * Unified Speech class using strategy pattern for TTS and STT
 */
export class Speech {
  private ttsProvider: TTSProvider;
  private sttProvider: STTProvider;
  private enhanceText: boolean;

  constructor(config?: SpeechConfig | TTSProviderType) {
    // Backward compatibility: accept provider string directly
    if (typeof config === "string") {
      this.ttsProvider = this.createTTSProvider(config);
      this.sttProvider = this.createSTTProvider("whisper");
      this.enhanceText = true;
    } else {
      this.ttsProvider = this.createTTSProvider(
        config?.ttsProvider || "neuphonic",
      );
      this.sttProvider = this.createSTTProvider(
        config?.sttProvider || "whisper",
      );
      this.enhanceText = config?.enhanceText ?? true;
    }
  }

  /**
   * Set the TTS provider strategy
   */
  setTTSProvider(provider: TTSProviderType | TTSProvider): void {
    if (typeof provider === "string") {
      this.ttsProvider = this.createTTSProvider(provider);
    } else {
      this.ttsProvider = provider;
    }
  }

  /**
   * Set the STT provider strategy
   */
  setSTTProvider(provider: STTProviderType | STTProvider): void {
    if (typeof provider === "string") {
      this.sttProvider = this.createSTTProvider(provider);
    } else {
      this.sttProvider = provider;
    }
  }

  /**
   * Generate speech from text
   */
  async textToSpeech(
    text: string,
    options?: TTSOptions,
  ): Promise<TextToSpeechResult> {
    let textToSpeak = text;
    let enhancedText: string | undefined;

    // Enhance text if enabled
    if (this.enhanceText) {
      const providerType = this.getProviderType(this.ttsProvider);
      const enhanceResult = await enhanceTextForSpeech(text, {
        provider: providerType === "elevenlabs" ? "elevenlabs" : "neuphonic",
      });

      if (enhanceResult.ok) {
        textToSpeak = enhanceResult.text;
        enhancedText = enhanceResult.text;
      }
    }

    // Generate speech
    const result = await this.ttsProvider.generate(textToSpeak, options);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      audio: result.audio,
      enhancedText,
    };
  }

  /**
   * Backward compatibility alias for textToSpeech
   */
  async generate(
    text: string,
    options?: TTSOptions,
  ): Promise<TextToSpeechResult> {
    return this.textToSpeech(text, options);
  }

  /**
   * Transcribe audio to text
   */
  async speechToText(
    audio: Uint8Array | Buffer,
    options?: STTOptions,
  ): Promise<STTResult> {
    return this.sttProvider.transcribe(audio, options);
  }

  /**
   * Enable or disable text enhancement for TTS
   */
  setTextEnhancement(enabled: boolean): void {
    this.enhanceText = enabled;
  }

  private createTTSProvider(type: TTSProviderType): TTSProvider {
    switch (type) {
      case "elevenlabs":
        return new ElevenLabsTTSProvider();
      case "neuphonic":
        return new NeurophonicTTSProvider();
      case "kokoro":
        return new KokoroTTSProvider();
      default:
        throw new Error(`Unknown TTS provider: ${type}`);
    }
  }

  private createSTTProvider(type: STTProviderType): STTProvider {
    switch (type) {
      case "whisper":
        return new WhisperSTTProvider();
      default:
        throw new Error(`Unknown STT provider: ${type}`);
    }
  }

  private getProviderType(provider: TTSProvider): TTSProviderType {
    if (provider instanceof ElevenLabsTTSProvider) return "elevenlabs";
    if (provider instanceof NeurophonicTTSProvider) return "neuphonic";
    if (provider instanceof KokoroTTSProvider) return "kokoro";
    return "neuphonic"; // default
  }
}
