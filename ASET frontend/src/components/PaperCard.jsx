import React from 'react';

const PaperCard = ({ paper, rank }) => {
    const getRelevanceColor = (score) => {
        if (score >= 8) return '#10b981'; // Green
        if (score >= 6) return '#3b82f6'; // Blue
        if (score >= 4) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getRelevanceLabel = (score) => {
        if (score >= 8) return 'Highly Relevant';
        if (score >= 6) return 'Very Relevant';
        if (score >= 4) return 'Relevant';
        return 'Somewhat Relevant';
    };

    const relevanceColor = getRelevanceColor(paper.relevance || 0);
    const relevanceLabel = getRelevanceLabel(paper.relevance || 0);

    return (
        <div className="paper-card">
            {rank && <div className="paper-rank">#{rank}</div>}
            <div className="paper-header">
                <div className="paper-title">{paper.title}</div>
                <div className="paper-relevance">
                    <div className="relevance-score" style={{ background: relevanceColor }}>
                        {(paper.relevance || 0).toFixed(1)}
                    </div>
                </div>
            </div>

            <div className="paper-meta">
                <span className="paper-badge" style={{ 
                    background: paper.source === 'nasa-ads' ? '#f59e0b' : '#3b82f6' 
                }}>
                    {paper.source === 'nasa-ads' ? 'NASA ADS' : 'arXiv'}
                </span>
                <span>{paper.journal || 'Preprint'}</span>
                {paper.year && <span>• {paper.year}</span>}
            </div>

            <div className="paper-authors">
                {Array.isArray(paper.authors) ? paper.authors : paper.authors || 'Unknown authors'}
            </div>

            {paper.paperId && (
                <div className="paper-link-container">
                    <a href={paper.url} className="paper-link" target="_blank" rel="noopener noreferrer">
                        View Paper →
                    </a>
                </div>
            )}

            {paper.abstract && (
                <details className="paper-abstract-toggle">
                    <summary>Show Abstract</summary>
                    <div className="paper-abstract">
                        {paper.abstract}
                    </div>
                </details>
            )}
        </div>
    );
};

export default PaperCard;
