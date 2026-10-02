
import {useEffect,useState} from 'react';
import {createPublishingJob,listPublishingJobs,publishPublishingJob,cancelPublishingJob} from '../api/socialPublishingApi';

const labels={facebook:'Facebook Page',instagram:'Instagram',gbp:'Google Business Profile'};

export default function PublishingComposer({projectId,allowedPlatforms=['facebook','instagram'],defaultPlatforms=[] ,title='Publish content'}){
 const [caption,setCaption]=useState(''),[mediaUrl,setMediaUrl]=useState(''),[linkUrl,setLinkUrl]=useState(''),[mediaType,setMediaType]=useState('none'),[platforms,setPlatforms]=useState(defaultPlatforms.length?defaultPlatforms:allowedPlatforms.slice(0,1)),[scheduledAt,setScheduledAt]=useState(''),[jobs,setJobs]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){try{const r=await listPublishingJobs(projectId);setJobs(r.jobs||[])}catch(e){setError(e.response?.data?.message||e.message||'Unable to load publishing jobs')}}
 useEffect(()=>{load()},[projectId]);
 function toggle(p){setPlatforms(x=>x.includes(p)?x.filter(v=>v!==p):[...x,p])}
 async function create(e){e.preventDefault();try{setBusy(true);setError('');const r=await createPublishingJob(projectId,{caption,mediaUrl:mediaUrl||null,mediaType,linkUrl:linkUrl||null,platforms,scheduledAt:scheduledAt?new Date(scheduledAt).toISOString():null});setCaption('');setMediaUrl('');setLinkUrl('');setScheduledAt('');await load();if(r.job?.status==='draft')await publishPublishingJob(projectId,r.job.id);await load()}catch(e){setError(e.response?.data?.message||e.message||'Unable to publish content')}finally{setBusy(false)}}
 async function publish(id){try{setBusy(true);setError('');await publishPublishingJob(projectId,id);await load()}catch(e){setError(e.response?.data?.message||e.message||'Unable to publish')}finally{setBusy(false)}}
 async function cancel(id){try{setBusy(true);await cancelPublishingJob(projectId,id);await load()}catch(e){setError(e.response?.data?.message||e.message)}finally{setBusy(false)}}
 return <section className="panel publishing-composer">
   <div className="panel-title"><div><small>CONTENT PUBLISHING</small><h2>{title}</h2><span>Use official provider APIs. Existing analytics/sync workflows remain separate.</span></div></div>
   {error&&<div className="alert">{error}</div>}
   <form onSubmit={create}>
    <label>Message / caption<textarea rows="4" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write your post..." required/></label>
    <div className="publish-platforms"><span>Publish to</span>{allowedPlatforms.map(p=><label key={p}><input type="checkbox" checked={platforms.includes(p)} onChange={()=>toggle(p)}/>{labels[p]}</label>)}</div>
    <div className="publish-grid">
      <label>Media type<select value={mediaType} onChange={e=>setMediaType(e.target.value)}><option value="none">No media</option><option value="image">Image</option><option value="video">Video</option></select></label>
      <label>Public media URL<input value={mediaUrl} onChange={e=>setMediaUrl(e.target.value)} placeholder="https://..."/></label>
      <label>CTA / link URL<input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://..."/></label>
      <label>Schedule (optional)<input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)}/></label>
    </div>
    <button className="primary" disabled={busy||!caption.trim()||!platforms.length}>{busy?'Working...':scheduledAt?'Schedule / queue':'Publish now'}</button>
   </form>
   <div className="publish-jobs"><div className="panel-title"><div><small>RECENT JOBS</small><h3>Publishing history</h3></div></div>{!jobs.length?<p className="muted">No publishing jobs yet.</p>:<div className="table-wrap"><table><thead><tr><th>Created</th><th>Platforms</th><th>Status</th><th>Scheduled</th><th>Action</th></tr></thead><tbody>{jobs.slice(0,10).map(j=><tr key={j.id}><td>{j.created_at}</td><td>{j.platforms}</td><td>{j.status}</td><td>{j.scheduled_at||'—'}</td><td>{['draft','failed','partial'].includes(j.status)&&<button className="secondary" onClick={()=>publish(j.id)} disabled={busy}>Publish / Retry</button>}{['draft','scheduled','failed'].includes(j.status)&&<button className="danger-link" onClick={()=>cancel(j.id)} disabled={busy}>Cancel</button>}</td></tr>)}</tbody></table></div>}</div>
 </section>
}
