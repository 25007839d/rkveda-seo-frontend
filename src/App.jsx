import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Websites from "./pages/Websites";
import Dashboard from "./pages/Dashboard";
import Audits from "./pages/Audits";
import AuditDetail from "./pages/AuditDetail";
import GoogleSearchConsole from "./pages/GoogleSearchConsole";
import SeoPlatform from "./pages/SeoPlatform";
import KeywordIntelligence from "./pages/KeywordIntelligence";
import BacklinkIntelligence from "./pages/BacklinkIntelligence";
import CompetitorIntelligence from "./pages/CompetitorIntelligence";

export default function App() {
  return (
    <Routes>
      {/* =================================================
          PUBLIC
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =================================================
          PROTECTED
      ================================================= */}

      <Route
        element={<ProtectedRoute />}
      >
        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to="/websites"
              replace
            />
          }
        />

        {/* Websites */}
        <Route
          path="/websites"
          element={<Websites />}
        />

        {/* Project Dashboard */}
        <Route
          path="/projects/:projectId/dashboard"
          element={<Dashboard />}
        />

        {/* Existing compatibility route */}
        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/websites"
              replace
            />
          }
        />

        {/* Unified SEO Platform */}
        <Route path="/projects/:projectId/seo" element={<SeoPlatform />} />
        <Route path="/projects/:projectId/seo/keywords" element={<KeywordIntelligence />} />
        <Route path="/projects/:projectId/seo/backlinks" element={<BacklinkIntelligence />} />
        <Route path="/projects/:projectId/seo/competitors" element={<CompetitorIntelligence />} />

        {/* Google Search Console */}
        <Route
          path="/projects/:projectId/gsc"
          element={<GoogleSearchConsole />}
        />

        {/* Project Audits */}
        <Route
          path="/projects/:projectId/audits"
          element={<Audits />}
        />

        {/* Legacy/global audits route - Audits resolves the current project */}
        <Route
          path="/audits"
          element={<Audits />}
        />

        <Route
          path="/audits/:id"
          element={<AuditDetail />}
        />
      </Route>

      {/* =================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/websites"
            replace
          />
        }
      />
    </Routes>
  );
}