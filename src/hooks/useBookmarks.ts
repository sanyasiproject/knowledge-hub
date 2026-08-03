import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "hub-bookmarks";

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot: string[] = load();

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* corrupt data — start fresh */ }
  return [];
}

function save(data: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  snapshot = data;
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return snapshot;
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot);

  const isBookmarked = useCallback((slug: string) => {
    return bookmarks.includes(slug);
  }, [bookmarks]);

  const toggleBookmark = useCallback((slug: string) => {
    const current = load();
    if (current.includes(slug)) {
      save(current.filter((s) => s !== slug));
    } else {
      save([...current, slug]);
    }
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark };
}
