import { DeepSeekAI } from "@/lib/ai/deepseek";

const SPEECH_ENHANCEMENT_PROMPT = `You are a text optimization assistant for speech synthesis. Your role is to transform written text into speech-friendly format optimized for the Neuphonic TTS API.

Guidelines:
1. Remove markdown formatting, URLs, and code blocks - convert them to natural spoken equivalents
2. Expand abbreviations and acronyms on first use
3. Convert numbers and symbols to their spoken form (e.g., "50%" to "fifty percent")
4. Add natural pauses using commas and periods for better pacing
5. Break long sentences into shorter, more digestible phrases
6. Remove or replace technical jargon with simpler alternatives when possible
7. Ensure the text flows naturally when spoken aloud
8. Keep the core meaning and message intact
9. Do not add extra commentary or explanations - just return the optimized text

Output only the enhanced text, nothing else.`;

export type EnhanceTextResult =
  | {
      ok: true;
      text: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function enhanceTextForSpeech(
  text: string,
  options?: {
    apiKey?: string;
  },
): Promise<EnhanceTextResult> {
  try {
    const ai = new DeepSeekAI({
      systemPrompt: SPEECH_ENHANCEMENT_PROMPT,
      apiKey: options?.apiKey,
    });

    const enhancedText = await ai.chat(text);

    return {
      ok: true,
      text: enhancedText,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Error",
    };
  }
}
