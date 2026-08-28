import { useState } from "react";
import { createAudit } from "../api/auditApi";

export default function RunAuditModal({ project, onClose, onCreated }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    try {
      setRunning(true);
      setError("");
      const response = await createAudit(project.id);
      if (!response.success) throw new Error(response.message || "Unable to start audit");
      onCreated(response.audit);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start audit");
      setRunning(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !running && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="run-audit-title">
        <div className="modal-header">
          <div>
            <small>NEW AUDIT</small>
            <h2 id="run-audit-title">Run SEO Audit</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={running} aria-label="Close">×</button>
        </div>

        <p className="modal-description">Start a fresh technical SEO audit for your project website.</p>

        <label className="field-label">Website</label>
        <div className="website-input">{project?.website_url || "Website not available"}</div>

        {error && <div className="alert">{error}</div>}

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose} disabled={running}>Cancel</button>
          <button className="primary" type="button" onClick={handleStart} disabled={running || !project?.id}>
            {running ? "Starting audit..." : "Start Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}
