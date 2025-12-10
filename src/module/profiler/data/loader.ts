import { UrlSource } from "./sources/url-source";
import type { LoadResult } from "./sources/source.interface";

export class DataLoader {
  async fromUrls(urls: string[]): Promise<LoadResult> {
    const source = new UrlSource(urls);
    return source.load();
  }
}
