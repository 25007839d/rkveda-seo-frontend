import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { connectGsc, getGscPerformance, getGscStatus, syncGscHistory, disconnectGsc } from "../api/gscApi";
import { getProject } from "../api/projectApi";
import { getGscDateRange } from "../utils/gscDateRange";

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function formatPosition(value) {
  return Number(value || 0).toFixed(1);
}

function shortDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function getKey(row) {
  return row?.keys?.[0] || "-";
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="gsc-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function MiniChart({ rows }) {
  const points = useMemo(() => {
    const source = (rows || []).slice(-30);
    if (!source.length) return [];
    const values = source.map((row) => Number(row.clicks || 0));
    const max = Math.max(...values, 1);
    const width = 760;
    const height = 220;
    const pad = 24;
    return source.map((row, index) => {
      const x = source.length === 1
        ? width / 2
        : pad + (index / (source.length - 1)) * (width - pad * 2);
      const y = height - pad - (Number(row.clicks || 0) / max) * (height - pad * 2);
      return { x, y, row };
    });
  }, [rows]);

  if (!points.length) {
    return (
      <div className="gsc-empty-chart">
        <div>📈</div>
        <strong>No performance data yet</strong>
        <span>Google is still processing this property or there is no data for the selected period.</span>
      </div>
    );
  }

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="gsc-chart-wrap">
      <svg viewBox="0 0 760 220" role="img" aria-label="Clicks over time">
        <line x1="24" y1="196" x2="736" y2="196" stroke="currentColor" opacity=".12" />
        <line x1="24" y1="120" x2="736" y2="120" stroke="currentColor" opacity=".08" />
        <line x1="24" y1="44" x2="736" y2="44" stroke="currentColor" opacity=".08" />
        <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" fill="currentColor">
            <title>{`${getKey(point.row)}: ${formatNumber(point.row.clicks)} clicks`}</title>
          </circle>
        ))}
      </svg>
      <div className="gsc-chart-labels">
        <span>{shortDate(points[0]?.row?.keys?.[0])}</span>
        <span>{shortDate(points[points.length - 1]?.row?.keys?.[0])}</span>
      </div>
    </div>
  );
}

