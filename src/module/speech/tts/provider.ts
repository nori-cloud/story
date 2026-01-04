export type TTSOptions = {
  speed?: number;
  voiceId?: string;
};

export type TTSResult =
  | {
      ok: true;
      audio: Uint8Array<ArrayBufferLike>;
    }
  | {
      ok: false;
      error: string;
    };

export interface TTSProvider {
  generate(text: string, options?: TTSOptions): Promise<TTSResult>;
}
