import { WakeWordTester } from "@/speech/components/wake-word-tester";

export default function VADPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Wake Word Test</h1>
          <p className="text-muted-foreground">
            Porcupine wake word detection
          </p>
        </div>

        <WakeWordTester />
      </div>
    </div>
  );
}
