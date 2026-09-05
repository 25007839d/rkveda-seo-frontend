import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";

const services = [
  {
    id: "gsc",
    short: "GSC",
    title: "Google Search Console",
    purpose: "Organic search performance, queries, clicks, impressions, CTR and average position.",
    api: "Google Search Console API",
    apis: ["Search Console API"],
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    callback: "https://api.rkveda.in/api/gsc/callback",
    localCallback: "http://localhost:3000/api/gsc/callback",
    account: "Google account that has access to the website's Search Console property.",
    steps: [
      "In Google Cloud Console, select the RKVeda Google Cloud project.",
      "Open APIs & Services → Library and enable Search Console API.",
      "Open Google Auth Platform → Branding / Audience and keep the OAuth app configured. If the app is in Testing, add the real website owner/test account under Test users.",
      "Open Google Auth Platform → Clients and use the Web application OAuth client used by RKVeda.",
      "Add the production callback URI shown below to Authorized redirect URIs.",
      "During RKVeda connection, sign in with the Google account that actually has access to the required Search Console property.",
      "RKVeda stores the OAuth connection against the selected RKVeda project and reads Search Console data with read-only access."
    ]
  },
  {
    id: "ga4",
    short: "GA4",
    title: "Google Analytics 4",
    purpose: "Website traffic, users, sessions, engagement and other GA4 reporting data.",
    api: "Google Analytics Admin API + Google Analytics Data API",
    apis: ["Google Analytics Admin API", "Google Analytics Data API"],
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    callback: "https://api.rkveda.in/api/ga4/callback",
    localCallback: "http://localhost:3000/api/ga4/callback",
    account: "Google account that has access to the GA4 property.",
    steps: [
      "In Google Cloud Console, select the RKVeda Google Cloud project.",
      "Open APIs & Services → Library and enable Google Analytics Admin API.",
      "Enable Google Analytics Data API.",
      "Configure the same OAuth consent screen / Google Auth Platform application and add the real test user if the app is in Testing.",
      "Open the Web application OAuth client and add the GA4 production callback URI shown below.",
      "Connect from RKVeda and sign in with the Google account that has access to the desired GA4 property.",
      "RKVeda lists accessible GA4 properties; select the property for this RKVeda website project.",
      "The integration is read-only; RKVeda does not modify the Analytics property."
    ]
  },
  {
    id: "gbp",
    short: "GBP",
    title: "Google Business Profile",
    purpose: "Local SEO visibility, Maps/Search performance, calls, website clicks, direction requests and reviews.",
    api: "Business Profile APIs",
    apis: [
      "Business Profile APIs / Business Profile Business Information API",
      "Business Profile Performance API",
      "Business Profile Account Management API",
      "Google My Business API (reviews endpoint used by this build)"
    ],
    scope: "https://www.googleapis.com/auth/business.manage",
    callback: "https://api.rkveda.in/api/gbp/callback",
    localCallback: "http://localhost:3000/api/gbp/callback",
    account: "Google account that owns or manages the Business Profile.",
    steps: [
      "In Google Cloud Console, select the RKVeda Google Cloud project.",
      "Enable the Business Profile APIs required by the current Google Cloud console/API availability for your project. This build uses Account Management, Business Information, Performance and the My Business reviews endpoint.",
      "Complete the Google Business Profile API access/approval requirements for the project if Google requires them. OAuth alone does not automatically grant Business Profile API product access.",
      "Configure the OAuth consent screen and add the real GBP owner/manager account as a Test user while the app is in Testing.",
      "Add the GBP production callback URI to the Web application OAuth client.",
      "Connect from RKVeda using the Google account that actually manages the Business Profile.",
      "RKVeda first discovers GBP accounts and locations; then you select the location belonging to the RKVeda website project.",
      "RKVeda uses the business.manage scope and reads profile, performance and review information."
    ]
  },
  {
    id: "youtube",
    short: "YouTube",
    title: "YouTube + YouTube Analytics",
    purpose: "Channel subscribers, video count, video views, likes, comments and YouTube Analytics daily metrics.",
    api: "YouTube Data API v3 + YouTube Analytics API",
    apis: ["YouTube Data API v3", "YouTube Analytics API"],
    scope: "https://www.googleapis.com/auth/youtube.readonly\nhttps://www.googleapis.com/auth/yt-analytics.readonly",
    callback: "https://api.rkveda.in/api/social/callback",
    localCallback: "http://localhost:3000/api/social/callback",
    account: "Google account that owns the YouTube channel. A Google account with no YouTube channel will return 'No YouTube channel was found'.",
    steps: [
      "In Google Cloud Console, select the RKVeda Google Cloud project.",
      "Open APIs & Services → Library and enable YouTube Data API v3.",
      "Enable YouTube Analytics API.",
      "In Google Auth Platform → Audience, add the actual YouTube owner account as a Test user if the app is in Testing.",
      "In Google Auth Platform → Data Access, ensure the YouTube read-only and YouTube Analytics read-only scopes are configured for the OAuth app.",
      "In Google Auth Platform → Clients, use the Web application OAuth client and add the YouTube callback URI shown below.",
      "From RKVeda, click Connect API and select the Google account that actually owns the YouTube channel.",
      "RKVeda calls channels.list(mine=true), detects the channel, stores the connection, then Sync Now imports channel/video/analytics data.",
      "Do not create a YouTube channel under the GCP developer account just to make OAuth work. The developer account and resource-owner account can be different."
    ]
  }
];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }
  return <button className="secondary guide-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>;
}

