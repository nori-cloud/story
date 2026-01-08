type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  duration?: number;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

function formatMessage(
  level: LogLevel,
  tag: string,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const requestIdStr = context?.requestId ? ` [${context.requestId}]` : "";
  return `${timestamp} [${level.toUpperCase()}] [${tag}]${requestIdStr} ${message}`;
}

function logWithContext(
  level: LogLevel,
  tag: string,
  message: string,
  context?: LogContext
): void {
  if (!shouldLog(level)) return;

  const formattedMsg = formatMessage(level, tag, message, context);
  const logFn = console[level] || console.log;

  if (context && Object.keys(context).length > 0) {
    const { requestId, ...rest } = context;
    if (Object.keys(rest).length > 0) {
      logFn(formattedMsg, rest);
    } else {
      logFn(formattedMsg);
    }
  } else {
    logFn(formattedMsg);
  }
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createLogger(tag: string, requestId?: string) {
  const ctx = { requestId };

  return {
    debug: (message: string, context?: LogContext) =>
      logWithContext("debug", tag, message, { ...ctx, ...context }),

    info: (message: string, context?: LogContext) =>
      logWithContext("info", tag, message, { ...ctx, ...context }),

    warn: (message: string, context?: LogContext) =>
      logWithContext("warn", tag, message, { ...ctx, ...context }),

    error: (message: string, context?: LogContext) =>
      logWithContext("error", tag, message, { ...ctx, ...context }),

    withDuration: (startTime: number) => ({
      debug: (message: string, context?: LogContext) =>
        logWithContext("debug", tag, message, {
          ...ctx,
          ...context,
          duration: Date.now() - startTime,
        }),
      info: (message: string, context?: LogContext) =>
        logWithContext("info", tag, message, {
          ...ctx,
          ...context,
          duration: Date.now() - startTime,
        }),
      warn: (message: string, context?: LogContext) =>
        logWithContext("warn", tag, message, {
          ...ctx,
          ...context,
          duration: Date.now() - startTime,
        }),
      error: (message: string, context?: LogContext) =>
        logWithContext("error", tag, message, {
          ...ctx,
          ...context,
          duration: Date.now() - startTime,
        }),
    }),
  };
}

export type Logger = ReturnType<typeof createLogger>;
