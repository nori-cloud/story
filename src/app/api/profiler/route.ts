import { Profiler } from "@/module/profiler/profiler";
import { Speech } from "@/module/speech";

const urls = process.env.STORY_PROFILE_URLS || "";

const profiler = new Profiler({
  urls: urls.split(", "),
});

await profiler.initialize();

const tts = new Speech("kokoro");

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
