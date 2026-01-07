import { AudioChatTester } from "./audio-chat-tester";
import { STTTester } from "./stt-tester";
import { WakeWordTester } from "@/speech/components/wake-word-tester";

export default function SpeechPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Speech Module</h1>

      <div className="space-y-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wake Word Detection</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Test Porcupine wake word detection with real-time audio visualization.
          </p>
          <WakeWordTester />
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Audio Chat (PTT)</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Debug interface for audio chat with full parameter controls for Whisper STT and Kokoro TTS.
          </p>
          <AudioChatTester />
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Text-to-Speech</h2>
          <p className="text-muted-foreground text-sm">
            TTS testing tools will go here
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Speech-to-Text</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Test the Whisper STT provider by recording audio or uploading an audio file.
          </p>
          <STTTester />
        </section>
      </div>
    </div>
  );
}
