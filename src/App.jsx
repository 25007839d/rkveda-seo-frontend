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

        {/* Audits */}
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