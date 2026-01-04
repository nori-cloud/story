import { NeurophonicTTSProvider } from "@/module/speech";
import { narrativePrompt } from "./prompt";
import { generateFilename } from "@/module/utils/file";
import { writeFile } from "fs/promises";
import { Profiler } from "@/module/profiler/profiler";

export type GenerateStoryConfig = {
  audioFilePath: string;
  length?: number;
  customPrompt?: string;
};

type GenerateStoryResult =
  | {
      ok: true;
      narrative: string;
      audioPath: string;
    }
  | {
      ok: false;
      error: string;
    };

export class StorytellerService {
  private status: "idle" | "initialized" = "idle";
  private profiler: Profiler;
  private ttsProvider: NeurophonicTTSProvider;

  constructor(urls: string[]) {
    this.status = "idle";
    this.profiler = new Profiler({
      urls,
    });
    this.ttsProvider = new NeurophonicTTSProvider();
  }
  async init() {
    await this.profiler.initialize();

    this.status = "initialized";
  }

  async generateStory(
    options: GenerateStoryConfig,
  ): Promise<GenerateStoryResult> {
    if (this.status !== "initialized") {
      throw new Error("Storyteller is not initialized");
    }

    const _opt = {
      length: 500,
      ...options,
    };

    const narrative = await this.profiler.chat(`
      ${narrativePrompt}

      ${_opt.customPrompt}

      IMPORTANT that narrative is no longer than ${_opt.length} Characters
      `);

    const speechGenerationResult = await this.ttsProvider.generate(narrative);

    if (!speechGenerationResult.ok) {
      return {
        ok: false,
        error: speechGenerationResult.error,
      };
    }

    const filename = generateFilename("story", "wav");

    await writeFile(
      `${_opt.audioFilePath}/${filename}`,
      speechGenerationResult.audio,
    );

    return {
      ok: true,
      narrative,
      audioPath: `/tts-audio/${filename}`,
    };
  }
}
