"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export function PdfPageThumbnail({
  document,
  pageNumber,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    async function render() {
      try {
        const page = await document.getPage(pageNumber);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.55 });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);

        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
        });
        await renderTask.promise;
      } catch (renderError) {
        if (cancelled) return;
        const name =
          renderError && typeof renderError === "object" && "name" in renderError
            ? String((renderError as { name?: unknown }).name)
            : "";
        if (name !== "RenderingCancelledException") {
          setError(true);
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [document, pageNumber]);

  if (error) {
    return (
      <div className="grid h-full w-full place-items-center bg-background/60 p-2 text-center text-[10px] text-muted-foreground">
        Preview unavailable
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full object-contain"
      aria-hidden="true"
    />
  );
}
