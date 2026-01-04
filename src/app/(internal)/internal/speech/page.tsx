export default function SpeechPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Speech Module</h1>

      <div className="space-y-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Text-to-Speech</h2>
          <p className="text-muted-foreground text-sm">
            TTS testing tools will go here
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Speech-to-Text</h2>
          <p className="text-muted-foreground text-sm">
            STT testing tools will go here
          </p>
        </section>
      </div>
    </div>
  );
}
