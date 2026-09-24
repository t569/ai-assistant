import type { ApprovalDecision, LangGraphStreamEvent, UserBehaviorEvent } from "../types";

/**
 * Zero-computation LangGraph runtime adapter. This file does no reasoning, no token
 * accounting, no context management — it only relays bytes to/from `backendEndpoint`
 * over SSE and hands parsed events to the caller. All "brain" work lives remotely (§3).
 */

export interface InvokePayload {
  threadId: string;
  message?: string;
  behaviorEvents?: UserBehaviorEvent[];
  approvalDecision?: ApprovalDecision;
}

export interface LangGraphRuntime {
  invoke(payload: InvokePayload, onEvent: (event: LangGraphStreamEvent) => void): Promise<void>;
}

/** Splits a growing SSE buffer into complete `data: {...}` frames plus the unparsed remainder. */
export function extractSseFrames(buffer: string): { frames: string[]; remainder: string } {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";
  return { frames: parts, remainder };
}

/** Parses one SSE frame into a stream event. Returns null on malformed input rather than throwing. */
export function parseSseFrame(frame: string, threadId: string): LangGraphStreamEvent | null {
  const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
  if (!dataLine) return null;
  try {
    const parsed = JSON.parse(dataLine.slice("data:".length).trim()) as Partial<LangGraphStreamEvent>;
    return {
      threadId: parsed.threadId ?? threadId,
      node: parsed.node ?? null,
      actionStatus: parsed.actionStatus ?? "failed",
      state: parsed.state ?? {},
    };
  } catch {
    return null;
  }
}

export function createLangGraphRuntime(
  backendEndpoint: string,
  fetchImpl: typeof fetch = fetch,
): LangGraphRuntime {
  return {
    async invoke(payload, onEvent) {
      const response = await fetchImpl(backendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        onEvent({ threadId: payload.threadId, node: null, actionStatus: "failed", state: {} });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { frames, remainder } = extractSseFrames(buffer);
        buffer = remainder;
        for (const frame of frames) {
          const event = parseSseFrame(frame, payload.threadId);
          if (event) onEvent(event);
        }
      }
    },
  };
}
