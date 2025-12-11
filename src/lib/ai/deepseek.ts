import { ChatDeepSeek } from "@langchain/deepseek";

export type ChatMessage = ["human" | "system" | "ai", string];

export class DeepSeekAI {
  private model: ChatDeepSeek;
  private systemPrompt: string;

  constructor(config: {
    systemPrompt: string;
    apiKey?: string;
  }) {
    this.systemPrompt = config.systemPrompt;

    const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;

    this.model = new ChatDeepSeek({
      apiKey,
      model: "deepseek-chat",
      temperature: 0.7,
    });
  }

  async chat(message: string): Promise<string> {
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
