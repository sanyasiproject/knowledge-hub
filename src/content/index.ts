import type { ContentMap, TopicContent } from "./types";
import { bigONotation } from "./topics/big-o-notation";
import { processesVsThreads } from "./topics/processes-vs-threads";
import { cachingBasics } from "./topics/caching-basics";

/**
 * Authored content, keyed by bare topic slug. Add a file under content/topics/
 * and register it here; the topic page renders it automatically.
 */
export const CONTENT: ContentMap = {
  "big-o-notation": bigONotation,
  "processes-vs-threads": processesVsThreads,
  "caching-basics": cachingBasics,
};

export function getContent(topicSlug: string): TopicContent | undefined {
  return CONTENT[topicSlug];
}
