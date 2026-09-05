import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";

const providers = [
  {
    id: "meta",
    short: "META",
    title: "Facebook + Instagram",
    purpose: "Connect Facebook Pages and Instagram professional accounts through the Meta Graph API.",
    credentials: ["META_APP_ID", "META_APP_SECRET", "META_REDIRECT_URI"],
    callback: "https://api.rkveda.in/api/social/callback",
    localCallback: "http://localhost:3000/api/social/callback",
    scopes: [
      "pages_show_list",
      "pages_read_engagement",
      "read_insights",
      "instagram_basic",
      "instagram_manage_insights"
    ],
    steps: [
      "Create/select the Meta developer app that will be used by RKVeda.",
      "Add the Facebook Login product and configure the Valid OAuth Redirect URI shown below.",
      "Keep the App ID and App Secret on the RKVeda backend only.",
      "Request/enable the permissions required by the RKVeda connector: pages_show_list, pages_read_engagement, read_insights, instagram_basic and instagram_manage_insights. Meta may require App Review/Business verification before production access.",
      "For Facebook, the connecting person must manage a Facebook Page.",
      "For Instagram, use an Instagram professional account linked to a managed Facebook Page.",
      "Add the backend environment variables, restart the API service, then return to RKVeda → Social Media Intelligence.",
      "Click Configure API / Connect API. The Meta OAuth flow will discover the managed Facebook Page and linked Instagram professional account automatically."
    ],
    note: "Facebook and Instagram share the Meta OAuth connection in this build. A successful Meta connection can populate both platforms when a linked Instagram professional account is available."
  },
  {
    id: "linkedin",
    short: "LINKEDIN",
    title: "LinkedIn Organization",
    purpose: "Prepare LinkedIn organization OAuth and organization reporting access for RKVeda.",
    credentials: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_REDIRECT_URI"],
    callback: "https://api.rkveda.in/api/social/callback",
    localCallback: "http://localhost:3000/api/social/callback",
    scopes: ["openid", "profile", "email", "r_organization_admin"],
    steps: [
      "Create a LinkedIn application in the LinkedIn Developer Portal.",
      "Configure the RKVeda backend callback URI exactly as shown below.",
      "Enable the LinkedIn products/API access required for organization page and reporting use cases. LinkedIn may require explicit approval for Marketing/Community Management permissions.",
      "For organization data, the authenticating LinkedIn member must have the required administrator access to the organization. LinkedIn documents r_organization_admin for retrieving organization pages and reporting data.",
      "Copy the Client ID and Client Secret into the RKVeda backend environment variables. Never expose the Client Secret in frontend code.",
      "After provider approval and backend connector support are enabled, return to RKVeda → Social Media Intelligence and use Connect API.",
      "If LinkedIn shows an approval/permission error, it is a LinkedIn Developer Portal access issue, not a RKVeda login issue."
    ],
    note: "The current RKVeda release keeps LinkedIn connector activation gated until provider credentials and the required LinkedIn API access are configured. Do not treat the pending state as a successful connection."
  }
];

function Copy({ value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1000); }
    catch { setCopied(false); }
  }
  return <button className="secondary guide-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>;
}

export default function SocialProviderGuide() {
  const { projectId } = useParams();
  const [active, setActive] = useState("meta");
  const provider = providers.find(x => x.id === active);

  return (
    <Layout>
      <header className="page-header">
        <div>
          <small>SOCIAL API SETUP</small>
          <h1>Facebook · Instagram · LinkedIn Setup Guide</h1>
          <p>Configure the external developer applications required before RKVeda can connect official social accounts.</p>
        </div>
        <div className="header-actions">
          <Link className="secondary" to={`/projects/${projectId}/seo/social`}>← Social Intelligence</Link>
          <Link className="secondary" to={`/projects/${projectId}/google-services-guide`}>Google Guide</Link>
        </div>
      </header>

      <section className="panel guide-intro">
        <div className="guide-architecture">
          <div><small>RKVeda BACKEND</small><b>API credentials</b><span>Client IDs, secrets and callback URLs stay on the backend.</span></div>
          <div className="guide-arrow">→</div>
          <div><small>PROVIDER APP</small><b>Meta / LinkedIn</b><span>OAuth application and provider permissions.</span></div>
          <div className="guide-arrow">→</div>
          <div><small>RESOURCE OWNER</small><b>Business social account</b><span>Must manage the Page, professional Instagram account or LinkedIn organization.</span></div>
        </div>
        <div className="guide-note">
          <b>Important:</b> Creating a developer app does not automatically grant access to a business social account.
          The person completing Connect API must have the required rights on the actual Page/organization.
        </div>
      </section>

      <section className="panel guide-tabs-panel">
        <div className="guide-tabs">
          {providers.map(p => (
            <button key={p.id} className={`guide-tab ${active === p.id ? "active" : ""}`} onClick={() => setActive(p.id)}>
              <strong>{p.short}</strong><span>{p.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="guide-detail">
        <section className="panel">
          <div className="panel-title">
            <div><small>{provider.short} SETUP</small><h2>{provider.title}</h2><span>{provider.purpose}</span></div>
            <span className="status-pill">Configuration guide</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><small>BACKEND ENVIRONMENT</small><h2>Required variables</h2></div></div>
          <div className="guide-code-list">
            {provider.credentials.map(x => <div key={x}><code>{x}</code><Copy value={x}/></div>)}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><small>OAUTH CALLBACK</small><h2>Register exactly this URL</h2></div></div>
          <div className="guide-code-list">
            <div><code>{provider.callback}</code><Copy value={provider.callback}/></div>
            <div className="guide-muted"><b>Local:</b> <code>{provider.localCallback}</code></div>
          </div>
        </section>

        <section className="grid guide-grid">
          <section className="panel">
            <div className="panel-head"><div><small>OAUTH / API PERMISSIONS</small><h2>Required permissions</h2></div></div>
            <div className="guide-code-list">{provider.scopes.map(x => <div key={x}><code>{x}</code><Copy value={x}/></div>)}</div>
          </section>
          <section className="panel">
            <div className="panel-head"><div><small>CONNECTION FLOW</small><h2>What happens in RKVeda</h2></div></div>
            <ol className="guide-checklist">
              <li>Configure provider credentials on the backend.</li>
              <li>RKVeda generates a signed OAuth state for the current project.</li>
              <li>The user authorizes the actual business social account.</li>
              <li>Provider redirects to the backend callback.</li>
              <li>RKVeda stores the connection server-side and synchronizes approved data.</li>
            </ol>
          </section>
        </section>

        <section className="panel">
          <div className="panel-head"><div><small>STEP-BY-STEP</small><h2>Setup checklist</h2></div></div>
          <ol className="guide-numbered">{provider.steps.map((x, i) => <li key={i}><span>{i + 1}</span><p>{x}</p></li>)}</ol>
        </section>

        <section className="panel guide-warning">
          <div className="panel-head"><div><small>IMPORTANT</small><h2>Provider approval vs RKVeda connection</h2></div></div>
          <p>{provider.note}</p>
          <p><b>Never put provider secrets in React/frontend code.</b> Only the backend should receive OAuth client secrets and access/refresh tokens.</p>
        </section>
      </section>
    </Layout>
  );
}
