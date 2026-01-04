import { createClient, toWav } from "@neuphonic/neuphonic-js";
import type { TTSProvider, TTSOptions, TTSResult } from "./provider";

const Neuphonic = {
  ApiKey: process.env.NEUPHONIC_API_KEY || "",
};

export class NeurophonicTTSProvider implements TTSProvider {
  private client: ReturnType<typeof createClient>;

  constructor(apiKey?: string) {
    this.client = createClient({
      apiKey: apiKey || Neuphonic.ApiKey,
    });
  }

  async generate(text: string, options?: TTSOptions): Promise<TTSResult> {
    try {
      const sse = await this.client.tts.sse({
        speed: options?.speed || 1,
        lang_code: "en",
      });

      const res = await sse.send(text);
      const wav = toWav(res.audio);

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
