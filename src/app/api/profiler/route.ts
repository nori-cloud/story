import { Profiler } from "@/module/profiler/profiler";
import { TextToSpeech } from "@/module/text-to-speech";

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

const tts = new TextToSpeech("neuphonic");

export async function POST(request: Request) {
  const { message, speed, tone } = await request.json();

  if (tone) {
    profiler.setTone(tone);
  }

  const response = await profiler.chat(message);

  // Generate speech with text enhancement
  const ttsResult = await tts.generate(response, { speed });
  const audioBase64 = ttsResult.ok
    ? Buffer.from(ttsResult.audio).toString("base64")
    : null;

  console.debug({
    text: response,
    enhanced: ttsResult.ok ? ttsResult.enhancedText : response,
  });

  return Response.json({
    text: response,
    audioBase64,
  });
}
