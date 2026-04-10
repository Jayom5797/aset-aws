import React, { useState } from 'react';
import logoIcon from '../assects/icons/logo.svg';

const API = import.meta.env.VITE_API_URL || '';

const PaperSearchPage = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ yearMin: '', yearMax: '', topic: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const params = new URLSearchParams({ query: query.trim(), limit: '20' });
      if (filters.yearMin) params.append('year_min', filters.yearMin);
      if (filters.yearMax) params.append('year_max', filters.yearMax);
      if (filters.topic) params.append('topic', filters.topic);

      const res = await fetch(`${API}/api/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.papers || []);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoIcon} alt="ASET" style={{ height: 28 }} />
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>ASET</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 8px' }}>·</span>
          <span style={{ color: '#00ffaa', fontSize: 14, fontWeight: 600 }}>Paper Search</span>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Search Research Papers</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
            Search across 1.2M+ peer-reviewed papers by title, author, keyword, or topic — no login required
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, author, keyword, or topic..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 18px', color: '#fff', fontSize: 15, outline: 'none' }}
              autoFocus
            />
            <button type="submit" disabled={loading} style={{ background: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.5)', color: '#00ffaa', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {loading ? '⏳ Searching...' : '🔍 Search'}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input type="number" placeholder="Year from" value={filters.yearMin} onChange={e => setFilters(f => ({ ...f, yearMin: e.target.value }))}
              style={{ width: 120, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
            <input type="number" placeholder="Year to" value={filters.yearMax} onChange={e => setFilters(f => ({ ...f, yearMax: e.target.value }))}
              style={{ width: 120, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
            <select value={filters.topic} onChange={e => setFilters(f => ({ ...f, topic: e.target.value }))}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: filters.topic ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 13, outline: 'none' }}>
              <option value="">All domains</option>
              {['black-holes','cosmology','exoplanets','galaxies','neuroscience','oncology','cardiology','genetics-and-genomics','artificial-intelligence','natural-language-processing','quantum-physics','physical-chemistry','robotics','epidemiology'].map(t => (
                <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </div>
        </form>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 20, fontSize: 14 }}>
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div style={{ marginTop: 32 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>
              {results.length > 0 ? `${results.length} papers found` : 'No papers found — try different keywords'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((paper, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,170,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <a href={paper.source === 'pubmed' ? `https://pubmed.ncbi.nlm.nih.gov/${paper.id.replace('pmid-','')}` : `https://arxiv.org/abs/${paper.id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.4, textDecoration: 'none' }}
                      onMouseEnter={e => e.target.style.color = '#00ffaa'}
                      onMouseLeave={e => e.target.style.color = '#fff'}>
                      {paper.title}
                    </a>
                    <span style={{ color: '#00ffaa', fontSize: 12, fontWeight: 600, background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.2)', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {paper.year || 'n/a'}
                    </span>
                  </div>
                  {paper.authors && (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>
                      {(() => {
                        try {
                          const parsed = JSON.parse(paper.authors);
                          return Array.isArray(parsed) ? parsed.slice(0, 3).join(', ') : String(parsed);
                        } catch {
                          return String(paper.authors).substring(0, 150);
                        }
                      })()}
                    </div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>
                    {paper.abstract?.substring(0, 200)}{paper.abstract?.length > 200 ? '...' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 8px' }}>
                      {paper.topic?.replace(/-/g, ' ')}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 8px' }}>
                      {paper.source || 'arxiv'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 15 }}>Search across 1.2M+ papers from arXiv, NASA ADS, and PubMed</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperSearchPage;
