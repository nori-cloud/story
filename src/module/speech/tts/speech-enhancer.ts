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

const ELEVENLABS_ENHANCEMENT_PROMPT = `You are a text optimization assistant for ElevenLabs text-to-speech synthesis. Transform written text into speech-optimized format following ElevenLabs best practices.

Guidelines:
1. Expand ALL abbreviations and acronyms to full spoken form (e.g., "Dr." → "Doctor", "Ave." → "Avenue")
2. Convert numbers to spoken form:
   - Cardinals: "123" → "one hundred twenty-three"
   - Ordinals: "2nd" → "second"
   - Currency: "$45.67" → "forty-five dollars and sixty-seven cents"
   - Decimals: "3.5" → "three point five"
3. Expand symbols and units:
   - "100%" → "one hundred percent"
   - "100km" → "one hundred kilometers"
4. Convert URLs and technical elements:
   - "example.com/page" → "example dot com slash page"
   - Remove markdown formatting, convert to natural spoken equivalents
5. Use ellipses (...) for natural pauses and thoughtful moments
6. Use capitalization sparingly for emphasis on key words
7. Maintain proper punctuation for natural speech rhythm
8. For emotional tone, use descriptive narrative context (e.g., "she said warmly")
9. Break long sentences into conversational phrases
10. Keep core meaning intact - output ONLY the enhanced text

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
    provider?: "neuphonic" | "elevenlabs";
  },
): Promise<EnhanceTextResult> {
  try {
    const prompt =
      options?.provider === "elevenlabs"
        ? ELEVENLABS_ENHANCEMENT_PROMPT
        : SPEECH_ENHANCEMENT_PROMPT;

    const ai = new DeepSeekAI({
      systemPrompt: prompt,
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
