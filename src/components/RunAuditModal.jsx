import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAudit } from "../api/auditApi";

export default function RunAuditModal({
  projectId,
  websiteUrl,
  onClose,
  onCreated,
}) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartAudit() {
    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!websiteUrl) {
        throw new Error("Website URL is not loaded yet. Please wait a moment and try again.");
      }

      console.log("Starting audit for project:", projectId);
      console.log("Website:", websiteUrl);

      const response = await createAudit(projectId);

      console.log("Audit created:", response);

      const audit = response?.audit;

      if (!audit?.id) {
        throw new Error(
          "Audit was created but audit ID was not returned."
        );
      }

      onClose?.();

      if (onCreated) {
        onCreated(audit);
      }

      // Go directly to audit detail
      navigate(`/audits/${audit.id}`);
    } catch (err) {
      console.error("Start audit error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start SEO audit."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!loading) {
          onClose?.();
        }
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <small>NEW AUDIT</small>

            <h2>Run SEO Audit</h2>
          </div>

          <button
            className="modal-close"
            type="button"
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* DESCRIPTION */}

        <p>
          Start a fresh technical SEO audit for your
          project website.
        </p>

        {/* WEBSITE */}

        <label>
          WEBSITE

          <input
            type="text"
            value={websiteUrl || "Website URL unavailable"}
            readOnly
          />
        </label>

        {/* ERROR */}

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        {/* ACTIONS */}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary"
            disabled={loading || !projectId || !websiteUrl}
            onClick={handleStartAudit}
          >
            {loading ? "Starting..." : "Start Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}