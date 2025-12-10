import { ChatDeepSeek } from "@langchain/deepseek";

export type ChatMessage = ["human" | "system" | "ai", string];

export class DeepSeekAI {
  private model: ChatDeepSeek;
  private systemPrompt: string;
  private messages: ChatMessage[];
  private maxHistoryMessages: number;

  constructor(config: {
    systemPrompt: string;
    apiKey?: string;
    maxHistoryMessages?: number;
  }) {
    this.systemPrompt = config.systemPrompt;
    this.messages = [];
    this.maxHistoryMessages = config.maxHistoryMessages ?? 40;

    const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;

    this.model = new ChatDeepSeek({
      apiKey,
      model: "deepseek-chat",
      temperature: 0.7,
    });
  }

  async chat(message: string): Promise<string> {
    // Add user message to history
    this.messages.push(["human", message]);

    // Build full message array with system prompt
    const fullMessages: ChatMessage[] = [
      ["system", this.systemPrompt],
      ...this.messages,
    ];

    // Invoke model
    const result = await this.model.invoke(fullMessages);

    // Extract response
    const response = String(result.content);

    // Add AI response to history
    this.messages.push(["ai", response]);

    // Trim history if needed
    this.trimHistory();

    return response;
  }

  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  clearHistory(): void {
    this.messages = [];
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  getTokenCount(): number {
    const systemPromptTokens = this.estimateTokens([
      ["system", this.systemPrompt],
    ]);
    const historyTokens = this.estimateTokens(this.messages);
    return systemPromptTokens + historyTokens;
  }

  private trimHistory(): void {
    if (this.messages.length > this.maxHistoryMessages) {
      this.messages = this.messages.slice(-this.maxHistoryMessages);
    }
  }

  private estimateTokens(messages: ChatMessage[]): number {
    const totalChars = messages.reduce((sum, [_role, content]) => {
      return sum + content.length;
    }, 0);
    return Math.ceil(totalChars * 1.3);
  }
}
