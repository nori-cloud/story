export type STTOptions = {
  language?: string;
  model?: string;
};

export type STTResult =
  | {
      ok: true;
      text: string;
      language?: string;
    }
  | {
      ok: false;
      error: string;
    };

export interface STTProvider {
  transcribe(audio: Uint8Array | Buffer, options?: STTOptions): Promise<STTResult>;
}
