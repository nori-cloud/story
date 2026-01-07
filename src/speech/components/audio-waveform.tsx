"use client";

import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ isActive, className = "" }: AudioWaveformProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(50).fill(0));

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setupAudioVisualization();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isActive]);

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      visualize();
    } catch (err) {
      console.error('Failed to setup audio visualization:', err);
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate average level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = Math.abs(dataArray[i] - 128);
      sum += normalized;
    }
    const average = sum / bufferLength;

    // Update audio levels for waveform
    setAudioLevels(prev => [...prev.slice(1), average]);

    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevels(new Array(50).fill(0));
  };

  return (
    <div className={className}>
      <div className="bg-black rounded-lg p-4 h-32 flex items-center justify-center">
        <div className="flex items-center justify-center gap-1 h-full w-full">
          {audioLevels.map((level, i) => (
            <div
              key={`waveform-${i}`}
              className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-sm transition-all duration-75"
              style={{
                height: `${Math.max(2, (level / 128) * 100)}%`,
                opacity: i / audioLevels.length,
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Real-time audio level visualization
      </p>
    </div>
  );
}
