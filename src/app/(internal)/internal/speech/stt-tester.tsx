"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

type TranscriptionResult = {
  ok: true;
  text: string;
  language?: string;
} | {
  ok: false;
  error: string;
};

export function STTTester() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe the audio
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Failed to access microphone",
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Transcription failed",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResult(null);

    // Create audio URL for playback
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    await transcribeAudio(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setResult(null);
    setAudioUrl(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          disabled={isTranscribing}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || isTranscribing}
        >
          Upload Audio File
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {(result || audioUrl) && (
          <Button variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Recording...
        </div>
      )}

      {isTranscribing && (
        <p className="text-sm text-muted-foreground">Transcribing...</p>
      )}

      {audioUrl && !isRecording && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Audio:</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Result:</p>
          {result.ok ? (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{result.text}</p>
              {result.language && (
                <p className="text-xs text-muted-foreground mt-2">
                  Detected language: {result.language}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm">Error: {result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
