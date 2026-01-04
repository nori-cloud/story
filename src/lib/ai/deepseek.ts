import { ChatDeepSeek } from "@langchain/deepseek";

export type ChatMessage = ["human" | "system" | "ai", string];

export class DeepSeekAI {
  private model: ChatDeepSeek | null = null;
  private systemPrompt: string;
  private apiKey?: string;

  constructor(config: {
    systemPrompt: string;
    apiKey?: string;
  }) {
    this.systemPrompt = config.systemPrompt;
    this.apiKey = config.apiKey || process.env.STORY_DEEPSEEK_API_KEY;

    // Only initialize if API key is available
    if (this.apiKey) {
      this.model = new ChatDeepSeek({
        apiKey: this.apiKey,
        model: "deepseek-chat",
        temperature: 0.7,
      });
    }
  }

  async chat(message: string): Promise<string> {
    if (!this.model) {
      throw new Error(
        "Deepseek API key not found. Please set the STORY_DEEPSEEK_API_KEY environment variable or pass the key into 'apiKey' field.",
      );
    }

    // Build full message array with system prompt
    const fullMessages: ChatMessage[] = [
      ["system", this.systemPrompt],
      ["human", message],
    ];

    const result = await this.model.invoke(fullMessages);

    const response = String(result.content);

    return response;
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  getSystemPrompt() {
    return this.systemPrompt;
  }
}
