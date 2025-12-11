import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { read } from "fs";

const ElevenLabs = {
  ApiKey: process.env.ELEVENLABS_API_KEY || "",
};

const client = new ElevenLabsClient({
  apiKey: ElevenLabs.ApiKey,
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
    voiceId?: string;
  },
): Promise<GenerateSpeechResult> {
  try {
    const audio = await client.textToSpeech.convert(
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
      wav,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Error",
    };
  }
}
