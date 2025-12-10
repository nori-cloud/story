import { useState, useCallback } from "react";
import { DataLoader, type LoadResult } from "@/module/profiler";
import { Button } from "@/components/ui/button";

export default function ProfilerDebugPage() {
  const { inputUrls, setInputUrls, result, isLoading, error, loadData } =
    useProfilerDebug();

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Profiler Debug Interface</h1>

        <div className="space-y-2">
          <label htmlFor="urls" className="text-sm font-medium">
            Input URLs (one per line):
          </label>
          <textarea
            id="urls"
            value={inputUrls}
            onChange={(e) => setInputUrls(e.target.value)}
            placeholder="https://jsonplaceholder.typicode.com/posts/1&#10;https://jsonplaceholder.typicode.com/users/1"
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <Button onClick={loadData} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load Data"}
        </Button>

        {isLoading && (
          <div className="rounded-md border bg-muted p-4">
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-500">Error: {error}</p>
          </div>
        )}

        {result && result.ok && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              Success! Loaded data
            </p>
            <div className="whitespace-pre-wrap text-sm max-h-[30vh] overflow-y-auto rounded-md border bg-gray-50 p-4 text-gray-500">
              {result.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function useProfilerDebug() {
  const [inputUrls, setInputUrls] = useState("");
  const [result, setResult] = useState<LoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const urls = inputUrls
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (urls.length === 0) {
        setError("Please enter at least one URL");
        return;
      }

      const invalidUrls = urls.filter(
        (url) => !url.startsWith("http://") && !url.startsWith("https://"),
      );
      if (invalidUrls.length > 0) {
        setError(`Invalid URLs: ${invalidUrls.join(", ")}`);
        return;
      }

      const loader = new DataLoader();
      const loadResult = await loader.fromUrls(urls);
      setResult(loadResult);

      if (!loadResult.ok) {
        setError(loadResult.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputUrls]);

  return {
    inputUrls,
    setInputUrls,
    result,
    isLoading,
    error,
    loadData,
  };
}
