import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import RunAuditModal from "../components/RunAuditModal";

import {
  getDashboard,
} from "../api/projectApi";

export default function Dashboard() {
  const { projectId } = useParams();

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showRunAudit, setShowRunAudit] =
    useState(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  async function refresh(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      if (!projectId) {
        throw new Error(
          "Website/project ID is missing."
        );
      }

      const response =
        await getDashboard(projectId);

      setDashboard(response.dashboard);
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    refresh(true);
  }, [projectId]);

  // =====================================================
  // AUTO REFRESH AUDIT
  // =====================================================

  useEffect(() => {
    const status =
      dashboard?.latest_audit?.audit_status;

    if (
      status !== "pending" &&
      status !== "running"
    ) {
      return;
    }

    const timer = setInterval(() => {
      refresh(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [
    dashboard?.latest_audit?.audit_status,
    projectId,
  ]);

  // =====================================================
  // AUDIT CREATED
  // =====================================================

  function auditCreated(audit) {
    setShowRunAudit(false);

    refresh(false);

    if (audit?.id) {
      navigate(`/audits/${audit.id}`);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading dashboard..." />
      </Layout>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const project =
    dashboard?.project;

  const audit =
    dashboard?.latest_audit;

  const summary =
    dashboard?.summary || {};

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Layout>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="page-header">
        <div>
          <small>SEO OVERVIEW</small>

          <h1>Dashboard</h1>

          <p>
            {project?.website_url}
          </p>
        </div>

        <div className="header-actions">
          <Link
            className="secondary"
            to="/websites"
          >
            ← My Websites
          </Link>

          <button
            className="primary"
            type="button"
            onClick={() =>
              setShowRunAudit(true)
            }
          >
            Run New Audit
          </button>
        </div>
      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      {/* =================================================
          PROJECT INFO
      ================================================= */}

      {project && (
        <section className="project-banner">
          <div>
            <small>WEBSITE</small>

            <strong>
              {project.project_name}
            </strong>

            <span>
              {project.domain}
            </span>
          </div>

          <span
            className={
              project.status === "active"
                ? "project-status active"
                : "project-status"
            }
          >
            {project.status || "active"}
          </span>
        </section>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="stats">
        <StatCard
          label="Total Audits"
          value={
            summary.total_audits ?? 0
          }
        />

        <StatCard
          label="Completed"
          value={
            summary.completed_audits ?? 0
          }
        />

        <StatCard
          label="Pending"
          value={
            summary.pending_audits ?? 0
          }
        />

        <StatCard
          label="Failed"
          value={
            summary.failed_audits ?? 0
          }
        />
      </div>

      {/* =================================================
          LATEST AUDIT
      ================================================= */}

      <div className="grid">
        <section className="panel center">
          <div className="panel-title">
            <h2>Latest Audit</h2>

            {audit && (
              <StatusBadge
                status={
                  audit.audit_status
                }
              />
            )}
          </div>

          {audit ? (
            <>
              <div className="score">
                <strong>
                  {Math.round(
                    Number(
                      audit.score || 0
                    )
                  )}
                </strong>

                <span>/ 100</span>
              </div>

              <div className="metrics">
                <div>
                  <b>
                    {audit.pages_crawled ??
                      0}
                  </b>

                  <span>Pages</span>
                </div>

                <div>
                  <b>
                    {audit.issues_count ??
                      0}
                  </b>

                  <span>Issues</span>
                </div>

                <div>
                  <b>
                    {audit.warnings_count ??
                      0}
                  </b>

                  <span>Warnings</span>
                </div>
              </div>

              <Link
                className="secondary full"
                to={`/audits/${audit.id}`}
              >
                View Audit Report
              </Link>
            </>
          ) : (
            <div className="empty-state small">
              <h3>No audit yet</h3>

              <p>
                Run your first SEO audit for
                this website.
              </p>

              <button
                className="primary"
                type="button"
                onClick={() =>
                  setShowRunAudit(true)
                }
              >
                Run First Audit
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =================================================
          RUN AUDIT MODAL
      ================================================= */}

      {showRunAudit && (
        <RunAuditModal
          projectId={Number(projectId)}
          websiteUrl={
            project?.website_url
          }
          onClose={() =>
            setShowRunAudit(false)
          }
          onCreated={auditCreated}
        />
      )}
    </Layout>
  );
}