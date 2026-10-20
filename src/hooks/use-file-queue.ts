"use client";

import { useCallback, useRef, useState } from "react";
import { validateFileBatch } from "@/lib/files/validation";

export function useFileQueue({
  validate,
  multiple = true,
  maxFiles = 20,
}: {
  validate: (file: File) => string | null;
  multiple?: boolean;
  maxFiles?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const filesRef = useRef<File[]>([]);

  const commit = useCallback((next: File[]) => {
    filesRef.current = next;
    setFiles(next);
  }, []);

  const add = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;

      const current = filesRef.current;
      const limit = multiple ? maxFiles : 1;
      const room = Math.max(limit - current.length, 0);
      const acceptedErrors: string[] = [];

      if (room === 0) {
        setError(
          multiple
            ? `You can add up to ${maxFiles} files at a time. Remove a file before adding another.`
            : "Remove the current file before choosing another.",
        );
        return;
      }

      const currentSize = current.reduce((total, file) => total + file.size, 0);
      const candidates = incoming.slice(0, room);
      const { accepted, errors } = validateFileBatch(candidates, validate, currentSize);
      acceptedErrors.push(...errors);

      if (incoming.length > room) {
        acceptedErrors.push(
          multiple
            ? `Only ${room} more file${room === 1 ? "" : "s"} could be added. The limit is ${maxFiles}.`
            : "Only one file can be selected for this tool.",
        );
      }

      if (!multiple) {
        const only = accepted[0];
        if (only) {
          commit([only]);
          setError(acceptedErrors[0] ?? null);
        } else {
          setError(acceptedErrors[0] ?? "The selected file could not be added.");
        }
        return;
      }

      if (accepted.length > 0) {
        commit([...current, ...accepted]);
      }
      setError(acceptedErrors[0] ?? null);
    },
    [commit, maxFiles, multiple, validate],
  );

  const remove = useCallback(
    (index: number) => {
      const next = filesRef.current.filter((_, fileIndex) => fileIndex !== index);
      commit(next);
      setError(null);
    },
    [commit],
  );

  const move = useCallback(
    (from: number, to: number) => {
      const current = filesRef.current;
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= current.length ||
        to >= current.length
      ) {
        return;
      }
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(to, 0, moved);
      commit(next);
    },
    [commit],
  );

  const clear = useCallback(() => {
    commit([]);
    setError(null);
  }, [commit]);

  return {
    files,
    error,
    add,
    remove,
    move,
    clear,
    totalSize: files.reduce((total, file) => total + file.size, 0),
  };
}
