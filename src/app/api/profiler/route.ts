import { Profiler } from "@/module/profiler/profiler";
import { generateSpeech } from "@/module/text-to-speech/neuphonic";
import { enhanceTextForSpeech } from "@/module/text-to-speech/speech-enhancer";

const urls = [
  "https://pub-3609c6786e904bc2b95c6093682c92da.r2.dev/australia.md",
  "https://pub-3609c6786e904bc2b95c6093682c92da.r2.dev/bio.md",
  "https://pub-3609c6786e904bc2b95c6093682c92da.r2.dev/career.md",
  "https://pub-3609c6786e904bc2b95c6093682c92da.r2.dev/fun-things.md",
];

const profiler = new Profiler({
  urls,
});

await profiler.initialize();

export async function POST(request: Request) {
  const { message, speed, tone } = await request.json();

  if (tone) {
    profiler.setTone(tone);
  }

  const response = await profiler.chat(message);

  // Enhance text for speech
  const enhancedResult = await enhanceTextForSpeech(response);
  const textForSpeech = enhancedResult.ok ? enhancedResult.text : response;

  // Generate audio
  const speechResult = await generateSpeech(textForSpeech, { speed });
  const audioBase64 = speechResult.ok
    ? Buffer.from(speechResult.wav).toString("base64")
    : null;

  console.debug({
    text: response,
    enhanced: textForSpeech,
  });

  return Response.json({
    text: response,
    audioBase64,
  });
}
