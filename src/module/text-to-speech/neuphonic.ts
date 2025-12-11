import { createClient, toWav } from "@neuphonic/neuphonic-js";

const Neuphonic = {
  ApiKey: process.env.NEUPHONIC_API_KEY || "",
};

const client = createClient({
  apiKey: Neuphonic.ApiKey,
});

export type GenerateSpeechResult =
  | {
      ok: true;
      wav: Uint8Array<ArrayBufferLike>;
    }
  | {
      ok: false;
      error: string;
    };

export async function generateSpeech(
  text: string,
  options?: {
    speed?: number;
  },
): Promise<GenerateSpeechResult> {
  try {
    const sse = await client.tts.sse({
      speed: options?.speed || 1,
      lang_code: "en",
    });

    const res = await sse.send(text);
    const wav = toWav(res.audio);

    return {
      ok: true,
      wav,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Error",
    };
  }
}
