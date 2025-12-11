import { generateSpeech as generateElevenlabs } from "./elevenlabs";
import { generateSpeech as generateNeuphonic } from "./neuphonic";
import { enhanceTextForSpeech } from "./speech-enhancer";

export type TextToSpeechProvider = "neuphonic" | "elevenlabs";

export type TextToSpeechOptions = {
  provider?: TextToSpeechProvider;
  speed?: number;
  voiceId?: string;
};

export type TextToSpeechResult =
  | {
      ok: true;
      audio: Uint8Array<ArrayBufferLike>;
      enhancedText: string;
    }
  | {
      ok: false;
      error: string;
    };

export class TextToSpeech {
  private provider: TextToSpeechProvider;

  constructor(provider: TextToSpeechProvider = "neuphonic") {
    this.provider = provider;
  }

  async generate(
    text: string,
    options?: TextToSpeechOptions,
  ): Promise<TextToSpeechResult> {
    const provider = options?.provider || this.provider;

    // Enhance text for speech
    const enhancedResult = await enhanceTextForSpeech(text, { provider });
    const enhancedText = enhancedResult.ok ? enhancedResult.text : text;

    // Generate speech based on provider
    const generateFn =
      provider === "elevenlabs" ? generateElevenlabs : generateNeuphonic;

    const speechResult = await generateFn(enhancedText, {
      speed: options?.speed,
      voiceId: options?.voiceId,
    });

    if (!speechResult.ok) {
      return {
        ok: false,
        error: speechResult.error,
      };
    }

    return {
      ok: true,
      audio: speechResult.wav,
      enhancedText,
    };
  }
}
