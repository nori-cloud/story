import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { TTSProvider, TTSOptions, TTSResult } from "./provider";

const ElevenLabs = {
  ApiKey: process.env.STORY_ELEVENLABS_API_KEY || "",
};

export class ElevenLabsTTSProvider implements TTSProvider {
  private client: ElevenLabsClient;

  constructor(apiKey?: string) {
    this.client = new ElevenLabsClient({
      apiKey: apiKey || ElevenLabs.ApiKey,
    });
  }

  async generate(text: string, options?: TTSOptions): Promise<TTSResult> {
    try {
      const audio = await this.client.textToSpeech.convert(
        options?.voiceId || "UgBBYS2sOqTuMpoF3BR0",
        {
          text,
          voiceSettings: {
            stability: 0.5,
            similarityBoost: 0.75,
            speed: options?.speed || 1.0,
          },
        },
      );

      // Convert the ReadableStream to a Uint8Array
      const reader = audio.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const wav = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        wav.set(chunk, offset);
        offset += chunk.length;
      }

      return {
        ok: true,
        audio: wav,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Error",
      };
    }
  }
}
