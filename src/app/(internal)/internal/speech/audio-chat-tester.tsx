"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  audioUrl?: string;
};

type ChatStatus = "idle" | "recording" | "transcribing" | "generating" | "speaking";

export function AudioChatTester() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Waveform refs
  const recordingCanvasRef = useRef<HTMLCanvasElement>(null);
  const playbackCanvasRef = useRef<HTMLCanvasElement>(null);

  // Whisper parameters
  const [whisperLanguage, setWhisperLanguage] = useState("");
  const [whisperModel, setWhisperModel] = useState("");

  // Kokoro parameters
  const [kokoroVoice, setKokoroVoice] = useState("af_sky");
  const [kokoroSpeed, setKokoroSpeed] = useState("1.0");

  // Current playback
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const drawWaveform = (canvas: HTMLCanvasElement, dataArray: Uint8Array, bufferLength: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(34, 197, 94)";
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const visualizeRecording = () => {
    if (!analyserRef.current || !recordingCanvasRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current || !recordingCanvasRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      drawWaveform(recordingCanvasRef.current, dataArray, bufferLength);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus("recording");
      visualizeRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setStatus("transcribing");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      if (whisperLanguage) {
        formData.append("language", whisperLanguage);
      }
      if (whisperModel) {
        formData.append("model", whisperModel);
      }

      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          text: result.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Generate AI response
        await handleAIResponse(result.text);
      } else {
        alert(`Transcription failed: ${result.error}`);
        setStatus("idle");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio");
      setStatus("idle");
    }
  };

  const handleAIResponse = async (userText: string) => {
    setStatus("generating");

    // Read back the transcribed text
    const aiText = userText;

    try {
      // Generate TTS
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: aiText,
          voiceId: kokoroVoice,
          speed: kokoroSpeed,
        }),
      });

      if (!response.ok) {
        throw new Error("TTS generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        text: aiText,
        timestamp: new Date(),
        audioUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Play audio
      setStatus("speaking");
      await playAudio(audioUrl);
      setStatus("idle");
    } catch (error) {
      console.error("AI response error:", error);
      alert("Failed to generate AI response");
      setStatus("idle");
    }
  };

  const playAudio = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        resolve();
      };

      audio.onerror = () => {
        reject(new Error("Audio playback failed"));
      };

      audio.play().catch(reject);
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case "recording":
        return "bg-red-500";
      case "transcribing":
        return "bg-yellow-500";
      case "generating":
        return "bg-blue-500";
      case "speaking":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "recording":
        return "Recording...";
      case "transcribing":
        return "Transcribing...";
      case "generating":
        return "Generating response...";
      case "speaking":
        return "Speaking...";
      default:
        return "Ready";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status !== "idle" ? "animate-pulse" : ""}`} />
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Recording Waveform */}
      <div className="border rounded-lg p-4 bg-black">
        <h3 className="text-sm font-medium mb-2 text-white">Recording Waveform</h3>
        <canvas
          ref={recordingCanvasRef}
          width={800}
          height={100}
          className="w-full h-24 bg-black"
        />
      </div>

      {/* PTT Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={status !== "idle" && status !== "recording"}
          className="w-32 h-32 rounded-full text-lg font-bold"
        >
          {isRecording ? "Release" : "Hold to Talk"}
        </Button>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Whisper Parameters */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Whisper STT Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Language (ISO-639-1)</label>
              <Input
                type="text"
                placeholder="e.g., en, es, fr (leave empty for auto)"
                value={whisperLanguage}
                onChange={(e) => setWhisperLanguage(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Model</label>
              <Input
                type="text"
                placeholder="e.g., whisper-1 (leave empty for default)"
                value={whisperModel}
                onChange={(e) => setWhisperModel(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Kokoro Parameters */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Kokoro TTS Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Voice ID</label>
              <Input
                type="text"
                placeholder="e.g., af_sky"
                value={kokoroVoice}
                onChange={(e) => setKokoroVoice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: af_sky, af_bella, af_sarah, am_adam, am_michael, etc.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Speed</label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                placeholder="1.0"
                value={kokoroSpeed}
                onChange={(e) => setKokoroSpeed(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Range: 0.5 - 2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Chat History</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Hold the button to start talking!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-50 dark:bg-blue-950"
                    : "bg-green-50 dark:bg-green-950"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mb-2">{message.text}</p>
                {message.audioUrl && (
                  <audio controls src={message.audioUrl} className="w-full h-8" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clear History */}
      {messages.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setMessages([])}
          >
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}
