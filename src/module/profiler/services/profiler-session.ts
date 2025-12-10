import { randomUUID } from "crypto";
import { Profiler } from "../profiler";
import type { ChatMessage } from "../ai/deepseek";

export interface ProfilerSession {
  id: string;
  profiler: Profiler;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class ProfilerSessionStore {
  private sessions: Map<string, ProfilerSession>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  async create(urls: string[], maxHistoryMessages?: number): Promise<string> {
    const profiler = new Profiler({
      urls,
      apiKey: process.env.DEEPSEEK_API_KEY,
      maxHistoryMessages,
    });

    await profiler.initialize();

    const id = randomUUID();
    const now = new Date();

    this.sessions.set(id, {
      id,
      profiler,
      createdAt: now,
      lastAccessedAt: now,
    });

    return id;
  }

  get(sessionId: string): ProfilerSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = new Date();
      return session;
    }
    return null;
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  async chat(sessionId: string, message: string): Promise<string> {
    const session = this.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    return session.profiler.chat(message);
  }

  getHistory(sessionId: string): ChatMessage[] {
    const session = this.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    return session.profiler.getHistory();
  }

  clearHistory(sessionId: string): void {
    const session = this.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    session.profiler.clearHistory();
  }

  getTokenCount(sessionId: string): number {
    const session = this.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    return session.profiler.getTokenCount();
  }

  private startCleanup(): void {
    // Clean up sessions older than 1 hour every 10 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        for (const [id, session] of this.sessions.entries()) {
          if (session.lastAccessedAt < oneHourAgo) {
            this.sessions.delete(id);
          }
        }
      },
      10 * 60 * 1000,
    );
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
let store: ProfilerSessionStore | null = null;

export function getProfilerSessionStore(): ProfilerSessionStore {
  if (!store) {
    store = new ProfilerSessionStore();
  }
  return store;
}
