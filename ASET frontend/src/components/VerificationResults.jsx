import React from 'react';

const VerificationResults = ({ verification }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#3b82f6'; // Blue
        if (score >= 40) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const scoreColor = getScoreColor(verification.verificationScore);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(verification.verificationScore / 100) * circumference} ${circumference}`;

    return (
        <div className="verification-results">
            <h3 className="verification-title">🔬 AI Verification Results</h3>
            <p className="verification-subtitle">
                Analyzed {verification.papersAnalyzed} papers in {(verification.processingTimeMs / 1000).toFixed(1)}s
            </p>

            {/* Score Circle */}
            <div className="score-circle-container">
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="rgba(102, 126, 234, 0.2)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div className="score-text">
                    <div className="score-number" style={{ color: scoreColor }}>
                        {verification.verificationScore}%
                    </div>
                    <div className="score-label">Verification Score</div>
                </div>
            </div>

            {/* Verdict */}
            <div className="verdict-container">
                <div className="verdict-badge" style={{ background: scoreColor }}>
                    {verification.verdict}
                </div>
                <div className="confidence-text">
                    Confidence: <strong>{verification.confidence}</strong>
                </div>
            </div>

            {/* Summary */}
            <div className="verification-summary" style={{ borderLeftColor: scoreColor }}>
                <h4>📝 Summary</h4>
                <p>{verification.summary}</p>
            </div>

            {/* Key Findings */}
            {verification.keyFindings && verification.keyFindings.length > 0 && (
                <div className="key-findings">
                    <h4>🔑 Key Findings</h4>
                    <ul>
                        {verification.keyFindings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Limitations */}
            {verification.limitations && (
                <div className="verification-limitations">
                    <strong>⚠️ Limitations:</strong> {verification.limitations}
                </div>
            )}

            {/* Detailed Analyses */}
            {verification.analyses && verification.analyses.length > 0 && (
                <details className="detailed-analyses">
                    <summary>📊 View Detailed Paper Analyses ({verification.analyses.length} papers)</summary>
                    <div className="analyses-list">
                        {verification.analyses.map((analysis, index) => {
                            const stanceColor =
                                analysis.stance === 'supports' ? '#10b981' :
                                analysis.stance === 'contradicts' ? '#ef4444' : '#6b7280';
                            const stanceIcon =
                                analysis.stance === 'supports' ? '✅' :
                                analysis.stance === 'contradicts' ? '❌' : '➖';

                            return (
                                <div
                                    key={index}
                                    className="analysis-item"
                                    style={{ borderLeftColor: stanceColor }}
                                >
                                    <div className="analysis-header">
                                        <div className="analysis-title">
                                            <strong>{analysis.paperTitle}</strong>
                                            <div className="analysis-meta">
                                                {analysis.paperYear} • Relevance: {analysis.relevanceScore.toFixed(1)}/10
                                            </div>
                                        </div>
                                        <div className="analysis-stance">
                                            <div
                                                className="stance-badge"
                                                style={{ background: stanceColor }}
                                            >
                                                {stanceIcon} {analysis.stance.toUpperCase()}
                                            </div>
                                            <div className="confidence-small">
                                                {analysis.confidence}% confident
                                            </div>
                                        </div>
                                    </div>
                                    {analysis.evidence && (
                                        <div className="analysis-evidence">
                                            <strong>Evidence:</strong> {analysis.evidence}
                                        </div>
                                    )}
                                    {analysis.reasoning && (
                                        <div className="analysis-reasoning">
                                            {analysis.reasoning}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </details>
            )}
        </div>
    );
};

export default VerificationResults;
