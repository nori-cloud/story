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

const KOKORO_ENHANCEMENT_PROMPT = `You are a text optimization assistant for Kokoro TTS (82M parameter lightweight model). Transform text into Kokoro-optimized format using its phoneme notation system.

Guidelines:
1. Use Kokoro's phoneme notation for challenging words: [text](/phoneme/)
   - Example: [Kokoro](/kˈOkəɹO/) for pronunciation hints
   - Use IPA phoneme notation between forward slashes
2. Keep sentences SHORT (20-25 words maximum) - Kokoro is a lightweight model
3. Use commas for short pauses, periods for medium pauses, ... for longer pauses
4. Expand abbreviations to full spoken form (e.g., "Dr." → "Doctor")
5. Convert numbers to spoken form:
   - "123" → "one hundred twenty-three"
   - "$45" → "forty-five dollars"
6. Remove markdown, URLs, and code blocks - convert to simple spoken equivalents
7. Break complex sentences into multiple shorter ones
8. Use simple, conversational language (avoid jargon when possible)
9. NO SSML tags or complex markup - Kokoro uses plain text with phoneme hints
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
    provider?: "neuphonic" | "elevenlabs" | "kokoro";
  },
): Promise<EnhanceTextResult> {
  try {
    let prompt: string;

    switch (options?.provider) {
      case "elevenlabs":
        prompt = ELEVENLABS_ENHANCEMENT_PROMPT;
        break;
      case "kokoro":
        prompt = KOKORO_ENHANCEMENT_PROMPT;
        break;
      default:
        prompt = SPEECH_ENHANCEMENT_PROMPT;
        break;
    }

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
