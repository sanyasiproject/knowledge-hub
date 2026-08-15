/**
 * Lightweight facts about the Interview Prep section, safe to import from the
 * home page without pulling the full interview dataset into that bundle.
 * `npm run check` validates these numbers against the real data, so they
 * cannot silently drift.
 */
export const INTERVIEW_META = {
  areas: 21,
  questions: 301,
  decisions: 79,
};

/** Track links for the home page — slug/title/icon only. */
export const TRACK_LINKS = [
  { slug: "final-30", title: "Final 30 Minutes", icon: "🚨" },
  { slug: "crash-4h", title: "4-Hour Crash", icon: "⚡" },
  { slug: "one-day", title: "1-Day Plan", icon: "📅" },
  { slug: "two-day", title: "2-Day Deep Revision", icon: "🗓️" },
];
