export default function DebugPage() {
  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    appEnv: process.env.NEXT_PUBLIC_STORY_APP_ENV,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>

      <div className="space-y-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-4">
              <span className="text-muted-foreground">NODE_ENV:</span>
              <span>{envInfo.nodeEnv}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">APP_ENV:</span>
              <span>{envInfo.appEnv || "not set"}</span>
            </div>
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
