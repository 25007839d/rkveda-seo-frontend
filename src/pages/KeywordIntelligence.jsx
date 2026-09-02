import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getKeywordIntelligence } from '../api/seoPlatformApi';
import { getGscDateRange } from '../utils/gscDateRange';

function fmt(n) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n || 0)); }
function fmtPos(n) { return Number(n || 0).toFixed(1); }
function fmtCtr(n) { return `${Number(n || 0).toFixed(2)}%`; }
const COUNTRY_NAMES = { ind: 'India', usa: 'United States', gbr: 'United Kingdom', can: 'Canada', aus: 'Australia', are: 'UAE', sgp: 'Singapore', deu: 'Germany' };
function countryLabel(code) { return COUNTRY_NAMES[String(code || '').toLowerCase()] || (code ? String(code).toUpperCase() : '—'); }

export default function KeywordIntelligence() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');

  async function load() {
    try {
      setLoading(true); setError('');
      const dates = getGscDateRange(range);
      setData(await getKeywordIntelligence(projectId, { ...dates, country }));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Unable to load keyword intelligence');
    } finally { setLoading(false); }
  }
  useEffect(() => { if (projectId) load(); }, [projectId, range, country]);

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
      <div className="keyword-controls"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search keyword..."/><select value={country} onChange={(e)=>setCountry(e.target.value)} aria-label="Country"><option value="all">All countries</option><option value="ind">India</option><option value="usa">United States</option><option value="gbr">United Kingdom</option><option value="can">Canada</option><option value="aus">Australia</option><option value="are">UAE</option><option value="sgp">Singapore</option><option value="deu">Germany</option></select><select value={range} onChange={(e)=>setRange(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="secondary-button" onClick={load}>↻ Refresh</button></div>
    </section>
    <div className="stats keyword-stats">
      <div className="stat-card"><small>Tracked Keywords</small><strong>{fmt(s.keywords)}</strong><span>{fmt(s.noData)} without GSC data</span></div>
      <div className="stat-card"><small>Clicks</small><strong>{fmt(s.clicks)}</strong><span>Organic clicks</span></div>
      <div className="stat-card"><small>Impressions</small><strong>{fmt(s.impressions)}</strong><span>GSC property total</span></div>
      <div className="stat-card"><small>Query-attributed</small><strong>{fmt(s.queryLevelImpressions)}</strong><span>Returned with a query</span></div>
      <div className="stat-card"><small>Unattributed GSC</small><strong>{fmt(s.unattributedImpressions)}</strong><span>Anonymized/omitted query rows</span></div>
      <div className="stat-card"><small>CTR</small><strong>{fmtCtr(s.ctr)}</strong><span>Weighted CTR</span></div>
      <div className="stat-card"><small>Average Position</small><strong>{fmtPos(s.averagePosition)}</strong><span>Weighted by impressions</span></div>
    </div>
    {data?.queryLevel?.note && <div className="keyword-reconciliation muted">GSC reconciliation: {fmt(data.queryLevel.impressions)} query-attributed of {fmt(data.gscAggregate?.impressions)} total impressions. {fmt(data.queryLevel.unattributedImpressions)} remain unattributed because Search Console does not return those anonymized/rare queries at query level.</div>}
    <section className="panel">
      <div className="panel-title"><div><small>QUERY PERFORMANCE</small><h2>Tracked & discovered keywords</h2></div><div className="keyword-trend-summary"><span>↑ {s.improving || 0} improving</span><span>↓ {s.declining || 0} declining</span><span>• {s.noData || 0} no GSC data</span></div></div>
      <div className="filter-tabs keyword-filters">{[['all','All'],['improving','Improving'],['declining','Declining'],['stable','Stable'],['new','New'],['no_data','No GSC data']].map(([v,l])=><button key={v} className={`filter-tab ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>{l}</button>)}</div>
      {rows.length === 0 ? <div className="empty-state">No tracked keywords or Google Search Console queries are available for this period.</div> : <div className="table-wrap"><table><thead><tr><th>Keyword</th><th>Country</th><th>Source</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th><th>Change</th><th>Trend</th></tr></thead><tbody>{rows.map((r)=><tr key={`${r.keyword}-${r.keywordId || 'gsc'}`}><td><b>{r.keyword}</b></td><td>{countryLabel(r.country)}</td><td>{r.tracked ? (r.hasGscData ? 'Tracked + GSC' : 'Tracked • query not returned') : 'GSC'}</td><td>{fmt(r.clicks)}</td><td>{fmt(r.impressions)}</td><td>{fmtCtr(r.ctrPercent)}</td><td>{r.position === null ? '—' : fmtPos(r.position)}</td><td>{r.positionChange === null ? '—' : `${r.positionChange > 0 ? '+' : ''}${fmtPos(r.positionChange)}`}</td><td><span className={`keyword-trend ${r.trend}`}>{r.trend}</span></td></tr>)}</tbody></table></div>}
    </section>
    <section className="panel keyword-country-panel"><div className="panel-title"><div><small>COUNTRY PERFORMANCE</small><h2>Where your searches appeared</h2></div></div>{(data?.countries||[]).length?<div className="table-wrap"><table><thead><tr><th>Country</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{data.countries.map((c)=><tr key={c.country}><td><b>{countryLabel(c.country)}</b></td><td>{fmt(c.clicks)}</td><td>{fmt(c.impressions)}</td><td>{fmtCtr(c.ctr)}</td><td>{c.position==null?'—':fmtPos(c.position)}</td></tr>)}</tbody></table></div>:<div className="empty-state">No country-level GSC data for this period.</div>}</section>
    <p className="muted keyword-note">Date range and country filters use the same GSC scope as the GSC page. Property totals come from the aggregate GSC report; keyword rows use query-level data. If Google omits an anonymized/rare query, its impression remains in the GSC total and is shown as unattributed instead of being falsely assigned to a tracked keyword.</p>
  </Layout>;
}
