import type { DataSource, LoadResult } from "./source.interface";

export class UrlSource implements DataSource {
  constructor(private urls: string[]) {}

  async load(): Promise<LoadResult> {
    try {
      const responses = await Promise.all(
        this.urls.map((url) => fetch(url)),
      );

      const texts = await Promise.all(
        responses.map((response) => response.text()),
      );

      const concatenated = texts.join("\n\n---\n\n");

      return { ok: true, text: concatenated };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
