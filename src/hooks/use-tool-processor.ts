"use client";

import { useCallback, useRef, useState } from "react";
import { normalizePdfError } from "@/lib/pdf/errors";
import type { ToolResult } from "@/types/pdf";

export type ProcessorStatus = "idle" | "processing" | "success" | "error";

type ProcessorState = {
  status: ProcessorStatus;
  error: string | null;
  result: ToolResult | null;
};

const INITIAL_STATE: ProcessorState = {
  status: "idle",
  error: null,
  result: null,
};

export function useToolProcessor() {
  const [state, setState] = useState<ProcessorState>(INITIAL_STATE);
  const statusRef = useRef<ProcessorStatus>("idle");

  const run = useCallback(async (task: () => Promise<ToolResult>) => {
    if (statusRef.current === "processing") return;

    statusRef.current = "processing";
    setState({ status: "processing", error: null, result: null });

    try {
      const result = await task();
      statusRef.current = "success";
      setState({ status: "success", error: null, result });
    } catch (error) {
      statusRef.current = "error";
      setState({
        status: "error",
        error: normalizePdfError(error),
        result: null,
      });
    }
  }, []);

  const fail = useCallback((message: string) => {
    if (statusRef.current === "processing") return;
    statusRef.current = "error";
    setState({ status: "error", error: message, result: null });
  }, []);

  const reset = useCallback(() => {
    if (statusRef.current === "processing") return;
    statusRef.current = "idle";
    setState(INITIAL_STATE);
  }, []);

  return {
    status: state.status,
    error: state.error,
    result: state.result,
    isProcessing: state.status === "processing",
    run,
    fail,
    reset,
  };
}
