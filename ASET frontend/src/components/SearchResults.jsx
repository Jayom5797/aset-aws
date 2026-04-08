import React, { useState } from 'react';
import PaperCard from './PaperCard';
import VerificationResults from './VerificationResults';
import { spaceDigestService } from '../services/spaceDigestService';

const SearchResults = ({ claim, papers, searchMetadata }) => {
    const [verification, setVerification] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);

    const handleVerify = async () => {
        setIsVerifying(true);
        setShowVerification(true);

        try {
            const result = await spaceDigestService.verifyClaim(claim, papers, 5);
            
            if (result.success) {
                setVerification(result.data);
            } else {
                setVerification({
                    error: true,
                    message: result.error
                });
            }
        } catch (error) {
            setVerification({
                error: true,
                message: error.message
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="search-results">
            {/* Header with Classification */}
            <div className="results-header">
                <div className="classification-compact">
                    <div className="classification-badge">
                        {searchMetadata.domain} → {searchMetadata.topic} → {searchMetadata.subtopic}
                    </div>
                    <div className="classification-stats">
                        <span>⚡ {searchMetadata.queryTime}ms</span>
                        <span>📄 {searchMetadata.totalSources} papers</span>
                        {searchMetadata.externallyFetched && (
                            <span style={{ color: '#00ffaa', fontWeight: 600 }}>🌐 Fetched from web & added to ASET</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Two Column Layout: Papers Left, Verification Right */}
            <div className="results-content two-column">
                {/* Papers List - Left Column */}
                <div className="papers-section">
                    <div className="papers-header">
                        <h3>📖 Papers</h3>
                        <span className="papers-count">Showing {Math.min(visibleCount, papers.length)} of {papers.length}</span>
                    </div>
                    <div className="papers-list">
                        {papers.slice(0, visibleCount).map((paper, index) => (
                            <PaperCard key={index} paper={paper} rank={index + 1} />
                        ))}
                    </div>
                    {visibleCount < papers.length && (
                        <div className="show-more-container">
                            <button 
                                className="show-more-button"
                                onClick={() => setVisibleCount(prev => Math.min(prev + 10, papers.length))}
                            >
                                Load More ({papers.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>

                {/* Verification Sidebar - Right Column (Sticky) */}
                <div className="verification-sidebar">
                    {!showVerification && (
                        <div className="verification-placeholder">
                            <button 
                                className="verify-button-large" 
                                onClick={handleVerify}
                                disabled={isVerifying}
                            >
                                {isVerifying ? '⏳ Analyzing...' : '🔬 Verify Claim with AI'}
                            </button>
                            <p className="verify-hint">Click to analyze papers and verify the claim using AI</p>
                        </div>
                    )}
                    
                    {showVerification && isVerifying && (
                        <div className="verification-loading">
                            <p>🤖 AI analyzing with Groq</p>
                            <p className="loading-subtitle">Takes 5-10 seconds...</p>
                        </div>
                    )}
                    
                    {showVerification && !isVerifying && verification && !verification.error && (
                        <VerificationResults verification={verification} />
                    )}
                    
                    {showVerification && !isVerifying && verification && verification.error && (
                        <div className="verification-error">
                            <strong>❌ Error:</strong> {verification.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
