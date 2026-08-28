import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import RunAuditModal from "../components/RunAuditModal";
import { getDashboard } from "../api/projectApi";

const PROJECT_ID = 1;

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRunAudit, setShowRunAudit] = useState(false);
  const navigate = useNavigate();

  async function refresh(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const response = await getDashboard(PROJECT_ID);
      setDashboard(response.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(true); }, []);

  useEffect(() => {
    const status = dashboard?.latest_audit?.audit_status;
    if (status !== "pending" && status !== "running") return;
    const timer = setInterval(() => refresh(false), 5000);
    return () => clearInterval(timer);
  }, [dashboard?.latest_audit?.audit_status]);

  function auditCreated(audit) {
    setShowRunAudit(false);
    refresh(false);
    if (audit?.id) navigate(`/audits/${audit.id}`);
  }

  if (loading) return <Layout><Loading text="Loading dashboard..." /></Layout>;

  const project = dashboard?.project;
  const audit = dashboard?.latest_audit;
  const summary = dashboard?.summary || {};

  return (
    <Layout>
      <header>
        <div><small>SEO OVERVIEW</small><h1>Dashboard</h1><p>{project?.website_url}</p></div>
        <button className="primary" type="button" onClick={() => setShowRunAudit(true)}>Run New Audit</button>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="stats">
        <StatCard label="Total Audits" value={summary.total_audits ?? 0} />
        <StatCard label="Completed" value={summary.completed_audits ?? 0} />
        <StatCard label="Pending" value={summary.pending_audits ?? 0} />
        <StatCard label="Failed" value={summary.failed_audits ?? 0} />
      </div>

      <div className="grid">
        <section className="panel center">
          <div className="panel-title"><h2>Latest Audit</h2>{audit && <StatusBadge status={audit.audit_status} />}</div>
          {audit ? (
            <>
              <div className="score"><strong>{Math.round(Number(audit.score || 0))}</strong><span>/ 100</span></div>
              <div className="metrics"><div><b>{audit.pages_crawled ?? 0}</b><span>Pages</span></div><div><b>{audit.issues_count ?? 0}</b><span>Issues</span></div><div><b>{audit.warnings_count ?? 0}</b><span>Warnings</span></div></div>
              <Link className="secondary full" to={`/audits/${audit.id}`}>View Audit Report</Link>
            </>
          ) : <p>No audit yet.</p>}
        </section>

        <section className="panel">
          <div className="panel-title"><h2>Website</h2></div>
          <div className="website">{project?.website_url}</div>
          <div className="summary"><div>Running <b>{summary.running_audits ?? 0}</b></div><div>Completed <b>{summary.completed_audits ?? 0}</b></div><div>Failed <b>{summary.failed_audits ?? 0}</b></div></div>
        </section>
      </div>

      {showRunAudit && <RunAuditModal project={project} onClose={() => setShowRunAudit(false)} onCreated={auditCreated} />}
    </Layout>
  );
}
