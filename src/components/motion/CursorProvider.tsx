"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { CursorState } from "@/config/cursor";

/**
 * Cursor architecture shell (Phase 1). Holds cursor state so sections can
 * declare intent via `useCursor()` / `data-cursor` today; the visible
 * cursor renderer + provider wiring land in Phase 2 (desktop only,
 * never on touch or reduced-motion).
 */
type CursorContextValue = {
  state: CursorState;
  setState: (s: CursorState) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>("DEFAULT");
  const value = useMemo(() => ({ state, setState }), [state]);
  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used inside <CursorProvider>");
  return ctx;
}

/** Attach declarative cursor intent to any element. No visual output in Phase 1. */
export function useCursorIntent(state: CursorState) {
  const { setState } = useCursor();
  const onMouseEnter = useCallback(() => setState(state), [setState, state]);
  const onMouseLeave = useCallback(() => setState("DEFAULT"), [setState]);
  return { "data-cursor": state, onMouseEnter, onMouseLeave };
}
