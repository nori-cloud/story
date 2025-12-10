import type { NextApiRequest, NextApiResponse } from "next";
import { getProfilerSessionStore } from "@/module/profiler/services/profiler-session";
import type { ChatMessage } from "@/module/profiler";

type InitRequest = {
  action: "init";
  urls: string[];
  maxHistoryMessages?: number;
};

type ChatRequest = {
  action: "chat";
  sessionId: string;
  message: string;
};

type ClearRequest = {
  action: "clear";
  sessionId: string;
};

type GetTokenCountRequest = {
  action: "getTokenCount";
  sessionId: string;
};

type GetHistoryRequest = {
  action: "getHistory";
  sessionId: string;
};

type DeleteSessionRequest = {
  action: "delete";
  sessionId: string;
};

type RequestBody =
  | InitRequest
  | ChatRequest
  | ClearRequest
  | GetTokenCountRequest
  | GetHistoryRequest
  | DeleteSessionRequest;

type InitResponse = {
  success: true;
  sessionId: string;
};

type ChatResponse = {
  success: true;
  response: string;
  history: ChatMessage[];
  tokenCount: number;
};

type ClearResponse = {
  success: true;
};

type GetTokenCountResponse = {
  success: true;
  tokenCount: number;
};

type GetHistoryResponse = {
  success: true;
  history: ChatMessage[];
};

type DeleteSessionResponse = {
  success: true;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type ResponseBody =
  | InitResponse
  | ChatResponse
  | ClearResponse
  | GetTokenCountResponse
  | GetHistoryResponse
  | DeleteSessionResponse
  | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body as RequestBody;

  try {
    const store = getProfilerSessionStore();

    switch (body.action) {
      case "init": {
        if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: "URLs array is required" });
        }

        const sessionId = await store.create(body.urls, body.maxHistoryMessages);
        return res.status(200).json({ success: true, sessionId });
      }

      case "chat": {
        if (!body.sessionId || !body.message) {
          return res.status(400).json({
            success: false,
            error: "sessionId and message are required",
          });
        }

        const response = await store.chat(body.sessionId, body.message);
        const history = store.getHistory(body.sessionId);
        const tokenCount = store.getTokenCount(body.sessionId);

        return res
          .status(200)
          .json({ success: true, response, history, tokenCount });
      }

      case "clear": {
        if (!body.sessionId) {
          return res
            .status(400)
            .json({ success: false, error: "sessionId is required" });
        }

        store.clearHistory(body.sessionId);
        return res.status(200).json({ success: true });
      }

      case "getTokenCount": {
        if (!body.sessionId) {
          return res
            .status(400)
            .json({ success: false, error: "sessionId is required" });
        }

        const tokenCount = store.getTokenCount(body.sessionId);
        return res.status(200).json({ success: true, tokenCount });
      }

      case "getHistory": {
        if (!body.sessionId) {
          return res
            .status(400)
            .json({ success: false, error: "sessionId is required" });
        }

        const history = store.getHistory(body.sessionId);
        return res.status(200).json({ success: true, history });
      }

      case "delete": {
        if (!body.sessionId) {
          return res
            .status(400)
            .json({ success: false, error: "sessionId is required" });
        }

        store.delete(body.sessionId);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ success: false, error: "Invalid action" });
    }
  } catch (error) {
    console.error("Profiler API error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
