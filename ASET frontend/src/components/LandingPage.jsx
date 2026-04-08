import heroVideo from '../assects/videos/hero-background.mp4';
import logoIcon from '../assects/icons/logo.svg';

const LandingPage = ({ onGetStarted }) => {
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
          </div>
          
          <button className="navbar-cta" onClick={onGetStarted}>
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
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
            <span className="badge-icon">🚀</span>
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
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Massive Database</h3>
            <p>Access 972,327 papers from arXiv and NASA ADS with full-text search</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Verification</h3>
            <p>Powered by Groq LLaMA 3.3 70B for intelligent claim verification</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Search</h3>
            <p>Lightning-fast full-text search with relevance scoring</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>AWS Native</h3>
            <p>Built on CloudFront, API Gateway, EC2, and Turso edge database</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Topic Indexing</h3>
            <p>Hierarchical topic organization for precise research navigation</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Ranking</h3>
            <p>Advanced relevance algorithms ensure the most pertinent papers appear first</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>JWT authentication with encrypted data storage</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global CDN</h3>
            <p>CloudFront distribution for low-latency access worldwide</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Chat History</h3>
            <p>Save and sync your research sessions across devices</p>
          </div>
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
          <div className="tech-item">
            <div className="tech-icon">☁️</div>
            <div className="tech-name">CloudFront</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🔌</div>
            <div className="tech-name">API Gateway</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">💻</div>
            <div className="tech-name">EC2</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🗄️</div>
            <div className="tech-name">Turso</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">⚛️</div>
            <div className="tech-name">React</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🟢</div>
            <div className="tech-name">Node.js</div>
          </div>
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
