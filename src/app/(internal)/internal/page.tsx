import Link from "next/link";

export default function InternalDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Internal Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Debug and testing tools for development and staging environments.
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Testing Modules</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/internal/speech"
              className="block p-6 border rounded-lg hover:border-foreground transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Speech Module</h3>
              <p className="text-sm text-muted-foreground">
                Speech-to-text and text-to-speech testing
              </p>
            </Link>
          </div>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Add your debug and testing utilities here
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
