import { Profiler } from "@/module/profiler/profiler";
import { Speech } from "@/module/speech";
import { createLogger, generateRequestId } from "@/lib/logger";

const urls = process.env.STORY_PROFILE_URLS || "";
const urlList = urls.split(", ").filter((url) => url && url.trim().length > 0);

const profiler = new Profiler({
  urls: urlList,
});

const initLogger = createLogger("Profiler:Init");

if (urlList.length > 0) {
  initLogger.info("Initializing profiler", { urls: urlList });
  await profiler.initialize();
  initLogger.info("Profiler initialized successfully");
} else {
  initLogger.warn("Skipping profiler initialization - no URLs configured");
}

const tts = new Speech("kokoro");
initLogger.info("TTS provider initialized", { provider: "kokoro" });

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const log = createLogger("Profiler", requestId);
  const startTime = Date.now();

  log.info("Request received");

  try {
    const body = await request.json();
    const { message, speed, tone } = body;

    log.info("Request parameters", {
      messageLength: message?.length || 0,
      messagePreview: message?.substring(0, 80) + (message?.length > 80 ? "..." : ""),
      speed: speed || "(default)",
      tone: tone || "(default)",
    });

    if (!message) {
      log.warn("Rejected: No message provided");
      return Response.json(
        { ok: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (tone) {
      log.debug("Setting tone", { tone });
      profiler.setTone(tone);
    }

    log.info("Sending to LLM for chat response");
    const chatStartTime = Date.now();
    const response = await profiler.chat(message);
    const chatDuration = Date.now() - chatStartTime;

    log.info("LLM response received", {
      responseLength: response.length,
      responsePreview: response.substring(0, 100) + (response.length > 100 ? "..." : ""),
      chatDuration: `${chatDuration}ms`,
    });

    log.info("Generating TTS audio", { speed: speed || "(default)" });
    const ttsStartTime = Date.now();
    const ttsResult = await tts.generate(response, { speed });
    const ttsDuration = Date.now() - ttsStartTime;

    if (!ttsResult.ok) {
      log.error("TTS generation failed", { error: ttsResult.error });
    } else {
      log.info("TTS audio generated", {
        audioSize: `${(ttsResult.audio.length / 1024).toFixed(2)} KB`,
        enhanced: ttsResult.enhancedText !== response,
        ttsDuration: `${ttsDuration}ms`,
      });
    }

    const audioBase64 = ttsResult.ok
      ? Buffer.from(ttsResult.audio).toString("base64")
      : null;

    const totalDuration = Date.now() - startTime;
    log.info("Request completed", {
      success: true,
      hasAudio: !!audioBase64,
      chatDuration: `${chatDuration}ms`,
      ttsDuration: `${ttsDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    return Response.json({
      text: response,
      audioBase64,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    log.error("Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: totalDuration,
    });

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
