import { Speech } from "@/module/speech";

const speech = new Speech({
  sttProvider: "whisper",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = formData.get("language") as string | null;

    if (!audioFile) {
      return Response.json(
        { ok: false, error: "No audio file provided" },
        { status: 400 },
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    const result = await speech.speechToText(audioData, {
      language: language || undefined,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
