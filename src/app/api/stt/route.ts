import { createLogger, generateRequestId } from "@/lib/logger";
import { Speech } from "@/module/speech";

const speech = new Speech({
  sttProvider: "whisper",
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const log = createLogger("STT", requestId);
  const startTime = Date.now();

  log.info("Request received");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = formData.get("language") as string | null;
    const model = formData.get("model") as string | null;

    log.info("Request parameters", {
      audioFile: audioFile
        ? {
            name: audioFile.name,
            type: audioFile.type,
            size: `${(audioFile.size / 1024).toFixed(2)} KB`,
          }
        : null,
      language: language || "(auto-detect)",
      model: model || "(default)",
    });

    if (!audioFile) {
      log.warn("Rejected: No audio file provided");
      return Response.json(
        { ok: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    log.debug("Converting audio file to buffer");
    const audioBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    log.info("Sending to Whisper for transcription", {
      bufferSize: `${(audioData.length / 1024).toFixed(2)} KB`,
    });
    const sttStartTime = Date.now();
    const result = await speech.speechToText(audioData, {
      language: language || undefined,
      model: model || undefined,
    });
    const sttDuration = Date.now() - sttStartTime;

    if (!result.ok) {
      log.error("Transcription failed", {
        error: result.error,
        sttDuration: `${sttDuration}ms`,
      });
      return Response.json(result, { status: 500 });
    }

    const totalDuration = Date.now() - startTime;

    log.info("Request completed", {
      transcribedText: result.text,
      detectedLanguage: result.language || "(not provided)",
      textLength: result.text.length,
      sttDuration: `${sttDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });

    return Response.json(result);
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
