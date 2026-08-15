import type { TopicContent } from "./types";

/**
 * Lazy content registry.
 *
 * Topic content is the bulk of the app (~10MB of source). Loading it eagerly
 * put every topic in the main bundle, so `import.meta.glob` (lazy by default)
 * maps each `topics/<slug>.ts` file to a dynamic import that only downloads
 * when that topic is opened. The filename IS the slug — the consistency
 * checker (`npm run check`) verifies every taxonomy topic has a file here.
 */
const modules = import.meta.glob<Record<string, TopicContent>>("./topics/*.ts");

function keyFor(topicSlug: string) {
  return `./topics/${topicSlug}.ts`;
}

/** Whether authored content exists for a topic (no download needed). */
export function hasContent(topicSlug: string): boolean {
  return keyFor(topicSlug) in modules;
}

/** Load a topic's authored content on demand. Each topic file has exactly one export. */
export async function loadContent(topicSlug: string): Promise<TopicContent | undefined> {
  const loader = modules[keyFor(topicSlug)];
  if (!loader) return undefined;
  const mod = await loader();
  return Object.values(mod)[0];
}
