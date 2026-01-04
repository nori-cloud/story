import Link from "next/link";

export default function InternalDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Internal Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Debug and testing tools for development and staging environments.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/internal/debug"
          className="block p-6 border rounded-lg hover:border-foreground transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Debug Tools</h2>
          <p className="text-sm text-muted-foreground">
            Testing and debugging utilities
          </p>
        </Link>

        <Link
          href="/internal/speech"
          className="block p-6 border rounded-lg hover:border-foreground transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Speech Module</h2>
          <p className="text-sm text-muted-foreground">
            Speech-to-text and text-to-speech testing
          </p>
        </Link>
      </div>
    </div>
  );
}
