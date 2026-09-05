import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getGa4Status, getGa4Properties, connectGa4, selectGa4Property, getGa4Report } from '../api/seoPlatformApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(Number(v || 0));
const pct = (v) => `${(Number(v || 0) * 100).toFixed(1)}%`;

export default function GoogleAnalytics4() {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get('ga4_error') || '');
  const [startDate, setStartDate] = useState(() => { const d=new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); });
  const [endDate, setEndDate] = useState(() => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); });

  async function load() {
    try {
      setLoading(true); setError('');
      const s = await getGa4Status(projectId); setStatus(s);
      if (s.connection?.status === 'needs_property') {
        const p = await getGa4Properties(projectId); setProperties(p.properties || []);
      }
      if (s.connected) {
        const r = await getGa4Report(projectId, { startDate, endDate }); setReport(r);
      }
    } catch (e) { setError(e.response?.data?.message || e.message || 'Unable to load Google Analytics 4'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (projectId) load(); }, [projectId]);

  async function beginConnect() {
    try { setBusy(true); setError(''); const r = await connectGa4(projectId); window.location.href = r.authorizationUrl; }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to start GA4 connection'); setBusy(false); }
  }
  async function saveProperty(e) {
    e.preventDefault(); if (!selected) return;
    try { setBusy(true); setError(''); await selectGa4Property(projectId, { property_id: selected }); await load(); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to connect GA4 property'); }
    finally { setBusy(false); }
  }
  async function refreshReport() {
    try { setBusy(true); setError(''); setReport(await getGa4Report(projectId, { startDate, endDate })); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to load GA4 report'); }
    finally { setBusy(false); }
  }

  const totals = report?.totals || {};
  const rows = report?.rows || [];
  const chartRows = useMemo(() => rows.slice(-14), [rows]);
  if (loading) return <Layout><Loading text="Loading Google Analytics 4..." /></Layout>;

  return <Layout>
    <header className="page-header">
      <div><small>ANALYTICS INTELLIGENCE</small><h1>Google Analytics 4</h1><p>Project GA4 connection and website engagement data</p></div>
      <div className="header-actions"><Link className="secondary" to={`/projects/${projectId}/seo`}>← SEO Command Center</Link><Link className="secondary" to={`/projects/${projectId}/gsc`}>GSC</Link></div>
    </header>
    {error && <div className="alert">{error}</div>}

    {!status?.connected && status?.connection?.status !== 'needs_property' && <section className="panel ga4-connect-panel">
      <div className="ga4-connect-icon">A</div><h2>Connect Google Analytics 4</h2>
      <p>Connect the Google account that has access to your GA4 property. RKVeda stores the project-scoped OAuth connection and never asks for your Google password.</p>
      <button className="primary" onClick={beginConnect} disabled={busy}>{busy ? 'Connecting...' : 'Connect Google Analytics 4'}</button>
    </section>}

    {status?.connection?.status === 'needs_property' && <section className="panel">
      <div className="panel-title"><div><small>SELECT PROPERTY</small><h2>Choose the GA4 property for this project</h2><span>Google account: {status.connection.google_email || 'connected Google account'}</span></div></div>
      <form className="ga4-property-form" onSubmit={saveProperty}><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select a GA4 property</option>{properties.map(p=><option key={p.property_id} value={p.property_id}>{p.property_name} · {p.property_id}</option>)}</select><button className="primary" disabled={!selected || busy}>{busy?'Saving...':'Use this property'}</button></form>
      {properties.length===0 && <p className="muted">No accessible GA4 properties were returned for this Google account.</p>}
    </section>}

    {status?.connected && <>
      <section className="panel ga4-connection-card"><div><small>CONNECTED PROPERTY</small><h2>{status.connection.property_name || `GA4 property ${status.connection.property_id}`}</h2><p>Property ID: <b>{status.connection.property_id}</b>{status.connection.google_email ? ` · ${status.connection.google_email}` : ''}</p></div><span className="status-pill success">Connected</span></section>
      <section className="panel ga4-toolbar"><div><small>DATE RANGE</small><strong>{startDate} → {endDate}</strong></div><div className="ga4-date-controls"><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /><button className="primary" onClick={refreshReport} disabled={busy}>{busy?'Loading...':'Refresh'}</button></div></section>
      <section className="gsc-metrics"><div className="gsc-metric-card"><span>Active users</span><strong>{fmt(totals.activeUsers)}</strong><small>Unique active users reported by GA4</small></div><div className="gsc-metric-card"><span>Sessions</span><strong>{fmt(totals.sessions)}</strong><small>Total sessions</small></div><div className="gsc-metric-card"><span>Page views</span><strong>{fmt(totals.screenPageViews)}</strong><small>Screen/page views</small></div><div className="gsc-metric-card"><span>Engagement rate</span><strong>{pct(totals.engagementRate)}</strong><small>Average daily engagement rate</small></div></section>
      <div className="grid"><section className="panel"><div className="panel-title"><div><small>GA4 PERFORMANCE</small><h2>Daily traffic</h2></div></div>{chartRows.length===0?<div className="empty-state">No GA4 data for this date range.</div>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Users</th><th>New users</th><th>Sessions</th><th>Engaged sessions</th><th>Views</th><th>Conversions</th></tr></thead><tbody>{chartRows.map(r=><tr key={r.date}><td>{r.date}</td><td>{fmt(r.activeUsers)}</td><td>{fmt(r.newUsers)}</td><td>{fmt(r.sessions)}</td><td>{fmt(r.engagedSessions)}</td><td>{fmt(r.screenPageViews)}</td><td>{fmt(r.conversions)}</td></tr>)}</tbody></table></div>}</section><section className="panel"><div className="panel-title"><div><small>ENGAGEMENT</small><h2>GA4 signals</h2></div></div><div className="summary"><div><span>New users</span><b>{fmt(totals.newUsers)}</b></div><div><span>Engaged sessions</span><b>{fmt(totals.engagedSessions)}</b></div><div><span>Conversions</span><b>{fmt(totals.conversions)}</b></div><div><span>Avg session duration</span><b>{Number(totals.averageSessionDuration||0).toFixed(1)} sec</b></div></div></section></div>
    </>}
  </Layout>;
}
