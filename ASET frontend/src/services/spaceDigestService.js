// SpaceDigest API integration service
// Connects ASET frontend to SpaceDigest backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const spaceDigestService = {
    /**
     * Search for papers based on a claim
     * @param {string} claim - The scientific claim to search for
     * @param {object} filters - Optional filters (yearMin, yearMax, topic, subtopic, source, minRelevance)
     * @param {number} limit - Number of papers to return
     * @param {number} offset - Pagination offset
     * @returns {Promise<object>} Search results with papers
     */
    searchPapers: async (claim, filters = {}, limit = 10, offset = 0) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/get-sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim, filters, limit, offset })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Search papers error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Verify a claim using AI analysis
     * @param {string} claim - The scientific claim to verify
     * @param {array} papers - Array of papers to analyze
     * @param {number} maxPapers - Maximum number of papers to analyze
     * @returns {Promise<object>} Verification results with score and analysis
     */
    verifyClaim: async (claim, papers, maxPapers = 5) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim, papers, maxPapers })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Verify claim error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get available filter options
     * @returns {Promise<object>} Available topics, subtopics, year ranges, sources
     */
    getFilters: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filters`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Get filters error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Combined search and verify - the main workflow
     * @param {string} claim - The scientific claim
     * @param {object} filters - Optional filters
     * @returns {Promise<object>} Combined results with papers and verification
     */
    searchAndVerify: async (claim, filters = {}) => {
        try {
            // Step 1: Search for papers
            const searchResult = await spaceDigestService.searchPapers(claim, filters, 50, 0);
            
            if (!searchResult.success) {
                return searchResult;
            }

            const papers = searchResult.data.sources || [];
            
            if (papers.length === 0) {
                return {
                    success: true,
                    data: {
                        papers: [],
                        verification: null,
                        message: 'No papers found for this claim'
                    }
                };
            }

            // Step 2: Verify the claim with found papers
            const verifyResult = await spaceDigestService.verifyClaim(claim, papers, 5);

            return {
                success: true,
                data: {
                    papers: papers,
                    verification: verifyResult.success ? verifyResult.data : null,
                    searchMetadata: {
                        domain: searchResult.data.domain,
                        topic: searchResult.data.topic,
                        subtopic: searchResult.data.subtopic,
                        totalSources: searchResult.data.totalSources,
                        queryTime: searchResult.data.queryTime
                    }
                }
            };
        } catch (error) {
            console.error('Search and verify error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
