import React from 'react';

const VerificationIcon = ({ name, size = 18 }) => {
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
        microscope: <svg {...props}><path d="M6 18h12M8 22h8M10 18c0-3 2-5 5-6M9 4l5 5M7 6l5 5M14 4l-7 7" /><path d="M15 12a4 4 0 0 1 4 4v2" /></svg>,
        summary: <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>,
        key: <svg {...props}><circle cx="7.5" cy="14.5" r="3.5" /><path d="M10 12 21 1M16 6l2 2M14 8l2 2" /></svg>,
        alert: <svg {...props}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>,
        chart: <svg {...props}><path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" /></svg>,
        check: <svg {...props}><path d="m5 12 4 4L19 6" /></svg>,
        x: <svg {...props}><path d="M18 6 6 18M6 6l12 12" /></svg>,
        minus: <svg {...props}><path d="M5 12h14" /></svg>,
    };

    return icons[name] || null;
};

const VerificationResults = ({ verification }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#7f8cff';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const scoreColor = getScoreColor(verification.verificationScore);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(verification.verificationScore / 100) * circumference} ${circumference}`;

    return (
        <div className="verification-results">
            <h3 className="verification-title"><VerificationIcon name="microscope" /> AI Verification Results</h3>
            <p className="verification-subtitle">
                Analyzed {verification.papersAnalyzed} papers in {(verification.processingTimeMs / 1000).toFixed(1)}s
            </p>

            <div className="score-circle-container">
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="rgba(155, 143, 199, 0.2)"
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

            <div className="verdict-container">
                <div className="verdict-badge" style={{ background: scoreColor }}>
                    {verification.verdict}
                </div>
                <div className="confidence-text">
                    Confidence: <strong>{verification.confidence}</strong>
                </div>
            </div>

            <div className="verification-summary" style={{ borderLeftColor: scoreColor }}>
                <h4><VerificationIcon name="summary" /> Summary</h4>
                <p>{verification.summary}</p>
            </div>

            {verification.keyFindings && verification.keyFindings.length > 0 && (
                <div className="key-findings">
                    <h4><VerificationIcon name="key" /> Key Findings</h4>
                    <ul>
                        {verification.keyFindings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                        ))}
                    </ul>
                </div>
            )}

            {verification.limitations && (
                <div className="verification-limitations">
                    <strong><VerificationIcon name="alert" /> Limitations:</strong> {verification.limitations}
                </div>
            )}

            {verification.analyses && verification.analyses.length > 0 && (
                <details className="detailed-analyses">
                    <summary><VerificationIcon name="chart" /> View Detailed Paper Analyses ({verification.analyses.length} papers)</summary>
                    <div className="analyses-list">
                        {verification.analyses.map((analysis, index) => {
                            const stanceColor =
                                analysis.stance === 'supports' ? '#10b981' :
                                analysis.stance === 'contradicts' ? '#ef4444' : '#6b7280';
                            const stanceIcon =
                                analysis.stance === 'supports' ? 'check' :
                                analysis.stance === 'contradicts' ? 'x' : 'minus';

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
                                                {analysis.paperYear} · Relevance: {analysis.relevanceScore.toFixed(1)}/10
                                            </div>
                                        </div>
                                        <div className="analysis-stance">
                                            <div
                                                className="stance-badge"
                                                style={{ background: stanceColor }}
                                            >
                                                <VerificationIcon name={stanceIcon} size={12} /> {analysis.stance.toUpperCase()}
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
