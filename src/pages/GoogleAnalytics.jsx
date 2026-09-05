import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getProject } from '../api/projectApi';
import { connectGa4, disconnectGa4, getGa4Properties, getGa4Report, getGa4Status, selectGa4Property } from '../api/ga4Api';

const fmt = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(Number(v || 0));
const pct = (v) => `${(Number(v || 0) * 100).toFixed(2)}%`;

function rangeDates(days) {
  const end = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(end); start.setDate(start.getDate() - (days - 1));
  const iso = (d) => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
  return { startDate: iso(start), endDate: iso(end) };
}

function Metric({ label, value, helper }) { return <div className="stat-card"><small>{label}</small><strong>{value}</strong><span>{helper}</span></div>; }

export default function GoogleAnalytics() {
  const { projectId } = useParams();
  const [params, setParams] = useSearchParams();
  const [project, setProject] = useState(null); const [status, setStatus] = useState(null); const [properties, setProperties] = useState([]); const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true); const [reportLoading, setReportLoading] = useState(false); const [connecting, setConnecting] = useState(false); const [selecting, setSelecting] = useState(false); const [error, setError] = useState(''); const [range, setRange] = useState(30);
  const dates = useMemo(() => rangeDates(Number(range)), [range]);

  const loadStatus = useCallback(async () => { const r=await getGa4Status(projectId); setStatus(r); return r; }, [projectId]);
  const loadProperties = useCallback(async () => { const r=await getGa4Properties(projectId); setProperties(r.properties || []); return r; }, [projectId]);
  const loadReport = useCallback(async () => { if (!status?.propertySelected) return; try { setReportLoading(true); setError(''); setReport(await getGa4Report(projectId, dates)); } catch(e){ setError(e.response?.data?.message || e.message || 'Unable to load GA4 data'); } finally { setReportLoading(false); } }, [projectId, status?.propertySelected, dates]);

  useEffect(() => { const e=params.get('ga4_error'); const c=params.get('ga4_connected'); if(e)setError(e); if(e||c) setParams({}, {replace:true}); }, [params,setParams]);
  useEffect(() => { let active=true; (async()=>{ try { setLoading(true); const [p,s]=await Promise.all([getProject(projectId),loadStatus()]); if(!active)return; setProject(p?.project||null); if(s?.connected && !s?.propertySelected) await loadProperties(); } catch(e){if(active)setError(e.response?.data?.message||e.message||'Unable to load Google Analytics');} finally{if(active)setLoading(false);} })(); return ()=>{active=false}; }, [projectId,loadStatus,loadProperties]);
  useEffect(() => { if(status?.propertySelected) loadReport(); }, [loadReport,status?.propertySelected]);

  async function connect() { try { setConnecting(true); setError(''); const r=await connectGa4(projectId); window.location.href=r.authorizationUrl; } catch(e){setError(e.response?.data?.message||e.message||'Unable to start GA4 connection'); setConnecting(false);} }
  async function disconnect() {
    if (!window.confirm('Disconnect Google Analytics 4 for this project?')) return;
    try { setError(''); await disconnectGa4(projectId); setStatus({ connected:false, propertySelected:false, connection:null }); setProperties([]); setReport(null); }
    catch(e){ setError(e.response?.data?.message||e.message||'Unable to disconnect Google Analytics 4'); }
  }
  async function reconnect() {
    try { setConnecting(true); setError(''); await disconnectGa4(projectId); const r=await connectGa4(projectId); window.location.href=r.authorizationUrl; }
    catch(e){ setError(e.response?.data?.message||e.message||'Unable to reconnect Google Analytics 4'); setConnecting(false); }
  }

  async function chooseProperty(e) { const id=e.target.value; if(!id)return; try{setSelecting(true);setError('');await selectGa4Property(projectId,id);await loadStatus();}catch(err){setError(err.response?.data?.message||err.message||'Unable to select GA4 property');}finally{setSelecting(false);} }

  if(loading) return <Layout><Loading text="Loading Google Analytics 4..."/></Layout>;
  const s=report?.summary||{};
  return <Layout><header className="page-header"><div><small>ANALYTICS INTELLIGENCE</small><h1>Google Analytics 4</h1><p>{project?.website_url}</p></div><div className="header-actions"><Link className="secondary" to={`/projects/${projectId}/seo`}>← SEO Command Center</Link><Link className="secondary" to={`/projects/${projectId}/gsc`}>GSC</Link></div></header>
  {error&&<div className="alert">{error}</div>}
  {!status?.connected ? <section className="panel ga4-connect-card"><div className="panel-title"><div><small>GOOGLE ANALYTICS 4</small><h2>Connect your GA4 property</h2><span>Project-scoped OAuth. RKVeda reads reporting data only and does not modify your Analytics property.</span></div><span className="status-pill">Not connected</span></div><button className="primary" onClick={connect} disabled={connecting}>{connecting?'Redirecting…':'Connect Google Analytics 4'}</button></section> : !status?.propertySelected ? <section className="panel"><div className="panel-title"><div><small>PROPERTY SELECTION</small><h2>Select GA4 property</h2><span>Choose the Analytics property that belongs to this RKVeda project.</span></div><span className="status-pill success">Google connected</span></div><select className="ga4-property-select" defaultValue="" onChange={chooseProperty} disabled={selecting}><option value="">Select a property…</option>{properties.map(p=><option key={p.propertyId} value={p.propertyId}>{p.propertyName} · {p.propertyId} · {p.accountName}</option>)}</select>{!properties.length&&<div className="empty-state">No GA4 properties were returned for this Google account. Verify the account has access to a GA4 property.</div>}</section> : <>
  <section className="panel ga4-connected"><div><small>CONNECTED PROPERTY</small><h2>{status.connection.property_name}</h2><span>{status.connection.account_name || 'Google Analytics'} · Property ID {status.connection.property_id}</span></div><div className="connection-actions"><button className="secondary" onClick={async()=>{try{setError('');await loadProperties();setStatus({...status,propertySelected:false});}catch(e){setError(e.response?.data?.message||e.message)}}}>Change property</button><button className="secondary" onClick={reconnect} disabled={connecting}>{connecting?'Reconnecting…':'↻ Reconnect'}</button><button className="danger-link" onClick={disconnect}>Disconnect</button></div></section>
  <div className="filter-tabs"><button className={`filter-tab ${range===7?'active':''}`} onClick={()=>setRange(7)}>7 days</button><button className={`filter-tab ${range===30?'active':''}`} onClick={()=>setRange(30)}>30 days</button><button className={`filter-tab ${range===90?'active':''}`} onClick={()=>setRange(90)}>90 days</button></div>
  {reportLoading&&<div className="loading"><span className="spinner"/> Loading GA4 report…</div>}
  <section className="stats"><Metric label="Active users" value={fmt(s.activeUsers)} helper="Unique active users"/><Metric label="New users" value={fmt(s.newUsers)} helper="New users acquired"/><Metric label="Sessions" value={fmt(s.sessions)} helper="Sessions"/><Metric label="Page views" value={fmt(s.screenPageViews)} helper="Screen/page views"/><Metric label="Engagement rate" value={pct(s.engagementRate)} helper="Engaged sessions rate"/><Metric label="Avg. session" value={`${Number(s.averageSessionDuration||0).toFixed(0)}s`} helper="Average session duration"/></section>
  <div className="grid"><section className="panel"><div className="panel-title"><div><small>TOP PAGES</small><h2>Most viewed pages</h2></div></div>{report?.topPages?.length?<div className="table-wrap"><table><thead><tr><th>Page</th><th>Views</th><th>Users</th><th>Avg session</th></tr></thead><tbody>{report.topPages.map((x,i)=><tr key={`${x.pagePath}-${i}`}><td><b>{x.pagePath||'/'}</b></td><td>{fmt(x.screenPageViews)}</td><td>{fmt(x.activeUsers)}</td><td>{Number(x.averageSessionDuration||0).toFixed(0)}s</td></tr>)}</tbody></table></div>:<div className="empty-state">No page data for this period.</div>}</section>
  <section className="panel"><div className="panel-title"><div><small>ACQUISITION</small><h2>Channel performance</h2></div></div>{report?.channels?.length?<div className="table-wrap"><table><thead><tr><th>Channel</th><th>Sessions</th><th>Users</th><th>Engagement</th></tr></thead><tbody>{report.channels.map((x,i)=><tr key={`${x.sessionDefaultChannelGroup}-${i}`}><td><b>{x.sessionDefaultChannelGroup||'Unassigned'}</b></td><td>{fmt(x.sessions)}</td><td>{fmt(x.activeUsers)}</td><td>{pct(x.engagementRate)}</td></tr>)}</tbody></table></div>:<div className="empty-state">No channel data for this period.</div>}</section></div>
  <section className="panel"><div className="panel-title"><div><small>DAILY TREND</small><h2>Users, sessions & page views</h2></div><span>{dates.startDate} → {dates.endDate}</span></div>{report?.trend?.length?<div className="table-wrap"><table><thead><tr><th>Date</th><th>Users</th><th>Sessions</th><th>Page views</th></tr></thead><tbody>{report.trend.slice(-31).map(x=><tr key={x.date}><td>{x.date}</td><td>{fmt(x.activeUsers)}</td><td>{fmt(x.sessions)}</td><td>{fmt(x.screenPageViews)}</td></tr>)}</tbody></table></div>:<div className="empty-state">No trend data for this period.</div>}</section>
  </>}
  </Layout>;
}
