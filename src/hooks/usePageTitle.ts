import { useEffect } from "react";

const BASE = "SE Knowledge Hub";
const BASE_DESC =
  "The Software Engineering Knowledge Hub — 298 structured topics with explanations, diagrams, interview Q&A, and revision aids across every SE domain.";

/**
 * Sets the document title (and optionally the meta description) for the
 * current page; restores the base values on unmount.
 */
export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description ?? BASE_DESC);
    return () => {
      document.title = BASE;
      if (meta) meta.setAttribute("content", BASE_DESC);
    };
  }, [title, description]);
}
