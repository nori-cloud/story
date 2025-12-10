import { useState, useEffect, useCallback, useRef } from "react";
import { DataLoader } from "./data/loader";
import { profilerPrompt } from "./prompt";
import { DeepSeekAI, type ChatMessage } from "./ai/deepseek";

export class Profiler {
  private ai: DeepSeekAI | null = null;
  private dataLoader: DataLoader;

  constructor(
    private config: {
      urls: string[];
      apiKey?: string;
      maxHistoryMessages?: number;
    },
  ) {
    this.dataLoader = new DataLoader();
  }

  async initialize(): Promise<void> {
    const result = await this.dataLoader.fromUrls(this.config.urls);

    if (!result.ok) {
      throw new Error(`Failed to load data: ${result.error}`);
    }

    const systemPrompt = profilerPrompt(result.text);

    this.ai = new DeepSeekAI({
      systemPrompt,
      apiKey: this.config.apiKey,
      maxHistoryMessages: this.config.maxHistoryMessages,
    });
  }

  async chat(message: string): Promise<string> {
    if (!this.ai) {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    return this.ai.chat(message);
  }

  getHistory(): ChatMessage[] {
    if (!this.ai) {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    return this.ai.getHistory();
  }

  clearHistory(): void {
    if (!this.ai) {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    this.ai.clearHistory();
  }

  getTokenCount(): number {
    if (!this.ai) {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    return this.ai.getTokenCount();
  }

  getSystemPrompt(): string {
    if (!this.ai) {
      throw new Error("Profiler not initialized. Call initialize() first.");
    }
    return this.ai.getSystemPrompt();
  }
}

export interface UseProfilerConfig {
  urls: string[];
  apiKey?: string;
  maxHistoryMessages?: number;
}

export interface UseProfilerReturn {
  chat: (message: string) => Promise<void>;
  history: ChatMessage[];
  clearHistory: () => void;
  getTokenCount: () => number;
  isInitializing: boolean;
  initError: string | null;
  isChatting: boolean;
  chatError: string | null;
  isReady: boolean;
}

export function useProfiler(config: UseProfilerConfig): UseProfilerReturn {
  const [profiler, setProfiler] = useState<Profiler | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsInitializing(true);
      setInitError(null);

      try {
        const newProfiler = new Profiler({
          urls: configRef.current.urls,
          apiKey: configRef.current.apiKey,
          maxHistoryMessages: configRef.current.maxHistoryMessages,
        });

        await newProfiler.initialize();

        if (mounted) {
          setProfiler(newProfiler);
          setIsInitializing(false);
        }
      } catch (error) {
        if (mounted) {
          setInitError(
            error instanceof Error ? error.message : "Failed to initialize profiler",
          );
          setIsInitializing(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const chat = useCallback(
    async (message: string) => {
      if (!profiler) {
        setChatError("Profiler not initialized");
        return;
      }

      setIsChatting(true);
      setChatError(null);

      try {
        await profiler.chat(message);
        setHistory(profiler.getHistory());
      } catch (error) {
        setChatError(
          error instanceof Error ? error.message : "Failed to send message",
        );
      } finally {
        setIsChatting(false);
      }
    },
    [profiler],
  );

  const clearHistory = useCallback(() => {
    if (profiler) {
      profiler.clearHistory();
      setHistory([]);
    }
  }, [profiler]);

  const getTokenCount = useCallback(() => {
    return profiler?.getTokenCount() ?? 0;
  }, [profiler]);

  return {
    chat,
    history,
    clearHistory,
    getTokenCount,
    isInitializing,
    initError,
    isChatting,
    chatError,
    isReady: !isInitializing && !initError && profiler !== null,
  };
}
