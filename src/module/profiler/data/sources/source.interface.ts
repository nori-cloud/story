export interface DataSource {
  load(): Promise<LoadResult>;
}

export type LoadResult =
  | { ok: true; text: string }
  | { ok: false; error: string };
