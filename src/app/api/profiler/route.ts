import { Profiler } from "@/module/profiler/profiler";
import { generateSpeech } from "@/module/text-to-speech/neuphonic";

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
  const { message, speed } = await request.json();

  const response = await profiler.chat(message);

  // Generate audio
  const speechResult = await generateSpeech(response, { speed });
  const audioBase64 = speechResult.ok
    ? Buffer.from(speechResult.wav).toString("base64")
    : null;

  console.debug({
    text: response,
  });

  return Response.json({
    text: response,
    audioBase64,
  });
}
