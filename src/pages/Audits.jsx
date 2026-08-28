import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import RunAuditModal from "../components/RunAuditModal";
import { getAudits } from "../api/auditApi";
import { getProject } from "../api/projectApi";

const PROJECT_ID = 1;
const filters = ["all", "completed", "running", "pending", "failed"];

export default function Audits() {
  const [audits, setAudits] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRunAudit, setShowRunAudit] = useState(false);
  const [project, setProject] = useState(null);

  async function refresh(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const response = await getAudits(PROJECT_ID);
      setAudits(response.audits || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load audits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(true);
    getProject(PROJECT_ID).then(r => setProject(r.project)).catch(() => {});
  }, []);

  const hasActive = audits.some(a => ["pending", "running"].includes(a.audit_status));
  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => refresh(false), 5000);
    return () => clearInterval(timer);
  }, [hasActive]);

  function auditCreated() {
    setShowRunAudit(false);
    refresh(false);
  }

  const visible = useMemo(() => filter === "all" ? audits : audits.filter(a => a.audit_status === filter), [audits, filter]);
  const count = (status) => status === "all" ? audits.length : audits.filter(a => a.audit_status === status).length;

  if (loading) return <Layout><Loading text="Loading audits..." /></Layout>;

  return (
    <Layout>
      <header>
        <div><small>AUDIT HISTORY</small><h1>Audits</h1><p>Review and track all SEO audits for this project.</p></div>
        <button className="primary" type="button" onClick={() => setShowRunAudit(true)}>Run New Audit</button>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="audit-toolbar">
        <div className="filter-tabs">
          {filters.map(name => <button key={name} className={filter === name ? "filter-tab active" : "filter-tab"} onClick={() => setFilter(name)}>{name[0].toUpperCase()+name.slice(1)} <span>{count(name)}</span></button>)}
        </div>
        <button className="secondary" type="button" onClick={() => refresh(true)}>Refresh</button>
      </div>

      <section className="panel table-wrap">
        <div className="panel-title"><div><h2>Audit History</h2><p>{visible.length} audit{visible.length === 1 ? "" : "s"} shown</p></div></div>
        {visible.length === 0 ? <div className="empty-state">No audits found for this filter.</div> : (
          <table><thead><tr><th>Audit</th><th>Score</th><th>Pages</th><th>Issues</th><th>Warnings</th><th>Status</th><th>Created</th><th></th></tr></thead>
            <tbody>{visible.map(a => <tr key={a.id}><td><strong>#{a.id}</strong></td><td>{Math.round(Number(a.score || 0))}</td><td>{a.pages_crawled ?? 0}</td><td>{a.issues_count ?? 0}</td><td>{a.warnings_count ?? 0}</td><td><StatusBadge status={a.audit_status}/></td><td>{a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</td><td><Link to={`/audits/${a.id}`}>View report →</Link></td></tr>)}</tbody>
          </table>
        )}
      </section>

      {showRunAudit && <RunAuditModal project={project || { id: PROJECT_ID, website_url: "" }} onClose={() => setShowRunAudit(false)} onCreated={auditCreated} />}
    </Layout>
  );
}
