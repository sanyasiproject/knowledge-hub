import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { DomainPage } from "./pages/DomainPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TopicPage } from "./pages/TopicPage";
import { SearchResults } from "./pages/SearchResults";
import { NotFound } from "./pages/NotFound";

/** Scroll to top on every route change (but honor in-page #anchors). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/domain/:domainSlug" element={<DomainPage />} />
        <Route path="/domain/:domainSlug/:categorySlug" element={<CategoryPage />} />
        <Route path="/topic/:domainSlug/:categorySlug/:topicSlug" element={<TopicPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
