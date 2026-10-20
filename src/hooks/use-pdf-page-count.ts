"use client";

import { useEffect, useState } from "react";
import { normalizePdfError } from "@/lib/pdf/errors";
import { readPdfPageCount } from "@/lib/pdf/client";

type PageCountState = {
  status: "idle" | "loading" | "ready" | "error";
  pageCount: number | null;
  error: string | null;
};

const INITIAL: PageCountState = { status: "idle", pageCount: null, error: null };

export function usePdfPageCount(file: File | null) {
  const [state, setState] = useState<PageCountState>(INITIAL);

  useEffect(() => {
    if (!file) {
      setState(INITIAL);
      return;
    }

    let cancelled = false;
    setState({ status: "loading", pageCount: null, error: null });

    readPdfPageCount(file)
      .then((pageCount) => {
        if (cancelled) return;
        if (pageCount < 1) {
          setState({
            status: "error",
            pageCount: null,
            error: "This PDF does not contain any pages.",
          });
          return;
        }
        setState({ status: "ready", pageCount, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          pageCount: null,
          error: normalizePdfError(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return state;
}
