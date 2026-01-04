import type { STTProvider, STTOptions, STTResult } from "./provider";

const WHISPER_BASE_URL = process.env.WHISPER_URL || "http://whisper:8000";

export class WhisperSTTProvider implements STTProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || WHISPER_BASE_URL;
  }

  async transcribe(
    audio: Uint8Array | Buffer,
    options?: STTOptions,
  ): Promise<STTResult> {
    try {
      const formData = new FormData();
      // Convert to Uint8Array and slice to get a clean ArrayBuffer
      const audioData = audio instanceof Buffer ? new Uint8Array(audio) : audio;
      const cleanBuffer = audioData.slice(0).buffer;
      const audioBlob = new Blob([cleanBuffer], { type: "audio/wav" });
      formData.append("file", audioBlob, "audio.wav");

      if (options?.language) {
        formData.append("language", options.language);
      }
      if (options?.model) {
        formData.append("model", options.model);
      }

      const response = await fetch(`${this.baseUrl}/v1/audio/transcriptions`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          ok: false,
          error: `Whisper API error: ${response.status} - ${error}`,
        };
      }

      const result = await response.json();

      return {
        ok: true,
        text: result.text,
        language: result.language,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Error",
      };
    }
  }
}
