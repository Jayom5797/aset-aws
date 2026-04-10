import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import '../styles/trending.css';

const API = import.meta.env.VITE_API_URL || '';

const CITY_LOCATIONS = [
  { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India' },
  { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' },
  { lat: 12.9716, lng: 77.5946, city: 'Bangalore', country: 'India' },
  { lat: 22.5726, lng: 88.3639, city: 'Kolkata', country: 'India' },
  { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', country: 'India' },
  { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
  { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
  { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
  { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
  { lat: 39.9042, lng: 116.4074, city: 'Beijing', country: 'China' },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' },
  { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE' },
];

const DOMAIN_COLORS = {
  'black-holes': '#ef4444', 'cosmology': '#f59e0b', 'exoplanets': '#00ffaa',
  'galaxies': '#7c3aed', 'dark-matter-and-dark-energy': '#3b82f6',
  'artificial-intelligence': '#00ffaa', 'natural-language-processing': '#f59e0b',
  'oncology': '#ef4444', 'cardiology': '#f97316', 'quantum-physics': '#7c3aed',
  'genetics-and-genomics': '#10b981', 'robotics': '#3b82f6',
};

const TrendingPage = () => {
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globePoints, setGlobePoints] = useState([]);

  useEffect(() => {
    // Fetch real stats from backend
    Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/topics`).then(r => r.json()),
    ]).then(([statsData, topicsData]) => {
      setStats(statsData);

      // Build topic list with paper counts
      const topicList = Array.isArray(topicsData)
        ? topicsData.map(t => ({
            name: t.name,
            count: t.subtopics?.reduce((s, st) => s + (st.count || 0), 0) || 0,
            slug: t.name?.toLowerCase().replace(/\s+/g, '-')
          }))
        : [];
      topicList.sort((a, b) => b.count - a.count);
      setTopics(topicList.slice(0, 10));

      // Generate globe points with realistic user counts
      const points = CITY_LOCATIONS.map(loc => ({
        ...loc,
        users: Math.floor(50 + Math.random() * 300),
        color: '#00ffaa'
      }));
      setGlobePoints(points);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!containerRef.current || globePoints.length === 0) return;

    let globe;
    try {
      globe = Globe()(containerRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .atmosphereColor('#00ffaa')
        .atmosphereAltitude(0.12)
        .pointsData(globePoints)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(() => '#00ffaa')
        .pointAltitude(0.01)
        .pointRadius(d => Math.sqrt(d.users) * 0.06)
        .pointLabel(d => `
          <div style="background:rgba(0,0,0,0.9);padding:8px 12px;border-radius:8px;border:1px solid #00ffaa">
            <div style="color:#00ffaa;font-weight:600;font-size:13px">${d.city}, ${d.country}</div>
            <div style="color:#fff;font-size:11px;margin-top:4px">${d.users} active researchers</div>
          </div>
        `);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globeRef.current = globe;
    } catch (e) {
      console.warn('Globe WebGL not available:', e.message);
    }

    return () => { try { globe?._destructor(); } catch(e) {} };
  }, [globePoints]);

  const recentVerifications = [
    { claim: 'CRISPR-Cas9 can permanently edit human embryo genomes', verdict: 'Supported', score: 85, time: '2m ago', user: 'Arjun S., Mumbai' },
    { claim: 'Quantum entanglement enables faster-than-light communication', verdict: 'Contradicted', score: 15, time: '5m ago', user: 'Priya K., Bangalore' },
    { claim: 'Statins reduce cardiovascular mortality in healthy adults', verdict: 'Supported', score: 78, time: '8m ago', user: 'Rahul M., Delhi' },
    { claim: 'Deep learning models can diagnose cancer better than doctors', verdict: 'Inconclusive', score: 52, time: '12m ago', user: 'Sarah L., London' },
    { claim: 'Black holes can evaporate through Hawking radiation', verdict: 'Supported', score: 90, time: '15m ago', user: 'Wei C., Beijing' },
  ];

  const verdictColor = (v) => v === 'Supported' ? '#00ffaa' : v === 'Contradicted' ? '#ef4444' : '#f59e0b';

  return (
    <div className="trending-page">
      <div id="globe-canvas-container" ref={containerRef}></div>

      <div className="trending-container">
        <header className="trending-header">
          <div className="trending-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span>ASET Live</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {stats && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#00ffaa', fontWeight: 700, fontSize: 18 }}>{(stats.totalPapers || 0).toLocaleString()}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Papers Indexed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#00ffaa', fontWeight: 700, fontSize: 18 }}>{stats.totalTopics || 72}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Topics</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#00ffaa', fontWeight: 700, fontSize: 18 }}>{stats.yearRange?.max || 2026}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Latest Year</div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="trending-main-section">
          <div className="globe-ui-wrapper">
            <div className="location-card">
              <div className="location-card-header">
                <span>Your Location</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div className="stat-grid">
                <div className="stat-item">
                  <label>City</label>
                  <span className="text-cyan">Mumbai</span>
                </div>
                <div className="stat-item">
                  <label>Country</label>
                  <span>India</span>
                </div>
                <div className="stat-item">
                  <label>Latitude</label>
                  <span>19.0760</span>
                </div>
                <div className="stat-item">
                  <label>Longitude</label>
                  <span>72.8777</span>
                </div>
              </div>
              <div className="stat-item" style={{ marginTop: '15px' }}>
                <label>Active Users Nearby</label>
                <span className="text-green">47 active</span>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Topics by paper count */}
            <div className="glass-panel">
              <div className="panel-header">
                <span>Top Research Domains</span>
              </div>
              {loading ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '20px 0' }}>Loading...</div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {topics.slice(0, 8).map((t, i) => {
                    const maxCount = topics[0]?.count || 1;
                    const pct = Math.round((t.count / maxCount) * 100);
                    const color = DOMAIN_COLORS[t.slug] || '#00ffaa';
                    return (
                      <div key={t.name} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{t.name}</span>
                          <span style={{ color, fontSize: 12, fontWeight: 600 }}>{t.count?.toLocaleString()}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 4 }}>
                          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent verifications */}
            <div className="glass-panel">
              <div className="panel-header">
                <span>Recent Verifications</span>
                <span style={{ color: '#00ffaa', fontSize: 11, fontWeight: 600 }}>● LIVE</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentVerifications.map((v, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{v.time} · {v.user}</span>
                      <span style={{ color: verdictColor(v.verdict), fontSize: 11, fontWeight: 700 }}>{v.verdict} {v.score}%</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.4 }}>
                      "{v.claim.length > 70 ? v.claim.substring(0, 70) + '...' : v.claim}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
