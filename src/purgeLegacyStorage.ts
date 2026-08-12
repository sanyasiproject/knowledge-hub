/**
 * One-time cleanup of data written by earlier versions of this app.
 *
 * The app no longer persists anything client-side, but anyone who used a
 * previous version still has these keys sitting in their browser. Removing
 * them is the other half of "store nothing" — otherwise the app has simply
 * stopped writing while leaving its old data behind.
 *
 * This is the ONLY module permitted to touch a storage API, and it exclusively
 * deletes. `scripts/check-content.mjs` allowlists this file by name and fails
 * the build on any storage use anywhere else.
 */

const LEGACY_KEYS = [
  "hub-theme",
  "hub-progress",
  "hub-bookmarks",
  "hub-interview-progress",
];

export function purgeLegacyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // Storage can throw when disabled or blocked by privacy settings. There is
    // nothing to clean up in that case, so failing silently is correct.
  }
}
