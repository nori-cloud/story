import { Speech } from "@/module/speech/speech";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("[TTS] Request received");

  try {
    const body = await request.json();
    const { text, voiceId, speed } = body;

    console.log("[TTS] Request parameters:", {
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 50) + (text?.length > 50 ? "..." : ""),
      voiceId: voiceId || "(default)",
      speed: speed || "(default)",
    });

    if (!text) {
      console.warn("[TTS] Rejected: No text provided");
      return NextResponse.json(
        { ok: false, error: "Text is required" },
        { status: 400 }
      );
    }

    console.log("[TTS] Initializing Speech with kokoro provider");
    const speech = new Speech();
    speech.setTTSProvider("kokoro");

    const ttsStartTime = Date.now();
    const result = await speech.textToSpeech(text, {
      voiceId,
      speed: speed ? parseFloat(speed) : undefined,
    });
    const ttsDuration = Date.now() - ttsStartTime;

    if (!result.ok) {
      console.error("[TTS] Generation failed:", result.error);
      return NextResponse.json(result, { status: 500 });
    }

    const audioSize = result.audio.length;
    const totalDuration = Date.now() - startTime;

    console.log("[TTS] Success:", {
      audioSize: `${(audioSize / 1024).toFixed(2)} KB`,
      ttsDuration: `${ttsDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    // Return audio as binary response
    return new NextResponse(Buffer.from(result.audio), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioSize.toString(),
      },
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("[TTS] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${totalDuration}ms`,
    });
    return NextResponse.json(
      { ok: false, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
