import { DeepSeekAI } from "@/lib/ai/deepseek";
import { DataLoader } from "./data/loader";
import { profilerPrompt, type Tone } from "./prompt";

export class Profiler {
  status: "idle" | "initialized" = "idle";
  private ai: DeepSeekAI;
  private dataLoader: DataLoader;
  private _systemPrompt: string = "";
  private context: string = "";

  constructor(
    private config: {
      urls: string[];
      apiKey?: string;
      maxHistoryMessages?: number;
    },
  ) {
    this.ai = new DeepSeekAI({
      systemPrompt: "",
      apiKey: this.config.apiKey,
    });
    this.dataLoader = new DataLoader();
  }

  get systemPrompt() {
    return this._systemPrompt;
  }

  set systemPrompt(value: string) {
    this._systemPrompt = value;
    this.ai.setSystemPrompt(value);
  }

  async initialize() {
    const result = await this.dataLoader.fromUrls(this.config.urls);

    if (!result.ok) {
      throw new Error(`Failed to load data: ${result.error}`);
    }

    this.context = result.text;
    this.systemPrompt = profilerPrompt(this.context);
    this.status = "initialized";
    console.log(
      `Profiler initialized, loaded with ${JSON.stringify(this.config.urls)}`,
    );
  }

  setTone(tone: Tone) {
    this.systemPrompt = profilerPrompt(this.context, tone);
  }

  async chat(message: string) {
    if (this.status !== "initialized") {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    return this.ai.chat(message);
  }
}