function ServiceTab({ active, service, onClick }) {
  return (
    <button className={`guide-tab ${active === service.id ? "active" : ""}`} onClick={() => onClick(service.id)}>
      <strong>{service.short}</strong>
      <span>{service.title}</span>
    </button>
  );
}

export default function GoogleServicesGuide() {
  const { projectId } = useParams();
  const [active, setActive] = useState("overview");
  const service = services.find(x => x.id === active);

  return (
    <Layout>
      <header className="page-header">
        <div>
          <small>INTEGRATION GUIDE</small>
          <h1>Google Services Setup Guide</h1>
          <p>How RKVeda uses the Google Cloud project, OAuth and the four Google data services.</p>
        </div>
        <div className="header-actions">
          <Link className="secondary" to={`/projects/${projectId}/seo`}>← SEO Command Center</Link>
          <Link className="secondary" to={`/projects/${projectId}/dashboard`}>Dashboard</Link>
        </div>
      </header>

      <section className="panel guide-intro">
        <div className="guide-architecture">
          <div><small>DEVELOPER / APP ACCOUNT</small><b>dushkumar54@gmail.com</b><span>Owns/manages the Google Cloud project and OAuth client.</span></div>
          <div className="guide-arrow">→</div>
          <div><small>RKVeda APPLICATION</small><b>Google OAuth Client</b><span>One OAuth application can authorize the supported Google services.</span></div>
          <div className="guide-arrow">→</div>
          <div><small>RESOURCE OWNER</small><b>Business / channel Google account</b><span>Must have access to the actual GSC, GA4, GBP or YouTube resource.</span></div>
        </div>
        <div className="guide-note">
          <b>Important:</b> The Google Cloud developer account does not have to be the owner of the customer's Google resources.
          For example, <b>dushkumar54@gmail.com</b> can manage the GCP/OAuth setup while <b>infinityaicloudacademy@gmail.com</b> authorizes the actual YouTube or business resources.
        </div>
      </section>

      <section className="panel guide-tabs-panel">
        <div className="guide-tabs">
          <button className={`guide-tab ${active === "overview" ? "active" : ""}`} onClick={() => setActive("overview")}>
            <strong>START</strong><span>Overall checklist</span>
          </button>
          {services.map(s => <ServiceTab key={s.id} active={active} service={s} onClick={setActive} />)}
        </div>
      </section>

      {active === "overview" && (
        <>
          <section className="grid guide-grid">
            {services.map(s => (
              <button key={s.id} className="panel guide-service-card" onClick={() => setActive(s.id)}>
                <div className="guide-card-top"><span className="guide-badge">{s.short}</span><b>Google Cloud</b></div>
                <h2>{s.title}</h2>
                <p>{s.purpose}</p>
                <span className="guide-card-link">Open setup →</span>
              </button>
            ))}
          </section>

          <section className="panel">
            <div className="panel-head"><div><small>ONE-TIME GOOGLE CLOUD SETUP</small><h2>What we configure under dushkumar54@gmail.com</h2></div></div>
            <ol className="guide-checklist">
              <li><b>Select the RKVeda Google Cloud project.</b> Keep the existing project that owns the OAuth client.</li>
              <li><b>Enable APIs.</b> Turn on only the APIs required by the four integrations listed in this guide.</li>
              <li><b>Configure Google Auth Platform.</b> Set app branding, audience/test users and the required data-access scopes.</li>
              <li><b>Create/use a Web application OAuth client.</b> Register the exact RKVeda backend callback URLs. Do not use a frontend URL as an OAuth callback.</li>
              <li><b>Add real resource-owner accounts as test users</b> while the OAuth app is in Testing.</li>
              <li><b>Keep secrets on the backend.</b> GOOGLE_CLIENT_SECRET and provider secrets must never be placed in frontend code.</li>
            </ol>
          </section>

          <section className="panel">
            <div className="panel-head"><div><small>ENVIRONMENT VARIABLES</small><h2>Backend configuration used by the current build</h2></div></div>
            <div className="guide-env-table">
              <div><b>Google OAuth</b><code>GOOGLE_CLIENT_ID</code><code>GOOGLE_CLIENT_SECRET</code></div>
              <div><b>GSC</b><code>GOOGLE_REDIRECT_URI</code><span>Production: https://api.rkveda.in/api/gsc/callback</span></div>
              <div><b>GA4</b><code>GOOGLE_GA4_REDIRECT_URI</code><span>Production: https://api.rkveda.in/api/ga4/callback</span></div>
              <div><b>GBP</b><code>GOOGLE_GBP_REDIRECT_URI</code><span>Production: https://api.rkveda.in/api/gbp/callback</span></div>
              <div><b>YouTube</b><code>GOOGLE_SOCIAL_REDIRECT_URI</code><span>Production: https://api.rkveda.in/api/social/callback</span></div>
            </div>
          </section>
        </>
      )}

      {service && (
        <section className="guide-detail">
          <section className="panel">
            <div className="panel-title">
              <div><small>{service.short} SETUP</small><h2>{service.title}</h2><span>{service.purpose}</span></div>
              <span className="status-pill success">OAuth + API</span>
            </div>
            <div className="guide-meta-grid">
              <div><small>GOOGLE CLOUD API</small><b>{service.api}</b></div>
              <div><small>RESOURCE ACCOUNT</small><b>{service.account}</b></div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><div><small>APIS TO ENABLE</small><h2>Google Cloud → APIs & Services → Library</h2></div></div>
            <ul className="guide-api-list">{service.apis.map(api => <li key={api}><b>{api}</b><span>Enable in the same RKVeda Google Cloud project.</span></li>)}</ul>
          </section>

          <section className="panel">
            <div className="panel-head"><div><small>STEP-BY-STEP</small><h2>Setup checklist</h2></div></div>
            <ol className="guide-numbered">{service.steps.map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol>
          </section>

          <section className="grid guide-grid">
            <div className="panel">
              <div className="panel-head"><div><small>OAUTH SCOPE</small><h2>Data access</h2></div></div>
              <div className="guide-code-list">
                {service.scope.split("\n").map(x => <div key={x}><code>{x}</code><CopyButton value={x}/></div>)}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><div><small>REDIRECT URI</small><h2>Production</h2></div></div>
              <div className="guide-code-list">
                <div><code>{service.callback}</code><CopyButton value={service.callback}/></div>
                <div className="guide-muted"><b>Local:</b> <code>{service.localCallback}</code></div>
              </div>
            </div>
          </section>

          <section className="panel guide-warning">
            <div className="panel-head"><div><small>COMMON MISTAKE</small><h2>Who should sign in during Connect?</h2></div></div>
            <p><b>Google Cloud developer account ≠ resource owner account.</b> The OAuth app can live under dushkumar54@gmail.com, while the person connecting RKVeda signs in with the account that actually owns/manages the service.</p>
            <p>For YouTube specifically, if the authorized Google account has <b>“No channel”</b>, the API will correctly return no channel. Do not create a duplicate channel just to satisfy the OAuth application.</p>
          </section>
        </section>
      )}

      <section className="panel guide-footer-note">
        <b>Production rule:</b> Keep the Google Cloud project/OAuth client under the developer/admin account, keep resource ownership with the business owner, and keep OAuth tokens/secrets only on the RKVeda backend.
      </section>
    </Layout>
  );
}
