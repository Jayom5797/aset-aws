import React from 'react';
import heroVideo from '../assects/videos/hero-background.mp4';
import logoIcon from '../assects/icons/logo.svg';
import PaperSearchPage from './PaperSearchPage';

const Icon = ({ name, size = 48, className = 'icon-svg' }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    'aria-hidden': 'true',
  };

  const icons = {
    search: (
      <svg {...commonProps}>
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    rocket: (
      <svg {...commonProps}>
        <path d="M13.2 4.4C15.6 2 19 2 21 3c1 2 .9 5.4-1.5 7.8l-7 7-4.3-4.3 5-9.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.4 15.6 5 19l-.7-3.2 2.2-2.2M10.5 18l-2.2 2.2L5.1 19.5l3.3-3.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16.8" cy="7.2" r="1.7" fill="currentColor" />
      </svg>
    ),
    database: (
      <svg {...commonProps}>
        <ellipse cx="12" cy="5.5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    ai: (
      <svg {...commonProps}>
        <rect x="6" y="7" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 10h3M3 14h3M18 10h3M18 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="9.5" cy="12" r="1" fill="currentColor" />
        <circle cx="14.5" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    lightning: (
      <svg {...commonProps}>
        <path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" fill="currentColor" />
      </svg>
    ),
    cloud: (
      <svg {...commonProps}>
        <path d="M7.5 18h9.2a4.3 4.3 0 0 0 .7-8.5A6.2 6.2 0 0 0 5.6 11.2 3.5 3.5 0 0 0 7.5 18Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chart: (
      <svg {...commonProps}>
        <rect x="4" y="11" width="3.7" height="8" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="10.2" y="6" width="3.7" height="13" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="16.3" y="3" width="3.7" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    target: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        <path d="M15.5 8.5 21 3M17.5 3H21v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    lock: (
      <svg {...commonProps}>
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 14v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    globe: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    archive: (
      <svg {...commonProps}>
        <path d="M5 8h14v11H5V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M4 5h16v3H4V5ZM9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    plug: (
      <svg {...commonProps}>
        <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7ZM12 16v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    monitor: (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    server: (
      <svg {...commonProps}>
        <rect x="5" y="4" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="5" y="14" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7h.01M8 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
    react: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
      </svg>
    ),
    node: (
      <svg {...commonProps}>
        <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 15V9l6 6V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return icons[name] || null;
};

const featureItems = [
  ['database', 'Massive Database', 'Access 972,327 papers from arXiv and NASA ADS with full-text search'],
  ['ai', 'AI Verification', 'Powered by Groq LLaMA 3.3 70B for intelligent claim verification'],
  ['lightning', 'Real-time Search', 'Lightning-fast full-text search with relevance scoring'],
  ['cloud', 'AWS Native', 'Built on CloudFront, API Gateway, EC2, and Turso edge database'],
  ['chart', 'Topic Indexing', 'Hierarchical topic organization for precise research navigation'],
  ['target', 'Smart Ranking', 'Advanced relevance algorithms ensure the most pertinent papers appear first'],
  ['lock', 'Secure & Private', 'JWT authentication with encrypted data storage'],
  ['globe', 'Global CDN', 'CloudFront distribution for low-latency access worldwide'],
  ['archive', 'Chat History', 'Save and sync your research sessions across devices'],
];

const techItems = [
  ['cloud', 'CloudFront'],
  ['plug', 'API Gateway'],
  ['monitor', 'EC2'],
  ['server', 'Turso'],
  ['react', 'React'],
  ['node', 'Node.js'],
];

const LandingPage = ({ onGetStarted, isLoggedIn = false, onGoToApp }) => {
  const [showPaperSearch, setShowPaperSearch] = React.useState(false);

  if (showPaperSearch) {
    return <PaperSearchPage onBack={() => setShowPaperSearch(false)} />;
  }
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={logoIcon} alt="ASET" />
            <span>ASET</span>
          </div>
          
          <div className="navbar-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#team" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Team</a>
            <a href="#tech" onClick={(e) => { e.preventDefault(); scrollToSection('tech'); }}>Technology</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
            <a href="#search" onClick={(e) => { e.preventDefault(); setShowPaperSearch(true); }} style={{ color: '#00ffaa', fontWeight: 600 }}>
              <Icon name="search" size={16} className="nav-link-icon" />
              Search Papers
            </a>
          </div>
          
          {isLoggedIn ? (
            <button className="navbar-cta" onClick={onGoToApp}>
              ← Back to App
            </button>
          ) : (
            <button className="navbar-cta" onClick={onGetStarted}>
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Icon name="rocket" size={18} className="badge-icon" />
            <span>Powered by 972K+ Research Papers</span>
          </div>
          
          <div className="hero-logo">
            <img src={logoIcon} alt="ASET Logo" className="hero-logo-icon" />
            <h1 className="hero-title">ASET</h1>
          </div>
          
          <h2 className="hero-subtitle-main">Academic Safety and Evidence Truthing</h2>
          
          <p className="hero-subtitle">
            Helping students overcome AI-hallucinated data with real scientific evidence from arXiv and NASA ADS
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onGetStarted}>
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">972K+</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">AI-Powered</div>
              <div className="stat-label">Claim Verification</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Search & Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Why Choose ASET?</h2>
          <p>Combat AI hallucinations with verified scientific evidence</p>
        </div>
        
        <div className="features-grid">
          {featureItems.map(([icon, title, description]) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon"><Icon name={icon} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team & Contact Section Combined */}
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <div className="contact-left">
            <h2 className="section-title">Meet the Developers</h2>
            <p className="detail-value">Developed by:</p>
            
            <div className="team-grid">
              <div className="team-card">
                <div className="team-card-content">
                  <h3>Utsav Singh</h3>
                </div>
                <div className="team-links-hover">
                  <a href="https://www.linkedin.com/in/utsavsingh35" target="_blank" rel="noopener noreferrer" className="link-btn linkedin">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="https://port-vercel-eight.vercel.app/" target="_blank" rel="noopener noreferrer" className="link-btn portfolio">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                  <a href="https://github.com/Utsav-Singh-35" target="_blank" rel="noopener noreferrer" className="link-btn github">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="team-card">
                <div className="team-card-content">
                  <h3>Vikas Tiwari</h3>
                </div>
                <div className="team-links-hover">
                  <a href="https://www.linkedin.com/in/1045-vikas-tiwari" target="_blank" rel="noopener noreferrer" className="link-btn linkedin">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="https://vikas-tiwari.in/" target="_blank" rel="noopener noreferrer" className="link-btn portfolio">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                  <a href="https://github.com/Cyberexe1" target="_blank" rel="noopener noreferrer" className="link-btn github">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="team-card" style={{ gridColumn: '1 / 3' }}>
                <div className="team-card-content">
                  <h3>Om Singh</h3>
                </div>
                <div className="team-links-hover">
                  <a href="https://www.linkedin.com/in/5797omsingh" target="_blank" rel="noopener noreferrer" className="link-btn linkedin">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="https://om07.in/" target="_blank" rel="noopener noreferrer" className="link-btn portfolio">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                  <a href="https://github.com/Jayom5797" target="_blank" rel="noopener noreferrer" className="link-btn github">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <h2 className="form-title">Get in Touch</h2>
            <form action="https://api.web3forms.com/submit" method="POST" className="contact-form">
              <input type="hidden" name="access_key" value="ae65fd58-3599-451f-bdd9-0c62951b2176" />
              <input type="text" name="name" placeholder="Name" required />
              <input type="email" name="email" placeholder="Email" required />
              <textarea name="message" placeholder="Message" rows="6" required></textarea>
              <button type="submit" className="form-submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section" id="tech">
        <div className="section-header">
          <h2>Built with Modern Technology</h2>
          <p>AWS-native architecture for reliability and scale</p>
        </div>
        
        <div className="tech-grid">
          {techItems.map(([icon, name]) => (
            <div className="tech-item" key={name}>
              <div className="tech-icon"><Icon name={icon} size={40} /></div>
              <div className="tech-name">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to verify scientific claims?</h2>
          <p>Join students worldwide in combating AI hallucinations with real evidence</p>
          <button className="btn-primary-large" onClick={onGetStarted}>
            Get Started Free
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>ASET</h3>
            <p>Academic Safety and Evidence Truthing</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#team">Team</a>
              <a href="#tech">Technology</a>
            </div>
            
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="https://github.com/Utsav-Singh-35" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Documentation coming soon!'); }}>Documentation</a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('API docs coming soon!'); }}>API</a>
            </div>
            
            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:us101741@gmail.com">us101741@gmail.com</a>
              <a href="mailto:vikastiwari1045@gmail.com">vikastiwari1045@gmail.com</a>
              <a href="mailto:jayom5797@gmail.com">jayom5797@gmail.com</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 ASET. Built for 10,000 Aideas Competition.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