export default function GoogleSearchConsole() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [project, setProject] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncingHistory, setSyncingHistory] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState("");
  const [range, setRange] = useState("30");

  const dates = useMemo(() => getGscDateRange(range), [range]);
  const [country, setCountry] = useState("all");

  useEffect(() => {
    const gscError = searchParams.get("gsc_error");
    const connected = searchParams.get("gsc_connected");

    if (gscError) {
      setError(gscError);
    } else if (connected === "1") {
      setError("");
    }

    if (gscError || connected) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadStatus = useCallback(async () => {
    if (!projectId) return;
    const response = await getGscStatus(projectId);
    setStatus(response);
    return response;
  }, [projectId]);

  const loadPerformance = useCallback(async () => {
    if (!projectId || !status?.connected) return;
    try {
      setPerformanceLoading(true);
      const response = await getGscPerformance(projectId, {
        ...dates,
        dimension: "date",
        country,
      });
      setPerformance(response);
    } finally {
      setPerformanceLoading(false);
    }
  }, [country, dates, projectId, status?.connected]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!projectId) throw new Error("Website/project ID is missing.");

        localStorage.setItem("rkveda_current_project_id", String(projectId));

        const [projectResponse, statusResponse] = await Promise.all([
          getProject(projectId),
          getGscStatus(projectId),
        ]);

        if (active) {
          const loadedProject = projectResponse?.project || null;
          const loadedStatus = statusResponse || null;
          const connectionProjectId = loadedStatus?.connection?.project_id;

          setProject(loadedProject);

          // Never render a connection belonging to another project.
          // This is a frontend safety check in addition to the backend query scope.
          if (
            connectionProjectId != null &&
            Number(connectionProjectId) !== Number(projectId)
          ) {
            console.error("GSC connection/project mismatch", {
              routeProjectId: projectId,
              connectionProjectId,
              property: loadedStatus?.connection?.property_url,
            });
            setStatus({
              success: false,
              connected: false,
              connection: null,
            });
            setError("Google Search Console connection belongs to a different project. Please reconnect this project.");
          } else {
            setStatus(loadedStatus);
          }
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load Google Search Console status.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [projectId]);

  useEffect(() => {
    if (!status?.connected) return;
    loadPerformance().catch((err) => {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to load GSC performance data.");
    });
  }, [loadPerformance, status?.connected]);

  async function handleConnect() {
    try {
      setConnecting(true);
      setError("");
      const response = await connectGsc(projectId);
      if (!response?.authorizationUrl) throw new Error("Google authorization URL was not returned.");
      window.location.href = response.authorizationUrl;
    } catch (err) {
      setConnecting(false);
      setError(err.response?.data?.message || err.message || "Unable to start Google connection.");
    }
  }

  async function handleSyncHistory() {
    try {
      setError("");
      setSyncMessage("");
      setSyncingHistory(true);
      const response = await syncGscHistory(projectId, { ...dates, dataState: "final" });
      setSyncMessage(`History synced: ${formatNumber(response.savedDays || 0)} day(s).`);
      await loadPerformance();
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data?.message || err.message;
      const reason = err.response?.data?.googleReason;
      setError(reason ? `${detail} (${reason})` : (detail || "Unable to sync GSC history."));
    } finally {
      setSyncingHistory(false);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm("Disconnect Google Search Console for this project? Historical data will be kept, but the Google connection will be removed.")) return;
    try {
      setError("");
      await disconnectGsc(projectId);
      setStatus({ success: true, connected: false, connection: null });
      setPerformance(null);
      setSyncMessage("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to disconnect Google Search Console.");
    }
  }

  async function handleReconnect() {
    try {
      setConnecting(true);
      setError("");
      await disconnectGsc(projectId);
      const response = await connectGsc(projectId);
      if (!response?.authorizationUrl) throw new Error("Google authorization URL was not returned.");
      window.location.href = response.authorizationUrl;
    } catch (err) {
      setConnecting(false);
      setError(err.response?.data?.message || err.message || "Unable to reconnect Google Search Console.");
    }
  }

  async function handleRefresh() {
    try {
      setError("");
      const response = await loadStatus();
      if (response?.connected) await loadPerformance();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to refresh GSC data.");
    }
  }

  if (loading) {
    return <Layout><Loading text="Loading Google Search Console..." /></Layout>;
  }

  const summary = performance?.summary || {};
  const rows = performance?.rows || [];
  const queryRows = performance?.queryRows || [];
  const pageRows = performance?.pageRows || [];

  return (
    <Layout>
      <div className="gsc-page">
        <div className="crumb"><Link to={`/projects/${projectId}/dashboard`}>Dashboard</Link> / Google Search Console</div>

        <header className="page-header gsc-header">
          <div>
            <small>GOOGLE SEARCH CONSOLE</small>
            <h1>Search Performance</h1>
            <p>Monitor Google organic search performance for {project?.website_url || "this website"}.</p>
          </div>
          <div className="header-actions">
            <Link className="secondary" to={`/projects/${projectId}/dashboard`}>← Dashboard</Link>
            {status?.connected ? (
              <><button className="secondary" onClick={handleRefresh} disabled={performanceLoading}>↻ Refresh</button><button className="secondary" onClick={handleReconnect} disabled={connecting}>{connecting ? "Reconnecting..." : "↻ Reconnect"}</button></>
            ) : (
              <button className="primary" onClick={handleConnect} disabled={connecting}>
                {connecting ? "Connecting..." : "Connect Google"}
              </button>
            )}
          </div>
        </header>

        {error && <div className="alert">{error}</div>}

        <section className="gsc-connection panel">
          <div>
            <small>CONNECTION</small>
            <h2>{status?.connected ? "Google Search Console connected" : "Connect Google Search Console"}</h2>
            <p>{status?.connected ? "Your project is connected and ready to fetch search performance data." : "Connect the Google account that has access to this website's Search Console property."}</p>
          </div>
          <div className="gsc-connection-right">
            <span className={`gsc-status ${status?.connected ? "connected" : "not-connected"}`}>
              <i /> {status?.connected ? "Connected" : "Not connected"}
            </span>
            {status?.connection?.property_url && (
              <strong className="gsc-property">GSC property: {status.connection.property_url}</strong>
            )}
            {status?.connected && <div className="connection-actions"><button className="danger-link" onClick={handleDisconnect}>Disconnect</button></div>}
          </div>
        </section>

        {!status?.connected ? (
          <section className="panel gsc-connect-empty">
            <div className="gsc-google-icon">G</div>
            <h2>Connect your Search Console property</h2>
            <p>After authorization, RKVeda will fetch the property available to your Google account and store the connection against this project.</p>
            <button className="primary" onClick={handleConnect} disabled={connecting}>{connecting ? "Connecting..." : "Connect with Google"}</button>
          </section>
        ) : (
          <>
            <div className="gsc-toolbar">
              <div>
                <small>PERFORMANCE PERIOD</small>
                <strong>{dates.startDate} → {dates.endDate}</strong>
              </div>
              <div className="gsc-toolbar-actions">
                <button className="secondary" onClick={handleSyncHistory} disabled={syncingHistory || performanceLoading}>
                  {syncingHistory ? "Syncing..." : "↻ Sync History"}
                </button>
                <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
                  <option value="all">All countries</option>
                  <option value="ind">India</option>
                  <option value="usa">United States</option>
                  <option value="gbr">United Kingdom</option>
                  <option value="can">Canada</option>
                  <option value="aus">Australia</option>
                  <option value="are">UAE</option>
                  <option value="sgp">Singapore</option>
                  <option value="deu">Germany</option>
                </select>
                <select value={range} onChange={(e) => { setRange(e.target.value); setSyncMessage(""); }}>
                  <option value="7">Last 7 days</option>
                  <option value="28">Last 28 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>

            {performanceLoading && <div className="gsc-loading">Refreshing performance data...</div>}
            {syncMessage && <div className="gsc-sync-success">{syncMessage}</div>}
            {performance?.lastSync?.last_synced_at && (
              <div className="gsc-last-sync">Last history sync: {new Date(performance.lastSync.last_synced_at).toLocaleString("en-IN")}</div>
            )}

            <div className="gsc-metrics">
              <MetricCard label="Clicks" value={formatNumber(summary.clicks)} helper="Google search clicks" />
              <MetricCard label="Impressions" value={formatNumber(summary.impressions)} helper="Search appearances" />
              <MetricCard label="CTR" value={formatPercent(summary.ctrPercent)} helper="Click-through rate" />
              <MetricCard label="Average Position" value={formatPosition(summary.position)} helper="Average search position" />
            </div>

            <section className="panel">
              <div className="panel-title">
                <div><h2>Clicks over time</h2><span className="gsc-subtitle">Daily Google Search Console clicks</span></div>
              </div>
              <MiniChart rows={rows} />
            </section>

            <section className="panel">
              <div className="panel-title"><div><h2>Top Queries</h2><span className="gsc-subtitle">Search terms bringing users to your website</span></div></div>
              <QueryTable projectId={projectId} dates={dates} country={country} />
            </section>

            <section className="panel">
              <div className="panel-title"><div><h2>Top Pages</h2><span className="gsc-subtitle">Pages receiving Google Search traffic</span></div></div>
              <PageTable projectId={projectId} dates={dates} country={country} />
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function QueryTable({ projectId, dates, country }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getGscPerformance(projectId, { ...dates, dimension: "query", country })
      .then((response) => active && setData(response))
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load queries."));
    return () => { active = false; };
  }, [country, dates, projectId]);
  if (error) return <div className="gsc-table-empty">{error}</div>;
  if (!data) return <div className="gsc-table-empty">Loading queries...</div>;
  const rows = (data.rows || []).slice(0, 15);
  if (!rows.length) return <div className="gsc-table-empty">No query data available yet.</div>;
  return <div className="table-wrap"><table><thead><tr><th>Query</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i}><td>{getKey(row)}</td><td>{formatNumber(row.clicks)}</td><td>{formatNumber(row.impressions)}</td><td>{formatPercent(Number(row.ctr || 0) * 100)}</td><td>{formatPosition(row.position)}</td></tr>)}</tbody></table></div>;
}

function PageTable({ projectId, dates, country }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getGscPerformance(projectId, { ...dates, dimension: "page", country })
      .then((response) => active && setData(response))
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load pages."));
    return () => { active = false; };
  }, [country, dates, projectId]);
  if (error) return <div className="gsc-table-empty">{error}</div>;
  if (!data) return <div className="gsc-table-empty">Loading pages...</div>;
  const rows = (data.rows || []).slice(0, 15);
  if (!rows.length) return <div className="gsc-table-empty">No page data available yet.</div>;
  return <div className="table-wrap"><table><thead><tr><th>Page</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i}><td className="gsc-url-cell">{getKey(row)}</td><td>{formatNumber(row.clicks)}</td><td>{formatNumber(row.impressions)}</td><td>{formatPercent(Number(row.ctr || 0) * 100)}</td><td>{formatPosition(row.position)}</td></tr>)}</tbody></table></div>;
}
