import { Speech } from "@/module/speech";

const speech = new Speech({
  sttProvider: "whisper",
});

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("[STT] Request received");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = formData.get("language") as string | null;
    const model = formData.get("model") as string | null;

    console.log("[STT] Request parameters:", {
      audioFile: audioFile ? {
        name: audioFile.name,
        type: audioFile.type,
        size: `${(audioFile.size / 1024).toFixed(2)} KB`,
      } : null,
      language: language || "(auto-detect)",
      model: model || "(default)",
    });

    if (!audioFile) {
      console.warn("[STT] Rejected: No audio file provided");
      return Response.json(
        { ok: false, error: "No audio file provided" },
        { status: 400 },
      );
    }

    console.log("[STT] Converting audio file to buffer");
    const audioBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    console.log("[STT] Sending to Whisper for transcription");
    const sttStartTime = Date.now();
    const result = await speech.speechToText(audioData, {
      language: language || undefined,
      model: model || undefined,
    });
    const sttDuration = Date.now() - sttStartTime;

    if (!result.ok) {
      console.error("[STT] Transcription failed:", result.error);
      return Response.json(result, { status: 500 });
    }

    const totalDuration = Date.now() - startTime;

    console.log("[STT] Success:", {
      transcribedText: result.text,
      detectedLanguage: result.language || "(not provided)",
      textLength: result.text.length,
      sttDuration: `${sttDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    return Response.json(result);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("[STT] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${totalDuration}ms`,
    });
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
