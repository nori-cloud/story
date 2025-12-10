import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/module/profiler";
import { Button } from "@/components/ui/button";

export default function ProfilerDebugPage() {
  const [inputUrls, setInputUrls] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [message, setMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleInitialize = useCallback(async () => {
    const parsedUrls = inputUrls
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (parsedUrls.length === 0) {
      alert("Please enter at least one URL");
      return;
    }

    const invalidUrls = parsedUrls.filter(
      (url) => !url.startsWith("http://") && !url.startsWith("https://"),
    );
    if (invalidUrls.length > 0) {
      alert(`Invalid URLs: ${invalidUrls.join(", ")}`);
      return;
    }

    setIsInitializing(true);
    setInitError(null);

    try {
      const response = await fetch("/api/profiler/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "init",
          urls: parsedUrls,
          maxHistoryMessages: 40,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSessionId(data.sessionId);
      setHistory([]);
      setTokenCount(0);
    } catch (error) {
      setInitError(
        error instanceof Error ? error.message : "Failed to initialize profiler",
      );
    } finally {
      setIsInitializing(false);
    }
  }, [inputUrls]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !sessionId) return;

    const userMessage = message;
    setMessage("");
    setIsChatting(true);
    setChatError(null);

    try {
      const response = await fetch("/api/profiler/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          sessionId,
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setHistory(data.history);
      setTokenCount(data.tokenCount);
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setIsChatting(false);
    }
  }, [message, sessionId]);

  const handleClearHistory = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch("/api/profiler/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear",
          sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setHistory([]);
      setTokenCount(0);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, [sessionId]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch("/api/profiler/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            sessionId,
          }),
        }).catch(() => {
          // Ignore errors on cleanup
        });
      }
    };
  }, [sessionId]);

  const isReady = sessionId !== null && !isInitializing && !initError;

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profiler Debug Interface</h1>
          {isReady && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Tokens: {tokenCount}
              </span>
              <span className="text-sm text-green-600">● Ready</span>
            </div>
          )}
        </div>

        {/* URL Configuration */}
        <div className="space-y-2 rounded-lg border bg-card p-4">
          <label htmlFor="urls" className="text-sm font-medium">
            Data Source URLs (one per line):
          </label>
          <textarea
            id="urls"
            value={inputUrls}
            onChange={(e) => setInputUrls(e.target.value)}
            placeholder="https://example.com/about.txt&#10;https://example.com/resume.md"
            rows={3}
            disabled={isInitializing || isReady}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {!isReady && (
            <Button
              onClick={handleInitialize}
              disabled={!inputUrls.trim() || isInitializing}
            >
              {isInitializing ? "Initializing..." : "Initialize Profiler"}
            </Button>
          )}
        </div>

        {/* Initialization Status */}
        {isInitializing && (
          <div className="rounded-md border bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Loading data and initializing profiler...
            </p>
          </div>
        )}

        {initError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-500">
              Initialization Error: {initError}
            </p>
          </div>
        )}

        {/* Chat Interface */}
        {isReady && (
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                disabled={history.length === 0}
              >
                Clear History
              </Button>
            </div>

            {/* Chat History */}
            <div className="max-h-[40vh] space-y-3 overflow-y-auto rounded-md border bg-background p-4">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start a conversation!
                </p>
              ) : (
                history.map(([role, content], i) => (
                  <div
                    key={i}
                    className={`flex ${
                      role === "human" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        role === "human"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="mb-1 text-xs font-semibold opacity-70">
                        {role === "human" ? "You" : "AI"}
                      </div>
                      <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Error */}
            {chatError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-500">Chat Error: {chatError}</p>
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={2}
                disabled={isChatting}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isChatting || !message.trim()}
                className="self-end"
              >
                {isChatting ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {isReady && history.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Debug Information</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="font-mono text-xs">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <span className="font-mono">{history.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tokens:</span>
                <span className="font-mono">{tokenCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Max History:</span>
                <span className="font-mono">40 messages</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
