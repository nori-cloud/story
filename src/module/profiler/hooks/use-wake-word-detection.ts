import { useRef, useCallback, useState } from "react";

interface WakeWordOptions {
  wakeWord: string; // e.g., "hey story"
  silenceThreshold: number; // 0-255, typical ~30-50
  silenceDuration: number; // milliseconds of silence before stopping
  sampleInterval: number; // how often to check for wake word (ms)
  sampleDuration: number; // duration of audio to sample for wake word detection (ms)
}

interface WakeWordCallbacks {
  onWakeWordDetected?: () => void;
  onTranscriptionComplete?: (text: string, audioBlob: Blob) => void;
  onError?: (error: Error) => void;
}

export function useWakeWordDetection(options: WakeWordOptions, callbacks: WakeWordCallbacks) {
  const {
    wakeWord,
    silenceThreshold = 35,
    silenceDuration = 1500,
    sampleInterval = 1000,
    sampleDuration = 2000,
  } = options;

  const { onWakeWordDetected, onTranscriptionComplete, onError } = callbacks;

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio infrastructure
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Timers and monitoring
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const levelCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State tracking
  const lastSoundTimeRef = useRef<number>(Date.now());
  const isCheckingWakeWordRef = useRef(false);

  // Calculate average audio level
  const getAudioLevel = useCallback((): number => {
    if (!analyserRef.current) return 0;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = Math.abs(dataArray[i] - 128);
      sum += normalized;
    }

    return sum / bufferLength;
  }, []);

  // Check if audio contains the wake word
  const checkForWakeWord = useCallback(
    async (audioBlob: Blob): Promise<boolean> => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob);

        const response = await fetch("/api/stt", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.ok && result.text) {
          const transcription = result.text.toLowerCase();
          const wakeWordLower = wakeWord.toLowerCase();

          console.log("[Wake Word] Transcription:", transcription);

          return transcription.includes(wakeWordLower);
        }

        return false;
      } catch (error) {
        console.error("[Wake Word] Check error:", error);
        return false;
      }
    },
    [wakeWord]
  );

  // Record a short audio sample for wake word detection
  const recordSample = useCallback(async (): Promise<Blob | null> => {
    if (!streamRef.current) return null;

    return new Promise((resolve) => {
      const recorder = new MediaRecorder(streamRef.current!, {
        mimeType: "audio/webm",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        resolve(blob);
      };

      recorder.start();

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, sampleDuration);
    });
  }, [sampleDuration]);

  // Start continuous recording after wake word detected
  const startContinuousRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    console.log("[Wake Word] Started continuous recording");

    // Start monitoring for silence
    lastSoundTimeRef.current = Date.now();

    levelCheckIntervalRef.current = setInterval(() => {
      const level = getAudioLevel();
      setAudioLevel(level);

      if (level > silenceThreshold) {
        lastSoundTimeRef.current = Date.now();
      } else {
        const silenceDurationMs = Date.now() - lastSoundTimeRef.current;

        if (silenceDurationMs >= silenceDuration) {
          console.log("[Wake Word] Silence detected, stopping recording");
          stopContinuousRecording();
        }
      }
    }, 100); // Check every 100ms
  }, [getAudioLevel, silenceThreshold, silenceDuration]);

  // Stop continuous recording and process result
  const stopContinuousRecording = useCallback(() => {
    if (levelCheckIntervalRef.current) {
      clearInterval(levelCheckIntervalRef.current);
      levelCheckIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Transcribe the full recording
        const formData = new FormData();
        formData.append("audio", audioBlob);

        fetch("/api/stt", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.ok && result.text) {
              onTranscriptionComplete?.(result.text, audioBlob);
            }
          })
          .catch((error) => {
            onError?.(error);
          });

        setIsRecording(false);
      };

      mediaRecorderRef.current.stop();
    }
  }, [onTranscriptionComplete, onError]);

  // Monitor for wake word
  const monitorForWakeWord = useCallback(async () => {
    if (isCheckingWakeWordRef.current) return;
    if (isRecording) return; // Don't check while recording full message

    const level = getAudioLevel();
    setAudioLevel(level);

    // Only check for wake word if there's audio activity
    if (level < silenceThreshold) return;

    isCheckingWakeWordRef.current = true;

    try {
      console.log("[Wake Word] Audio detected, sampling...");
      const sample = await recordSample();

      if (sample) {
        const detected = await checkForWakeWord(sample);

        if (detected) {
          console.log("[Wake Word] Wake word detected!");
          onWakeWordDetected?.();
          startContinuousRecording();
        } else {
          console.log("[Wake Word] No wake word in sample");
        }
      }
    } catch (error) {
      console.error("[Wake Word] Monitoring error:", error);
      onError?.(error as Error);
    } finally {
      isCheckingWakeWordRef.current = false;
    }
  }, [
    isRecording,
    getAudioLevel,
    silenceThreshold,
    recordSample,
    checkForWakeWord,
    onWakeWordDetected,
    startContinuousRecording,
    onError,
  ]);

  // Start listening for wake word
  const startListening = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      setIsListening(true);

      // Start monitoring
      monitoringIntervalRef.current = setInterval(() => {
        monitorForWakeWord();
      }, sampleInterval);

      console.log("[Wake Word] Started listening");
    } catch (error) {
      console.error("[Wake Word] Failed to start listening:", error);
      onError?.(error as Error);
    }
  }, [monitorForWakeWord, sampleInterval, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    // Clear intervals
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (levelCheckIntervalRef.current) {
      clearInterval(levelCheckIntervalRef.current);
      levelCheckIntervalRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsListening(false);
    setIsRecording(false);
    setAudioLevel(0);

    console.log("[Wake Word] Stopped listening");
  }, []);

  return {
    isListening,
    isRecording,
    audioLevel,
    startListening,
    stopListening,
  };
}
