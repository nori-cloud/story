"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWakeWord } from "@/speech/hooks/use-wake-word";
import { AudioWaveform } from "@/speech/components/audio-waveform";
import { useState, useEffect } from "react";

export function WakeWordTester() {
  const [enabled, setEnabled] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);

  const {
    isLoaded,
    isListening,
    isRecording,
    error,
    startListening,
    stopListening,
  } = useWakeWord();

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);

    if (checked) {
      await startListening();
    } else {
      stopListening();
    }
  };

  // Track wake word detections
  useEffect(() => {
    if (isRecording) {
      setDetectionCount(prev => prev + 1);
    }
  }, [isRecording]);

  const getStatusColor = () => {
    if (isRecording) return "bg-red-500";
    if (isListening) return "bg-green-500";
    if (isLoaded) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (isRecording) return "🎤 Wake word detected!";
    if (isListening) return "👂 Listening for wake word...";
    if (isLoaded) return "✅ Ready - Toggle to start";
    return "⏳ Loading Porcupine...";
  };

  return (
    <div className="space-y-6">
      {/* Main Control */}
      <div className="border-2 rounded-lg p-8 bg-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Label htmlFor="enable-toggle" className="text-lg font-semibold">
              Enable Detection
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Toggle to start/stop listening
            </p>
          </div>
          <Switch
            id="enable-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            className="scale-150"
          />
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div
            className={`w-4 h-4 rounded-full ${getStatusColor()} ${
              isListening || isRecording ? "animate-pulse" : ""
            }`}
          />
          <span className="font-medium text-lg">{getStatusText()}</span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            <strong>Error:</strong> {error.toString()}
          </div>
        )}
      </div>

      {/* Audio Waveform Visualizer */}
      {isListening && (
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Audio Input</h2>
          <AudioWaveform isActive={isListening} />
        </div>
      )}

      {/* Detection Counter */}
      <div className="border rounded-lg p-6 bg-card text-center">
        <div className="text-6xl font-bold text-primary mb-2">
          {detectionCount}
        </div>
        <p className="text-muted-foreground">Wake word detections</p>
      </div>

      {/* Debug Info */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>isLoaded: {isLoaded ? "✅" : "❌"}</div>
          <div>isListening: {isListening ? "✅" : "❌"}</div>
          <div>isRecording: {isRecording ? "✅" : "❌"}</div>
          <div>error: {error ? "⚠️" : "✅"}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-3">How to Use</h2>
        <ol className="space-y-2 text-sm list-decimal list-inside">
          <li>Toggle the switch above to enable detection</li>
          <li>Wait for "Listening for wake word..." status</li>
          <li>Say your wake word (trained in your .ppn file)</li>
          <li>Watch the status change to "Wake word detected!"</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}
