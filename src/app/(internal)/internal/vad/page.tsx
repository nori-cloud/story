"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWakeWordDetection } from "@/module/profiler/hooks/use-wake-word-detection";
import { useState } from "react";

type TranscriptionResult = {
  id: string;
  text: string;
  timestamp: Date;
  audioUrl: string;
};

export default function VADPage() {
  const [enabled, setEnabled] = useState(false);
  const [results, setResults] = useState<TranscriptionResult[]>([]);

  // Configuration
  const [wakeWord, setWakeWord] = useState("hey story");
  const [silenceThreshold, setSilenceThreshold] = useState(35);
  const [silenceDuration, setSilenceDuration] = useState(1500);
  const [sampleInterval, setSampleInterval] = useState(1000);
  const [sampleDuration, setSampleDuration] = useState(2000);

  const { isListening, isRecording, audioLevel, startListening, stopListening } =
    useWakeWordDetection(
      {
        wakeWord,
        silenceThreshold,
        silenceDuration,
        sampleInterval,
        sampleDuration,
      },
      {
        onWakeWordDetected: () => {
          console.log("🎤 Wake word detected!");
        },
        onTranscriptionComplete: (text, audioBlob) => {
          console.log("📝 Transcription:", text);

          const audioUrl = URL.createObjectURL(audioBlob);
          const result: TranscriptionResult = {
            id: Date.now().toString(),
            text,
            timestamp: new Date(),
            audioUrl,
          };

          setResults((prev) => [result, ...prev]);
        },
        onError: (error) => {
          console.error("❌ Error:", error);
          alert(`Error: ${error.message}`);
        },
      }
    );

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);

    if (checked) {
      await startListening();
    } else {
      stopListening();
    }
  };

  const getStatusColor = () => {
    if (isRecording) return "bg-red-500";
    if (isListening) return "bg-green-500";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (isRecording) return "Recording...";
    if (isListening) return "Listening for wake word...";
    return "Disabled";
  };

  const audioLevelPercent = Math.min((audioLevel / 100) * 100, 100);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wake Word + VAD Prototype</h1>
        <p className="text-muted-foreground">
          Voice activation with &quot;{wakeWord}&quot; and automatic silence detection
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="enable-toggle" className="text-base font-semibold">
              Enable Wake Word Detection
            </Label>
            <p className="text-sm text-muted-foreground">
              Continuously listens for &quot;{wakeWord}&quot; in the background
            </p>
          </div>
          <Switch
            id="enable-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor()} ${
                isListening || isRecording ? "animate-pulse" : ""
              }`}
            />
            <span className="font-medium">{getStatusText()}</span>
          </div>

          {/* Audio Level Meter */}
          {isListening && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Audio Level</span>
                <span className="font-mono">{audioLevel.toFixed(1)}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    audioLevel > silenceThreshold ? "bg-green-500" : "bg-gray-400"
                  }`}
                  style={{ width: `${audioLevelPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Threshold: {silenceThreshold} (audio above this triggers wake word check)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wake-word">Wake Word</Label>
            <Input
              id="wake-word"
              value={wakeWord}
              onChange={(e) => setWakeWord(e.target.value)}
              disabled={isListening}
              placeholder="e.g., hey story"
            />
            <p className="text-xs text-muted-foreground">
              The phrase to activate recording
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence-threshold">Silence Threshold</Label>
            <Input
              id="silence-threshold"
              type="number"
              min="0"
              max="255"
              value={silenceThreshold}
              onChange={(e) => setSilenceThreshold(Number(e.target.value))}
              disabled={isListening}
            />
            <p className="text-xs text-muted-foreground">
              Audio level below this is considered silence (0-255)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence-duration">Silence Duration (ms)</Label>
            <Input
              id="silence-duration"
              type="number"
              min="500"
              max="5000"
              step="100"
              value={silenceDuration}
              onChange={(e) => setSilenceDuration(Number(e.target.value))}
              disabled={isListening}
            />
            <p className="text-xs text-muted-foreground">
              Stop recording after this much silence
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-interval">Sample Interval (ms)</Label>
            <Input
              id="sample-interval"
              type="number"
              min="500"
              max="3000"
              step="100"
              value={sampleInterval}
              onChange={(e) => setSampleInterval(Number(e.target.value))}
              disabled={isListening}
            />
            <p className="text-xs text-muted-foreground">
              How often to check for wake word
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-duration">Sample Duration (ms)</Label>
            <Input
              id="sample-duration"
              type="number"
              min="1000"
              max="5000"
              step="100"
              value={sampleDuration}
              onChange={(e) => setSampleDuration(Number(e.target.value))}
              disabled={isListening}
            />
            <p className="text-xs text-muted-foreground">
              Length of audio sample to check for wake word
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-3">How to Use</h2>
        <ol className="space-y-2 text-sm list-decimal list-inside">
          <li>Enable the toggle above to start listening</li>
          <li>Say &quot;{wakeWord}&quot; out loud</li>
          <li>After detection, continue speaking your message</li>
          <li>Stop talking - recording will auto-stop after {silenceDuration}ms of silence</li>
          <li>Your transcription will appear below</li>
        </ol>
      </div>

      {/* Transcription Results */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transcription Results</h2>
          {results.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setResults([])}>
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transcriptions yet. Say &quot;{wakeWord}&quot; to get started!
            </p>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold">Transcription</span>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mb-3">{result.text}</p>
                <audio controls src={result.audioUrl} className="w-full h-8" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Notes */}
      <div className="border rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950/20">
        <h2 className="text-xl font-semibold mb-3">⚠️ Performance Notes</h2>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>This prototype uses continuous microphone access while enabled</li>
          <li>Wake word detection sends audio samples to Whisper (network overhead)</li>
          <li>Battery drain may be noticeable on mobile devices</li>
          <li>Adjust sample interval and duration to balance responsiveness vs performance</li>
          <li>For production, consider a lightweight browser-side wake word model</li>
        </ul>
      </div>
    </div>
  );
}
