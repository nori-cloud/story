import { createLogger, generateRequestId } from "@/lib/logger";
import { Speech } from "@/module/speech/speech";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createLogger("TTS", requestId);
  const startTime = Date.now();

  log.info("Request received");

  try {
    const body = await request.json();
    const { text, voiceId, speed } = body;

    log.info("Request parameters", {
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 50) + (text?.length > 50 ? "..." : ""),
      voiceId: voiceId || "(default)",
      speed: speed || "(default)",
    });

    if (!text) {
      log.warn("Rejected: No text provided");
      return NextResponse.json(
        { ok: false, error: "Text is required" },
        { status: 400 }
      );
    }

    log.debug("Initializing Speech with kokoro provider");
    const speech = new Speech();
    speech.setTTSProvider("kokoro");

    log.info("Generating TTS audio");
    const ttsStartTime = Date.now();
    const result = await speech.textToSpeech(text, {
      voiceId,
      speed: speed ? parseFloat(speed) : undefined,
    });
    const ttsDuration = Date.now() - ttsStartTime;

    if (!result.ok) {
      log.error("Generation failed", {
        error: result.error,
        ttsDuration: `${ttsDuration}ms`,
      });
      return NextResponse.json(result, { status: 500 });
    }

    const audioSize = result.audio.length;
    const totalDuration = Date.now() - startTime;

    log.info("Request completed", {
      audioSize: `${(audioSize / 1024).toFixed(2)} KB`,
      ttsDuration: `${ttsDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    return new NextResponse(Buffer.from(result.audio), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioSize.toString(),
      },
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    log.error("Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: totalDuration,
    });
    return NextResponse.json(
      { ok: false, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
