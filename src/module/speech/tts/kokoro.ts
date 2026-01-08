import type { TTSProvider, TTSOptions, TTSResult } from "./provider";

const KOKORO_BASE_URL = process.env.STORY_KOKORO_URL || "http://kokoro:8880";

export class KokoroTTSProvider implements TTSProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || KOKORO_BASE_URL;
  }

  async generate(text: string, options?: TTSOptions): Promise<TTSResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "kokoro",
          input: text,
          voice: options?.voiceId || "am_santa(1)+am_adam(1)",
          speed: options?.speed || 1.2,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          ok: false,
          error: `Kokoro API error: ${response.status} - ${error}`,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const audio = new Uint8Array(arrayBuffer);

      return {
        ok: true,
        audio,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Error",
      };
    }
  }
}
