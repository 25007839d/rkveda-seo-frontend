import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getKeywordIntelligence } from '../api/seoPlatformApi';

function fmt(n) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n || 0)); }
function fmtPos(n) { return Number(n || 0).toFixed(1); }
function fmtCtr(n) { return `${Number(n || 0).toFixed(2)}%`; }

export default function KeywordIntelligence() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    try {
      setLoading(true); setError('');
      const end = new Date(); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - Number(range) + 1);
      const iso = (d) => d.toISOString().slice(0, 10);
      setData(await getKeywordIntelligence(projectId, { startDate: iso(start), endDate: iso(end) }));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Unable to load keyword intelligence');
    } finally { setLoading(false); }
  }
  useEffect(() => { if (projectId) load(); }, [projectId, range]);

  const rows = useMemo(() => {
    let list = data?.keywords || [];
    if (filter !== 'all') list = list.filter((r) => r.trend === filter);
    if (search.trim()) list = list.filter((r) => r.keyword.toLowerCase().includes(search.trim().toLowerCase()));
    return list;
  }, [data, filter, search]);

  if (loading) return <Layout><Loading text="Loading keyword intelligence..." /></Layout>;
  const s = data?.summary || {};
  const project = data?.propertyUrl || '';

  return <Layout>
    <header className="page-header">
      <div><small>SEO INTELLIGENCE</small><h1>Keyword Intelligence</h1><p>{project}</p></div>
      <div className="header-actions"><Link className="secondary" to={`/projects/${projectId}/seo`}>← SEO Command Center</Link><Link className="secondary" to={`/projects/${projectId}/gsc`}>GSC</Link></div>
    </header>
    {error && <div className="alert">{error}</div>}{data?.gscError && <div className="alert keyword-warning">Google Search Console data is unavailable right now. Tracked keywords are still shown from your project database.</div>}
    <section className="keyword-toolbar panel">
      <div><b>Google Search Console</b><span>{data?.startDate} → {data?.endDate}</span></div>
      <div className="keyword-controls"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search keyword..."/><select value={range} onChange={(e)=>setRange(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="secondary-button" onClick={load}>↻ Refresh</button></div>
    </section>
    <div className="stats keyword-stats">
      <div className="stat-card"><small>Tracked Keywords</small><strong>{fmt(s.keywords)}</strong><span>{fmt(s.noData)} without GSC data</span></div>
      <div className="stat-card"><small>Clicks</small><strong>{fmt(s.clicks)}</strong><span>Organic clicks</span></div>
      <div className="stat-card"><small>Impressions</small><strong>{fmt(s.impressions)}</strong><span>Search appearances</span></div>
      <div className="stat-card"><small>CTR</small><strong>{fmtCtr(s.ctr)}</strong><span>Weighted CTR</span></div>
      <div className="stat-card"><small>Average Position</small><strong>{fmtPos(s.averagePosition)}</strong><span>Weighted by impressions</span></div>
    </div>
    <section className="panel">
      <div className="panel-title"><div><small>QUERY PERFORMANCE</small><h2>Tracked & discovered keywords</h2></div><div className="keyword-trend-summary"><span>↑ {s.improving || 0} improving</span><span>↓ {s.declining || 0} declining</span><span>• {s.noData || 0} no GSC data</span></div></div>
      <div className="filter-tabs keyword-filters">{[['all','All'],['improving','Improving'],['declining','Declining'],['stable','Stable'],['new','New'],['no_data','No GSC data']].map(([v,l])=><button key={v} className={`filter-tab ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>{l}</button>)}</div>
      {rows.length === 0 ? <div className="empty-state">No tracked keywords or Google Search Console queries are available for this period.</div> : <div className="table-wrap"><table><thead><tr><th>Keyword</th><th>Source</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th><th>Change</th><th>Trend</th></tr></thead><tbody>{rows.map((r)=><tr key={r.keyword}><td><b>{r.keyword}</b></td><td>{r.tracked ? 'Tracked' : 'GSC'}</td><td>{fmt(r.clicks)}</td><td>{fmt(r.impressions)}</td><td>{fmtCtr(r.ctrPercent)}</td><td>{r.position === null ? '—' : fmtPos(r.position)}</td><td>{r.positionChange === null ? '—' : `${r.positionChange > 0 ? '+' : ''}${fmtPos(r.positionChange)}`}</td><td><span className={`keyword-trend ${r.trend}`}>{r.trend}</span></td></tr>)}</tbody></table></div>}
    </section>
    <p className="muted keyword-note">Tracked keywords remain visible even without GSC impressions. GSC-only queries are also shown. Position change is calculated against the immediately preceding period of the same length.</p>
  </Layout>;
}
