import React, { useState, useRef } from 'react';
import logoIcon from '../assects/icons/satyamatrix.svg';
import starIcon from '../assects/images/star.png';
import { DocumentVerifier, YouTubeVerifier } from './DocumentVerifier';

const MODES = [
  { id: 'claim',    label: '💬 Single Claim',  desc: 'Type a claim to verify' },
  { id: 'youtube',  label: '▶️ YouTube',        desc: 'Verify a video transcript' },
  { id: 'document', label: '📄 Document',       desc: 'Upload PDF, DOCX, or image' },
];

const suggestionCards = [
  {
    title: '🔬 Biology',
    description: 'Verify claims about genetics, CRISPR, and cell biology',
    prompt: 'Does CRISPR-Cas9 permanently edit the human genome?'
  },
  {
    title: '🏥 Medicine',
    description: 'Check medical claims before sharing or citing',
    prompt: 'Do statins reduce cardiovascular mortality in healthy adults?'
  },
  {
    title: '🌌 Space Science',
    description: 'Explore claims about black holes, exoplanets, and cosmology',
    prompt: 'Can black holes evaporate through Hawking radiation?'
  },
  {
    title: '💻 Computer Science',
    description: 'Verify AI and ML claims against research papers',
    prompt: 'Do large language models truly understand language?'
  },
  {
    title: '⚛️ Physics',
    description: 'Check quantum mechanics and particle physics claims',
    prompt: 'Is quantum entanglement faster than light communication?'
  },
  {
    title: '⚙️ Engineering',
    description: 'Verify engineering and materials science claims',
    prompt: 'Can graphene replace silicon in transistors?'
  }
];

const WelcomeScreen = ({ userName, onSendMessage }) => {
  const [mode, setMode] = useState('claim');
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, selectedFiles);
      setMessage('');
      setSelectedFiles([]);
    }
  };

  const handleSuggestionClick = (prompt) => setMessage(prompt);

  const handleFileChange = (e) => setSelectedFiles(Array.from(e.target.files));

  const getFileNames = () => {
    if (!selectedFiles.length) return '';
    return selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`;
  };

  return (
    <div className="welcome-screen">
      {/* Hide orb when in Mode 2/3 to avoid visual overlap with results */}
      {mode === 'claim' && <div className="orb-background"></div>}

      <div className="welcome-logo">
        <img src={logoIcon} alt="SatyaMatrix" />
      </div>

      <div className="welcome-text">
        <h1>Hey! {userName}</h1>
        <h2>What can I help with?</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
          Verifying claims across 8 scientific domains · 1M+ peer-reviewed papers
        </p>
      </div>

      {/* Mode selector tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? 'rgba(0,255,170,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mode === m.id ? 'rgba(0,255,170,0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: mode === m.id ? '#00ffaa' : 'rgba(255,255,255,0.6)',
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: mode === m.id ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Single claim */}
      {mode === 'claim' && (
        <>
          <div className="suggestion-cards">
            {suggestionCards.map((card, index) => (
              <button
                key={index}
                className="suggestion-card"
                onClick={() => handleSuggestionClick(card.prompt)}
              >
                <div className="card-title">{card.title}</div>
                <div className="card-desc">{card.description}</div>
              </button>
            ))}
          </div>

          <div className="input-container">
            <form className="input-box" onSubmit={handleSubmit}>
              <div className="top-row">
                <img src={starIcon} alt="star" className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter a claim to verify..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="bottom-row">
                <div className="attach-section">
                  <label htmlFor="fileInput" className="attach-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    <span>Attach file</span>
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    ref={fileInputRef}
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
                    style={{ display: 'none' }}
                    multiple
                    onChange={handleFileChange}
                  />
                  <span className="file-names">{getFileNames()}</span>
                </div>
                <button type="submit" className="send-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Mode 2: YouTube */}
      {mode === 'youtube' && (
        <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1 }}>
          <YouTubeVerifier />
        </div>
      )}

      {/* Mode 3: Document */}
      {mode === 'document' && (
        <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1 }}>
          <DocumentVerifier />
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
