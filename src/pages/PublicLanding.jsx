import { useEffect } from "react";
import { Link } from "react-router-dom";

const PHONE = "8126037298";
const EMAIL = "info@rkveda.in";

function Header({ active }) {
  return (
    <header className="public-header">
      <Link className="public-brand" to="/">RKVeda</Link>
      <nav className="public-nav">
        <a className={active === "growth" ? "active" : ""} href="/">Digital Growth</a>
        <Link className={active === "labs" ? "active" : ""} to="/labs">RKVeda Labs</Link>
        <a href="#contact">Contact</a>
        <Link className="public-login" to="/login">Platform Login</Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="public-footer" id="contact">
      <div>
        <strong>RKVeda</strong>
        <p>Building practical digital, technology and automation solutions for modern businesses.</p>
      </div>
      <div className="footer-contact">
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <a href={`tel:+91${PHONE}`}>+91 {PHONE}</a>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} RKVeda. All rights reserved.</div>
    </footer>
  );
}

function GrowthPage() {
  useEffect(() => {
    document.title = "RKVeda Growth | SEO & Digital Growth Solutions";
    const description = "Digital growth solutions for local businesses — SEO, local SEO, digital marketing, analytics and automation by RKVeda Growth.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const services = [
    ["01", "SEO", "Improve search visibility with a practical, measurable SEO strategy."],
    ["02", "Local SEO", "Help local customers discover your business across search and maps."],
    ["03", "Content & Digital Marketing", "Build useful content and digital campaigns around your customers."],
    ["04", "Analytics & Reporting", "Turn website, search and campaign data into clear business insights."],
    ["05", "Automation", "Reduce repetitive work with practical workflows and integrations."],
    ["06", "Growth Strategy", "Connect visibility, leads and digital activity to business goals."],
  ];

  return (
    <div className="public-site growth-site">
      <Header active="growth" />
      <main className="public-main">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="eyebrow-pill">RKVEDA GROWTH • SEO • DIGITAL GROWTH</span>
            <h1>Build Visibility.<br /><span>Grow Your Business.</span></h1>
            <p className="hero-lead">
              Digital growth solutions helping local businesses build a stronger online presence,
              improve digital visibility and create a better path from search to customer.
            </p>
            <div className="hero-actions">
              <a className="landing-btn primary-growth" href="#services">Explore Services →</a>
              <a className="landing-btn outline-btn" href={`tel:+91${PHONE}`}>Talk to Us</a>
            </div>
            <div className="hero-contact">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <span>•</span>
              <a href={`tel:+91${PHONE}`}>+91 {PHONE}</a>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img src="/images/rkveda-growth-hero.png" alt="RKVeda Growth digital marketing and SEO dashboard" />
          </div>
        </section>

        <section className="intro-strip">
          <div><span>WHAT WE DO</span><strong>Practical digital growth for businesses that want to be found, understood and remembered online.</strong></div>
          <p>From local SEO and search visibility to content, analytics and automation, RKVeda Growth brings key digital activities together in one focused growth approach.</p>
        </section>

        <section className="public-section" id="services">
          <div className="section-heading">
            <span className="section-kicker">OUR SERVICES</span>
            <h2>Everything you need to build digital visibility.</h2>
            <p>Start with the services your business needs today and expand as your digital presence grows.</p>
          </div>
          <div className="service-grid">
            {services.map(([num, title, text]) => (
              <article className="service-card" key={title}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="growth-process public-section">
          <div className="section-heading">
            <span className="section-kicker">OUR APPROACH</span>
            <h2>From visibility to growth.</h2>
          </div>
          <div className="process-grid">
            <div><b>01</b><h3>Understand</h3><p>Understand your business, audience, market and current digital presence.</p></div>
            <div><b>02</b><h3>Optimize</h3><p>Improve technical SEO, local presence, content and conversion touchpoints.</p></div>
            <div><b>03</b><h3>Measure</h3><p>Track meaningful search, website and campaign signals with clear reporting.</p></div>
            <div><b>04</b><h3>Grow</h3><p>Use insights and automation to continuously improve your digital growth system.</p></div>
          </div>
        </section>

        <section className="cta-section growth-cta">
          <div>
            <span className="section-kicker">LET'S BUILD YOUR DIGITAL PRESENCE</span>
            <h2>Ready to grow online?</h2>
            <p>Tell us about your business and what you want to improve. We’ll help you identify the right next steps.</p>
          </div>
          <div className="cta-actions">
            <a className="landing-btn primary-growth" href={`mailto:${EMAIL}?subject=Digital Growth Enquiry`}>Email RKVeda Growth</a>
            <a className="landing-btn white-outline" href={`tel:+91${PHONE}`}>Call +91 {PHONE}</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function LabsPage() {
  useEffect(() => {
    document.title = "RKVeda Labs | AI, Software & Automation";
    const description = "RKVeda Labs is building AI-powered applications, software products and automation solutions for modern businesses.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const capabilities = [
    ["AI Applications", "AI assistants, intelligent workflows and business-focused AI products."],
    ["Software Products", "Modern web applications and software systems designed around real business needs."],
    ["Automation Solutions", "Connected workflows that reduce repetitive tasks and improve operational efficiency."],
    ["Cloud & Data", "Cloud-native applications, APIs, data platforms and integrations."],
  ];

  return (
    <div className="public-site labs-site">
      <Header active="labs" />
      <main className="public-main">
        <section className="landing-hero labs-hero">
          <div className="hero-copy">
            <span className="eyebrow-pill labs-pill">RKVEDA LABS • AI • SOFTWARE • AUTOMATION</span>
            <h1>Build Smarter.<br /><span>Automate Better.</span></h1>
            <p className="hero-lead">
              Building AI-powered applications, software products and automation solutions for modern businesses.
            </p>
            <div className="hero-actions">
              <a className="landing-btn labs-btn" href="#capabilities">Explore Capabilities →</a>
              <a className="landing-btn outline-btn" href={`mailto:${EMAIL}?subject=RKVeda Labs Enquiry`}>Discuss an Idea</a>
            </div>
            <div className="coming-badge">COMING SOON • RKVeda Labs</div>
          </div>
          <div className="hero-image-wrap labs-image-wrap">
            <img src="/images/rkveda-labs-hero.png" alt="RKVeda Labs AI software and automation workspace" />
          </div>
        </section>

        <section className="intro-strip labs-strip">
          <div><span>THE LABS MISSION</span><strong>Turn useful ideas into practical technology products and business automation.</strong></div>
          <p>RKVeda Labs will focus on building technology that connects AI, software, data and automation into useful business solutions.</p>
        </section>

        <section className="public-section" id="capabilities">
          <div className="section-heading">
            <span className="section-kicker">WHAT WE ARE BUILDING</span>
            <h2>Technology designed around real business problems.</h2>
            <p>RKVeda Labs is being shaped as a product and engineering venture within the RKVeda ecosystem.</p>
          </div>
          <div className="service-grid labs-grid">
            {capabilities.map(([title, text], index) => (
              <article className="service-card" key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="labs-stack public-section">
          <div className="section-heading">
            <span className="section-kicker">TECHNOLOGY STACK</span>
            <h2>AI + Software + Data + Cloud.</h2>
          </div>
          <div className="stack-pills">
            <span>AI & LLMs</span><span>Python</span><span>APIs</span><span>React</span><span>Cloud</span><span>Data Engineering</span><span>Automation</span><span>Analytics</span>
          </div>
        </section>

        <section className="cta-section labs-cta">
          <div>
            <span className="section-kicker">HAVE A PRODUCT OR AUTOMATION IDEA?</span>
            <h2>Let’s build what comes next.</h2>
            <p>RKVeda Labs is coming soon. For partnerships, product ideas or technology discussions, contact the RKVeda team.</p>
          </div>
          <div className="cta-actions">
            <a className="landing-btn labs-btn" href={`mailto:${EMAIL}?subject=RKVeda Labs Partnership`}>Email RKVeda Labs</a>
            <a className="landing-btn white-outline" href={`tel:+91${PHONE}`}>Call +91 {PHONE}</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export { GrowthPage, LabsPage };
