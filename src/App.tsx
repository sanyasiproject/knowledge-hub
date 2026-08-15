import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { NotFound } from "./pages/NotFound";

/*
 * Every page is a lazy route chunk. This matters more here than in a typical
 * app: the interview pages pull in the full interview dataset, and keeping
 * them out of the main bundle keeps first paint fast.
 */
const page = <T extends Record<string, unknown>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] as React.ComponentType })));

const Home = page(() => import("./pages/Home"), "Home");
const DomainPage = page(() => import("./pages/DomainPage"), "DomainPage");
const CategoryPage = page(() => import("./pages/CategoryPage"), "CategoryPage");
const TopicPage = page(() => import("./pages/TopicPage"), "TopicPage");
const SearchResults = page(() => import("./pages/SearchResults"), "SearchResults");
const LearningPaths = page(() => import("./pages/LearningPaths"), "LearningPaths");
const LearningPathDetail = page(() => import("./pages/LearningPathDetail"), "LearningPathDetail");
const InterviewHub = page(() => import("./pages/InterviewHub"), "InterviewHub");
const InterviewArea = page(() => import("./pages/InterviewArea"), "InterviewArea");
const InterviewTrack = page(() => import("./pages/InterviewTrack"), "InterviewTrack");

/** Scroll to top on every route change (but honor in-page #anchors). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-4 pt-8">
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 h-40 rounded-2xl bg-slate-100 dark:bg-slate-900" />
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/domain/:domainSlug" element={<DomainPage />} />
          <Route path="/domain/:domainSlug/:categorySlug" element={<CategoryPage />} />
          <Route path="/topic/:domainSlug/:categorySlug/:topicSlug" element={<TopicPage />} />
          <Route path="/interview" element={<InterviewHub />} />
          <Route path="/interview/track/:trackSlug" element={<InterviewTrack />} />
          <Route path="/interview/area/:areaSlug" element={<InterviewArea />} />
          <Route path="/paths" element={<LearningPaths />} />
          <Route path="/paths/:pathSlug" element={<LearningPathDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
