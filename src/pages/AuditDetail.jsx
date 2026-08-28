import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../utils/auth";
import "./AuditDetail.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.rkveda.in/api";

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// SCORE HELPERS
// =====================================================

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Needs improvement";
  if (score >= 50) return "Needs attention";
  return "Poor";
}

function getScoreClass(score) {
  if (score >= 90) return "score-excellent";
  if (score >= 75) return "score-good";
  if (score >= 50) return "score-warning";
  return "score-poor";
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const label =
    normalized === "completed"
      ? "Completed"
      : normalized === "running"
      ? "Running"
      : normalized === "failed"
      ? "Failed"
      : normalized === "pending"
      ? "Pending"
      : "Unknown";

  return (
    <span className={`audit-status status-${normalized || "unknown"}`}>
      <span className="status-dot"></span>
      {label}
    </span>
  );
}

// =====================================================
// RESULT ITEM
// =====================================================

function ResultItem({ item, type }) {
  const code =
    item?.code ||
    item?.check_code ||
    item?.type ||
    "CHECK";

  const message =
    item?.message ||
    item?.description ||
    item?.details ||
    "No additional details available.";

  const icon =
    type === "issue"
      ? "!"
      : type === "warning"
      ? "!"
      : "✓";

  return (
    <div className={`result-item result-${type}`}>
      <div className={`result-icon ${type}`}>
        {icon}
      </div>

      <div className="result-content">
        <div className="result-code">
          {code}
        </div>

        <div className="result-message">
          {message}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// RESULT SECTION
// =====================================================

function ResultSection({
  title,
  subtitle,
  items,
  type,
  emptyText,
}) {
  return (
    <section className={`results-section ${type}-section`}>
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span className={`section-count count-${type}`}>
          {items.length}
        </span>
      </div>

      <div className="section-body">
        {items.length > 0 ? (
          items.map((item, index) => (
            <ResultItem
              key={`${item?.code || type}-${index}`}
              item={item}
              type={type}
            />
          ))
        ) : (
          <div className="empty-result">
            <div className="empty-icon">✓</div>
            <div>
              <strong>All clear</strong>
              <p>{emptyText}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  icon,
  label,
  value,
  description,
  type,
}) {
  return (
    <div className={`summary-card summary-${type}`}>
      <div className={`summary-icon ${type}`}>
        {icon}
      </div>

      <div className="summary-content">
        <span className="summary-label">
          {label}
        </span>

        <strong className="summary-value">
          {value}
        </strong>

        <span className="summary-description">
          {description}
        </span>
      </div>
    </div>
  );
}

// =====================================================
// PAGE RESULT
// =====================================================

function PageResult({ page }) {
  const score = Number(page?.score || 0);

  const pageStatus =
    String(
      page?.pageStatus ||
        page?.page_status ||
        ""
    ).toLowerCase();

  const statusCode =
    page?.statusCode ||
    page?.status_code ||
    0;

  const isNotFound =
    pageStatus === "not_found" ||
    Number(statusCode) === 404;

  const issues = Array.isArray(page?.issues)
    ? page.issues
    : [];

  const warnings = Array.isArray(page?.warnings)
    ? page.warnings
    : [];

  const passed = Array.isArray(page?.passed)
    ? page.passed
    : [];

  return (
    <div
      className={`page-result-card ${
        isNotFound ? "page-result-error" : ""
      }`}
    >
      {/* PAGE HEADER */}
      <div className="page-result-header">
        <div className="page-url-area">
          <div
            className={`page-status-icon ${
              isNotFound ? "not-found" : "ok"
            }`}
          >
            {isNotFound ? "!" : "✓"}
          </div>

          <div className="page-url-content">
            <a
              href={page?.url}
              target="_blank"
              rel="noreferrer"
              className="page-url"
            >
              {page?.url}
            </a>

            <div className="page-http-status">
              <span
                className={
                  isNotFound
                    ? "http-badge http-error"
                    : "http-badge http-ok"
                }
              >
                HTTP {statusCode}
              </span>

              <span className="page-status-text">
                {isNotFound
                  ? "Not Found"
                  : "Page OK"}
              </span>
            </div>
          </div>
        </div>

        {/* PAGE SCORE */}
        <div className="page-score">
          <span className="page-score-label">
            SCORE
          </span>

          <strong
            className={getScoreClass(score)}
          >
            {score}
          </strong>

          <span>/100</span>
        </div>
      </div>

      {/* PAGE METRICS */}
      <div className="page-metrics">
        <div>
          <span>Issues</span>
          <strong>{issues.length}</strong>
        </div>

        <div>
          <span>Warnings</span>
          <strong>{warnings.length}</strong>
        </div>

        <div>
          <span>Passed</span>
          <strong>{passed.length}</strong>
        </div>
      </div>

      {/* PAGE DETAILS */}
      <div className="page-details">
        {issues.length > 0 && (
          <div className="page-detail-group">
            <h4>
              Issues
              <span>{issues.length}</span>
            </h4>

            {issues.map((item, index) => (
              <ResultItem
                key={`page-issue-${index}`}
                item={item}
                type="issue"
              />
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="page-detail-group">
            <h4>
              Warnings
              <span>{warnings.length}</span>
            </h4>

            {warnings.map((item, index) => (
              <ResultItem
                key={`page-warning-${index}`}
                item={item}
                type="warning"
              />
            ))}
          </div>
        )}

        {passed.length > 0 && (
          <div className="page-detail-group">
            <h4>
              Passed Checks
              <span>{passed.length}</span>
            </h4>

            <div className="passed-grid">
              {passed.map((item, index) => (
                <ResultItem
                  key={`page-passed-${index}`}
                  item={item}
                  type="passed"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ===================================================
  // LOAD AUDIT
  // ===================================================

  const loadAudit = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/audits/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load audit"
          );
        }

        const auditData =
          data?.audit ||
          data?.data ||
          data;

        setAudit(auditData);
      } catch (err) {
        console.error(
          "Load audit error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load audit. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadAudit(true);
  }, [loadAudit]);

  // ===================================================
  // AUTO REFRESH
  // ===================================================

  useEffect(() => {
    if (!audit) return;

    const status = String(
      audit?.audit_status ||
        audit?.status ||
        ""
    ).toLowerCase();

    if (
      status !== "pending" &&
      status !== "running"
    ) {
      return;
    }

    const interval = setInterval(() => {
      loadAudit(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [audit, loadAudit]);

  // ===================================================
  // NORMALIZE DATA
  // ===================================================

  const normalized = useMemo(() => {
    if (!audit) {
      return {
        score: 0,
        pages: 0,
        issues: [],
        warnings: [],
        passed: [],
        pageResults: [],
      };
    }

    const score = Number(
      audit?.score || 0
    );

    const issues = Array.isArray(
      audit?.issues
    )
      ? audit.issues
      : [];

    const warnings = Array.isArray(
      audit?.warnings
    )
      ? audit.warnings
      : [];

    const passed = Array.isArray(
      audit?.passed
    )
      ? audit.passed
      : [];

    const pageResults = Array.isArray(
      audit?.pageResults
    )
      ? audit.pageResults
      : Array.isArray(audit?.page_results)
      ? audit.page_results
      : [];

    return {
      score,
      pages:
        Number(
          audit?.pages_crawled || 0
        ) || pageResults.length,
      issues,
      warnings,
      passed,
      pageResults,
    };
  }, [audit]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="audit-loading-page">
        <div className="loading-spinner"></div>
        <p>Loading audit report...</p>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <div className="audit-error-page">
        <button
          className="back-button"
          onClick={() =>
            navigate("/audits")
          }
        >
          ← Back to Audits
        </button>

        <div className="error-card">
          <div className="error-card-icon">
            !
          </div>

          <h2>Unable to load audit</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() =>
              loadAudit(true)
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!audit) {
    return null;
  }

  // ===================================================
  // VARIABLES
  // ===================================================

  const score = normalized.score;

  const status =
    audit?.audit_status ||
    audit?.status ||
    "unknown";

  const scoreLabel =
    getScoreLabel(score);

  const scoreClass =
    getScoreClass(score);

  // Circular progress
  const circumference = 2 * Math.PI * 52;

  const progress =
    circumference -
    (Math.min(Math.max(score, 0), 100) /
      100) *
      circumference;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="audit-detail-page">
      <div className="audit-container">

        {/* ==========================================
            TOP NAV
        ========================================== */}

        <div className="audit-topbar">
          <button
            className="back-button"
            onClick={() =>
              navigate("/audits")
            }
          >
            ← Back to Audits
          </button>

          <button
            className="refresh-button"
            onClick={() =>
              loadAudit(false)
            }
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "refresh-icon spinning"
                  : "refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ==========================================
            HERO
        ========================================== */}

        <section className="audit-hero">

          <div className="hero-main">

            <div className="breadcrumb">
              Audits
              <span>/</span>
              Audit #{audit?.id}
            </div>

            <div className="hero-label">
              AUDIT REPORT
            </div>

            <h1 className="website-title">
              {audit?.website_url ||
                "Website Audit"}
            </h1>

            <div className="audit-meta">
              <div>
                <span>Started</span>
                <strong>
                  {formatDate(
                    audit?.started_at
                  )}
                </strong>
              </div>

              <div className="meta-divider"></div>

              <div>
                <span>Completed</span>
                <strong>
                  {formatDate(
                    audit?.completed_at
                  )}
                </strong>
              </div>
            </div>

            <StatusBadge status={status} />
          </div>

          {/* SCORE CARD */}

          <div
            className={`score-card ${scoreClass}`}
          >
            <div className="score-card-label">
              SEO SCORE
            </div>

            <div className="score-ring">

              <svg
                width="150"
                height="150"
                viewBox="0 0 120 120"
              >
                <circle
                  className="score-ring-bg"
                  cx="60"
                  cy="60"
                  r="52"
                />

                <circle
                  className="score-ring-progress"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray={
                    circumference
                  }
                  strokeDashoffset={
                    progress
                  }
                />
              </svg>

              <div className="score-ring-value">
                <strong>{score}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="score-label">
              {scoreLabel}
            </div>
          </div>
        </section>

        {/* ==========================================
            SUMMARY
        ========================================== */}

        <section className="summary-grid">

          <SummaryCard
            icon="◉"
            label="Pages Crawled"
            value={normalized.pages}
            description="Pages analyzed"
            type="pages"
          />

          <SummaryCard
            icon="!"
            label="Issues"
            value={normalized.issues.length}
            description="Problems to fix"
            type="issues"
          />

          <SummaryCard
            icon="!"
            label="Warnings"
            value={normalized.warnings.length}
            description="Needs attention"
            type="warnings"
          />

          <SummaryCard
            icon="✓"
            label="Passed"
            value={normalized.passed.length}
            description="Checks passed"
            type="passed"
          />

        </section>

        {/* ==========================================
            RESULTS
        ========================================== */}

        <div className="results-grid">

          <ResultSection
            title="Issues"
            subtitle="Problems that should be fixed."
            items={normalized.issues}
            type="issue"
            emptyText="No SEO issues were detected."
          />

          <ResultSection
            title="Warnings"
            subtitle="Items that may affect SEO performance."
            items={normalized.warnings}
            type="warning"
            emptyText="No warnings were detected."
          />

          <ResultSection
            title="Passed Checks"
            subtitle="SEO checks that passed successfully."
            items={normalized.passed}
            type="passed"
            emptyText="No passed checks available."
          />

        </div>

        {/* ==========================================
            PAGE RESULTS
        ========================================== */}

        <section className="page-results-section">

          <div className="page-results-heading">

            <div>
              <div className="hero-label">
                DETAILED ANALYSIS
              </div>

              <h2>Page Results</h2>

              <p>
                Detailed SEO results for each
                crawled page.
              </p>
            </div>

            <div className="page-results-count">
              <strong>
                {normalized.pageResults.length}
              </strong>
              <span>pages</span>
            </div>

          </div>

          <div className="page-results-list">

            {normalized.pageResults.length >
            0 ? (
              normalized.pageResults.map(
                (page, index) => (
                  <PageResult
                    key={
                      page?.url ||
                      `page-${index}`
                    }
                    page={page}
                  />
                )
              )
            ) : (
              <div className="no-page-results">
                <div>◎</div>

                <h3>
                  No page results available
                </h3>

                <p>
                  Detailed page-level results
                  were not returned by the audit.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <div className="audit-footer">

          <button
            className="back-history-button"
            onClick={() =>
              navigate("/audits")
            }
          >
            ← Back to Audit History
          </button>

          <span>
            Audit #{audit?.id}
          </span>

        </div>

      </div>
    </div>
  );
}