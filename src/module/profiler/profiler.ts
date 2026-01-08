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
    // Filter out empty URLs
    const validUrls = this.config.urls.filter((url) => url && url.trim().length > 0);

    if (validUrls.length === 0) {
      // No valid URLs, initialize with empty context
      console.log("Profiler initialized with no URLs (empty context)");
      this.context = "";
      this.systemPrompt = profilerPrompt(this.context);
      this.status = "initialized";
      return;
    }

    const result = await this.dataLoader.fromUrls(validUrls);

    if (!result.ok) {
      throw new Error(`Failed to load data: ${result.error}`);
    }

    this.context = result.text;
    this.systemPrompt = profilerPrompt(this.context);
    this.status = "initialized";
    console.log(
      `Profiler initialized, loaded with ${JSON.stringify(validUrls)}`,
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
