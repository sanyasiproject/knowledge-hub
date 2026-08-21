import type { TopicPractice } from "./types";

/**
 * Lazy practice registry — same pattern as the content registry.
 *
 * Question banks are big (15+ full problems per topic), so each
 * `topics/<slug>.ts` file is a dynamic import that only downloads when that
 * topic's practice page is opened. The filename IS the taxonomy topic slug.
 */
const modules = import.meta.glob<Record<string, TopicPractice>>("./topics/*.ts");

function keyFor(topicSlug: string) {
  return `./topics/${topicSlug}.ts`;
}

/** Whether a practice bank exists for a topic (no download needed). */
export function hasPractice(topicSlug: string): boolean {
  return keyFor(topicSlug) in modules;
}

/** Load a topic's practice bank on demand. Each file has exactly one export. */
export async function loadPractice(topicSlug: string): Promise<TopicPractice | undefined> {
  const loader = modules[keyFor(topicSlug)];
  if (!loader) return undefined;
  const mod = await loader();
  return Object.values(mod)[0];
}
