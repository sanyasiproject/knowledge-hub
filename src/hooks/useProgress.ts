import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Storage model                                                       */
/* ------------------------------------------------------------------ */

interface ProgressData {
  /** topic slugs the user has read (spent 30s+ on the page). */
  read: string[];
  /** MCQ scores keyed by topic slug. */
  mcqScores: Record<string, { correct: number; total: number }>;
  /** topic slugs where the user has flipped at least one flashcard. */
  flashcardsReviewed: string[];
}

const STORAGE_KEY = "hub-progress";

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressData;
  } catch { /* corrupt data — start fresh */ }
  return { read: [], mcqScores: {}, flashcardsReviewed: [] };
}

function save(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  notifyListeners();
}

/* ------------------------------------------------------------------ */
/* Tiny pub-sub so every hook instance re-renders on change            */
/* ------------------------------------------------------------------ */

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot = load();

function notifyListeners() {
  snapshot = load();
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return snapshot;
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useProgress() {
  const data = useSyncExternalStore(subscribe, getSnapshot);

  const markRead = useCallback((slug: string) => {
    const d = load();
    if (!d.read.includes(slug)) {
      d.read.push(slug);
      save(d);
    }
  }, []);

  const isRead = useCallback((slug: string) => {
    return data.read.includes(slug);
  }, [data]);

  const getStats = useCallback(() => {
    return {
      topicsRead: data.read.length,
      mcqsTaken: Object.keys(data.mcqScores).length,
      flashcardsReviewed: data.flashcardsReviewed.length,
    };
  }, [data]);

  const getMCQScore = useCallback((slug: string) => {
    return data.mcqScores[slug] ?? null;
  }, [data]);

  const saveMCQScore = useCallback((slug: string, correct: number, total: number) => {
    const d = load();
    d.mcqScores[slug] = { correct, total };
    save(d);
  }, []);

  const markFlashcardReviewed = useCallback((slug: string) => {
    const d = load();
    if (!d.flashcardsReviewed.includes(slug)) {
      d.flashcardsReviewed.push(slug);
      save(d);
    }
  }, []);

  const resetProgress = useCallback(() => {
    save({ read: [], mcqScores: {}, flashcardsReviewed: [] });
  }, []);

  return { markRead, isRead, getStats, getMCQScore, saveMCQScore, markFlashcardReviewed, resetProgress };
}

/**
 * Per-topic progress hook. Auto-marks the topic as read after 30 seconds.
 */
export function useTopicProgress(topicSlug: string) {
  const { markRead, isRead, getMCQScore, saveMCQScore, markFlashcardReviewed } = useProgress();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const read = isRead(topicSlug);
  const mcqScore = getMCQScore(topicSlug);

  useEffect(() => {
    if (read) return;
    timerRef.current = setTimeout(() => {
      markRead(topicSlug);
    }, 30_000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [topicSlug, read, markRead]);

  return {
    read,
    mcqScore,
    saveMCQScore: (correct: number, total: number) => saveMCQScore(topicSlug, correct, total),
    markFlashcardReviewed: () => markFlashcardReviewed(topicSlug),
  };
}
