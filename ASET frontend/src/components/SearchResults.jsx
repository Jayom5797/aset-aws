import React, { useState } from 'react';
import PaperCard from './PaperCard';
import VerificationResults from './VerificationResults';
import { spaceDigestService } from '../services/spaceDigestService';

const ResultIcon = ({ name, size = 18 }) => {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
    };

    const icons = {
        zap: <svg {...props}><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" fill="currentColor" stroke="none" /></svg>,
        file: <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>,
        globe: <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></svg>,
        book: <svg {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" /></svg>,
        microscope: <svg {...props}><path d="M6 18h12M8 22h8M10 18c0-3 2-5 5-6M9 4l5 5M7 6l5 5M14 4l-7 7" /><path d="M15 12a4 4 0 0 1 4 4v2" /></svg>,
        alert: <svg {...props}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>,
    };

    return icons[name] || null;
};

const SearchResults = ({ claim, papers, searchMetadata }) => {
    const [verification, setVerification] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    const handleVerify = async () => {
        setIsVerifying(true);
        setShowVerification(true);

        try {
            const result = await spaceDigestService.verifyClaim(claim, papers, 5);
            setVerification(result.success ? result.data : { error: true, message: result.error });
        } catch (error) {
            setVerification({ error: true, message: error.message });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="search-results">
            <div className="results-header">
                <div className="classification-compact">
                    <div className="classification-badge">
                        {searchMetadata?.domain || 'Research'} <span>{'->'}</span> {searchMetadata?.topic || 'Evidence'} <span>{'->'}</span> {searchMetadata?.subtopic || 'Claim analysis'}
                    </div>
                    <div className="classification-stats">
                        <span><ResultIcon name="zap" size={14} /> {searchMetadata?.queryTime || 0}ms</span>
                        <span><ResultIcon name="file" size={14} /> {searchMetadata?.totalSources || papers.length} papers</span>
                        {searchMetadata?.externallyFetched && (
                            <span className="external-source"><ResultIcon name="globe" size={14} /> Fetched from web and added to ASET</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="results-content two-column">
                <div className="papers-section">
                    <div className="papers-header">
                        <h3><ResultIcon name="book" /> Papers</h3>
                        <span className="papers-count">Showing {Math.min(visibleCount, papers.length)} of {papers.length}</span>
                    </div>

                    <div className="papers-list">
                        {papers.slice(0, visibleCount).map((paper, index) => (
                            <PaperCard key={`${paper.paperId || paper.title}-${index}`} paper={paper} rank={index + 1} />
                        ))}
                    </div>

                    {visibleCount < papers.length && (
                        <div className="show-more-container">
                            <button
                                className="show-more-button"
                                onClick={() => setVisibleCount(prev => Math.min(prev + 5, papers.length))}
                            >
                                View More Papers ({papers.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>

                <div className="verification-sidebar">
                    {!showVerification && (
                        <div className="verification-placeholder">
                            <button className="verify-button-large" onClick={handleVerify} disabled={isVerifying}>
                                <ResultIcon name="microscope" />
                                Verify Claim with AI
                            </button>
                            <p className="verify-hint">Analyze the top papers and turn search results into a supported, contradicted, or uncertain verdict.</p>
                        </div>
                    )}

                    {showVerification && isVerifying && (
                        <div className="verification-loading">
                            <div className="verification-loader-orb">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <p>AI is analyzing evidence with Groq</p>
                            <p className="loading-subtitle">Searching for agreement, contradictions, and limitations...</p>
                        </div>
                    )}

                    {showVerification && !isVerifying && verification && !verification.error && (
                        <VerificationResults verification={verification} />
                    )}

                    {showVerification && !isVerifying && verification && verification.error && (
                        <div className="verification-error">
                            <strong><ResultIcon name="alert" size={16} /> Error:</strong> {verification.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
