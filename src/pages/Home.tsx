import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/subscriptions");
    } else {
      navigate("/signup");
    }
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className="bc-nav">
        <a href="/" className="logo">Before<span>Charge</span></a>
        <ul className="nav-links">
          <li>
            <button onClick={(e) => scrollToSection(e, "how")}>
              How it works
            </button>
          </li>
          <li>
            <button onClick={(e) => scrollToSection(e, "features")}>
              Features
            </button>
          </li>
          <li>
            <button onClick={(e) => scrollToSection(e, "pricing")}>
              Pricing
            </button>
          </li>
          <li>
            <button className="nav-cta" onClick={handleCtaClick}>
              {user ? "Dashboard →" : "Start Free →"}
            </button>
          </li>
        </ul>
      </nav>

      {/* TICKER */}
      <div style={{ paddingTop: "65px" }}>
        <div className="ticker">
          <div className="ticker-inner">
            <span className="ticker-item"><span className="ticker-dot">●</span> Never miss a renewal again</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Know before you owe</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Stop the subscription bleed</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Average user saves £340/year</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Works in 🇺🇸 🇬🇧 🇦🇪 🇪🇺 🇮🇳</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> 7-day free trial</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Never miss a renewal again</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Know before you owe</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Stop the subscription bleed</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Average user saves £340/year</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> Works in 🇺🇸 🇬🇧 🇦🇪 🇪🇺 🇮🇳</span>
            <span className="ticker-item"><span className="ticker-dot">●</span> 7-day free trial</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="badge">
          <span className="badge-dot"></span>
          Now available worldwide — USA, UK, UAE & Europe
        </div>

        <h1>
          Know <span className="highlight">before</span><br />
          you get charged.
        </h1>

        <p className="hero-sub">
          BeforeCharge tracks every subscription you own and alerts you 3 days before any charge hits your card. No more surprise bills. No more wasted money.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={handleCtaClick}>
            {user ? "Go to Dashboard" : "Start for Free — No card needed"}
          </button>
          <button className="btn-secondary" onClick={(e) => scrollToSection(e, "how")}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" /></svg>
            See how it works
          </button>
        </div>

        <div className="hero-trust">
          <span className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
            Free 7-day trial
          </span>
          <span className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
            No credit card required
          </span>
          <span className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
            Cancel anytime
          </span>
          <span className="trust-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
            GDPR & privacy-first
          </span>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="preview-wrap">
          <div className="preview-glow"></div>
          <div className="dashboard">
            <div className="dash-header">
              <div className="dot dot-r"></div>
              <div className="dot dot-y"></div>
              <div className="dot dot-g"></div>
              <div className="dash-url">app.beforecharge.com</div>
            </div>
            <div className="dash-body">
              <div className="stat-card">
                <div className="stat-label">Monthly Spend</div>
                <div className="stat-value red">$284.97</div>
                <div className="stat-change">↑ $42 vs last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Subscriptions</div>
                <div className="stat-value">14</div>
                <div className="stat-change">3 renewing this week</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Saved This Year</div>
                <div className="stat-value green">$340</div>
                <div className="stat-change">↑ from cancelled subs</div>
              </div>
              <div className="dash-subs">
                <div className="sub-row">
                  <div className="sub-left">
                    <div className="sub-icon" style={{ background: "rgba(255,0,0,0.12)" }}>📺</div>
                    <div>
                      <div className="sub-name">Netflix</div>
                      <div className="sub-cycle">Monthly · Auto-renews</div>
                    </div>
                  </div>
                  <div className="sub-right">
                    <span className="sub-price">$22.99</span>
                    <span className="sub-alert alert-red">⚡ Charges in 2 days</span>
                  </div>
                </div>
                <div className="sub-row">
                  <div className="sub-left">
                    <div className="sub-icon" style={{ background: "rgba(0,150,255,0.12)" }}>☁️</div>
                    <div>
                      <div className="sub-name">Dropbox Plus</div>
                      <div className="sub-cycle">Annual · $119.99/yr</div>
                    </div>
                  </div>
                  <div className="sub-right">
                    <span className="sub-price">$9.99</span>
                    <span className="sub-alert alert-yellow">⏰ In 5 days</span>
                  </div>
                </div>
                <div className="sub-row">
                  <div className="sub-left">
                    <div className="sub-icon" style={{ background: "rgba(0,229,160,0.12)" }}>🎵</div>
                    <div>
                      <div className="sub-name">Spotify Premium</div>
                      <div className="sub-cycle">Monthly · Family plan</div>
                    </div>
                  </div>
                  <div className="sub-right">
                    <span className="sub-price">$16.99</span>
                    <span className="sub-alert alert-green">✓ 18 days away</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN STATS */}
      <section>
        <div className="pain">
          <div>
            <div className="section-label">The Problem</div>
            <h2>Your money is quietly disappearing</h2>
            <p className="section-sub">Subscriptions are designed to be forgotten. Every free trial, every annual plan, every "we've updated our pricing" email — they're all counting on you not paying attention.</p>
            <br />
            <p style={{ color: "var(--accent-before)", fontSize: "22px", fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: "-0.5px" }}>BeforeCharge pays attention, so you don't have to.</p>
          </div>
          <div className="pain-stats">
            <div className="pain-stat s1">
              <div className="pain-num">$348</div>
              <div className="pain-desc">Average wasted annually on forgotten subscriptions</div>
            </div>
            <div className="pain-stat s2">
              <div className="pain-num">4.2×</div>
              <div className="pain-desc">People underestimate their subscription count by 4x</div>
            </div>
            <div className="pain-stat s3">
              <div className="pain-num">72%</div>
              <div className="pain-desc">Of users forget about free trials until they're charged</div>
            </div>
            <div className="pain-stat s4">
              <div className="pain-num">11</div>
              <div className="pain-desc">Average subscriptions per person — up from 4 in 2018</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="hiw">
          <div className="section-label">How It Works</div>
          <h2>Up and running in 60 seconds</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>No lengthy setup. No bank login required. Just add your subscriptions and we handle the rest.</p>

          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-icon">📧</div>
              <h3>Connect or add manually</h3>
              <p>Link your Gmail/Outlook so we auto-detect subscriptions, or add them manually in seconds. Your choice — privacy first.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-icon">🔍</div>
              <h3>We scan & organise</h3>
              <p>BeforeCharge finds every recurring charge, sorts them by category, and shows you exactly what you're spending — all in one clean dashboard.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-icon">🔔</div>
              <h3>Get alerted before every charge</h3>
              <p>3 days before any renewal hits your card, you get a push notification, email or WhatsApp alert — with a one-tap cancel guide if you want out.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETS */}
      <section>
        <div className="markets">
          <div className="section-label">Global Coverage</div>
          <h2>Built for your market</h2>
          <div className="market-flags">
            <div className="market-item"><div className="flag">🇺🇸</div><div className="market-name">United States</div></div>
            <div className="market-item"><div className="flag">🇬🇧</div><div className="market-name">United Kingdom</div></div>
            <div className="market-item"><div className="flag">🇦🇪</div><div className="market-name">UAE</div></div>
            <div className="market-item"><div className="flag">🇩🇪</div><div className="market-name">Germany</div></div>
            <div className="market-item"><div className="flag">🇫🇷</div><div className="market-name">France</div></div>
            <div className="market-item"><div className="flag">🇮🇳</div><div className="market-name">India</div></div>
          </div>
          <p style={{ marginTop: "32px", color: "var(--muted-before)", fontSize: "14px" }}>Multi-currency support · USD, GBP, EUR, AED, INR & more</p>
        </div>
      </section>

      <div className="divider"></div>

      {/* FEATURES */}
      <section id="features">
        <div className="features">
          <div className="features-header">
            <div>
              <div className="section-label">Features</div>
              <h2>Everything you need. Nothing you don't.</h2>
            </div>
            <p className="section-sub">Built for real people who just want to stop being surprised by subscription charges every month.</p>
          </div>
          <div className="features-grid">
            <div className="feat featured">
              <span className="feat-icon">⚡</span>
              <h3>Smart Auto-Detection</h3>
              <p>Connect your email and BeforeCharge instantly finds every subscription — including ones you forgot about years ago. Most users discover 3–5 subscriptions they didn't know they were paying for in the first 5 minutes.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">🔔</span>
              <h3>3-Day Advance Alerts</h3>
              <p>Get notified via push, email, or WhatsApp before every single charge — giving you time to cancel if needed.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">📅</span>
              <h3>Renewal Calendar</h3>
              <p>Visual monthly calendar of every upcoming charge so you're never blindsided by an annual renewal again.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">🆓</span>
              <h3>Free Trial Tracker</h3>
              <p>BeforeCharge flags every free trial and alerts you 2 days before it converts to paid — automatically.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">💱</span>
              <h3>Multi-Currency</h3>
              <p>Track subscriptions in USD, GBP, EUR, AED, INR and 30+ currencies. See your total in your home currency.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">📊</span>
              <h3>Spend Analytics</h3>
              <p>Monthly reports showing trends, waste opportunities, and exactly how much you've saved since joining.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">👨👩👧</span>
              <h3>Household Sharing</h3>
              <p>Share a dashboard with your partner or family — see who's paying for what and split shared subscriptions fairly.</p>
            </div>
            <div className="feat">
              <span className="feat-icon">🏢</span>
              <h3>Teams & Business</h3>
              <p>Track company SaaS tools, assign owners to subscriptions, and get a monthly waste report for your finance team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="testimonials">
          <div className="section-label">Loved by Users</div>
          <h2>Real people. Real savings.</h2>
          <div className="testi-grid">
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Found 4 subscriptions I completely forgot about. Cancelled 3 of them and saved £67/month instantly. Genuinely the most useful app I've installed this year."</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: "rgba(0,229,160,0.15)", color: "var(--accent-before)" }}>JM</div>
                <div>
                  <div className="testi-name">James M.</div>
                  <div className="testi-role">Freelancer · London, UK 🇬🇧</div>
                </div>
              </div>
            </div>
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"I was paying for Adobe Creative Cloud for 8 months after I stopped using it. BeforeCharge caught my next renewal and I cancelled in time. Saved $599."</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: "rgba(0,102,255,0.15)", color: "#6699ff" }}>SR</div>
                <div>
                  <div className="testi-name">Sarah R.</div>
                  <div className="testi-role">Designer · New York, USA 🇺🇸</div>
                </div>
              </div>
            </div>
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Running a startup in Dubai, we were hemorrhaging on SaaS tools nobody was using. The team dashboard showed us AED 2,400/month in waste. Incredible."</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: "rgba(255,189,46,0.15)", color: "#ffbd2e" }}>AK</div>
                <div>
                  <div className="testi-name">Ahmed K.</div>
                  <div className="testi-role">Founder · Dubai, UAE 🇦🇪</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PRICING */}
      <section id="pricing">
        <div className="pricing">
          <div className="section-label">Pricing</div>
          <h2>Pays for itself in one cancelled subscription</h2>
          <p style={{ color: "var(--muted2-before)", fontSize: "17px", fontWeight: 300, marginTop: "12px" }}>Start free. No credit card. Upgrade when you're ready.</p>

          <div className="pricing-grid">
            <div className="plan">
              <div className="plan-name">Free</div>
              <div className="plan-price"><sup>$</sup>0</div>
              <div className="plan-period">forever free</div>
              <ul className="plan-features">
                <li>Up to 5 subscriptions</li>
                <li>Basic renewal alerts</li>
                <li>Manual entry</li>
                <li>Email notifications</li>
              </ul>
              <button className="plan-btn plan-btn-outline" onClick={() => navigate("/signup")}>Get Started Free</button>
            </div>

            <div className="plan popular">
              <div className="popular-badge">Most Popular</div>
              <div className="plan-name">Personal</div>
              <div className="plan-price"><sup>$</sup>6.99</div>
              <div className="plan-period">per month · billed monthly</div>
              <ul className="plan-features">
                <li>Unlimited subscriptions</li>
                <li>Auto email/Gmail detection</li>
                <li>3-day advance alerts</li>
                <li>Free trial tracker</li>
                <li>Renewal calendar</li>
                <li>Multi-currency support</li>
                <li>Spend analytics & reports</li>
                <li>WhatsApp & SMS alerts</li>
              </ul>
              <button className="plan-btn plan-btn-primary" onClick={() => navigate("/signup")}>Start 7-Day Free Trial</button>
            </div>

            <div className="plan">
              <div className="plan-name">Business</div>
              <div className="plan-price"><sup>$</sup>24</div>
              <div className="plan-period">per month · up to 5 seats</div>
              <ul className="plan-features">
                <li>Everything in Personal</li>
                <li>Team workspace & dashboard</li>
                <li>Assign subscription owners</li>
                <li>Monthly waste report</li>
                <li>CSV/PDF export</li>
                <li>Priority support</li>
                <li>Household sharing</li>
              </ul>
              <button className="plan-btn plan-btn-outline" onClick={() => navigate("/signup")}>Start Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="cta-section">
          <div className="cta-card">
            <div className="section-label" style={{ justifyContent: "center" }}>Get Started Today</div>
            <h2>Stop getting charged.<br />Start being <span style={{ color: "var(--accent-before)" }}>in control.</span></h2>
            <p>Join thousands of people who stopped letting subscriptions silently drain their bank account every month.</p>
            <button className="btn-primary" style={{ fontSize: "18px", padding: "18px 48px", display: "inline-block" }} onClick={handleCtaClick}>
              Try BeforeCharge Free →
            </button>
            <div style={{ marginTop: "24px", color: "var(--muted-before)", fontSize: "13px" }}>
              7-day free trial · No credit card · Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="/" className="footer-logo">Before<span>Charge</span></a>
        <ul className="footer-links">
          <li><button onClick={(e) => scrollToSection(e, "features")}>Features</button></li>
          <li><button onClick={(e) => scrollToSection(e, "pricing")}>Pricing</button></li>
          <li><button onClick={() => { }}>Blog</button></li>
          <li><button onClick={() => navigate("/privacy")}>Privacy</button></li>
          <li><button onClick={() => navigate("/terms")}>Terms</button></li>
          <li><button onClick={() => { }}>Contact</button></li>
        </ul>
        <div className="footer-right">© 2025 BeforeCharge · Know before you owe</div>
      </footer>
    </div>
  );
};

export default Home;
