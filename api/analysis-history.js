import middleware from './_common/middleware.js';

// In-memory storage for analysis history (replaces MongoDB)
// Note: This data will be lost when the server restarts
const analysisCache = new Map();
const recentAnalyses = [];
const MAX_CACHE_SIZE = 100;
const MAX_RECENT_SIZE = 50;

// Helper function to clean old entries
const cleanupCache = () => {
  if (analysisCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(analysisCache.entries());
    entries.sort((a, b) => new Date(b[1].analysis_date) - new Date(a[1].analysis_date));
    
    // Keep only the most recent entries
    analysisCache.clear();
    entries.slice(0, MAX_CACHE_SIZE).forEach(([key, value]) => {
      analysisCache.set(key, value);
    });
  }
  
  if (recentAnalyses.length > MAX_RECENT_SIZE) {
    recentAnalyses.splice(MAX_RECENT_SIZE);
  }
};

// Custom middleware that doesn't require URL for certain actions
const customMiddleware = (handler) => {
  return (req, res) => {
    const { action } = req.query;
    
    // For actions that don't require URL, bypass the URL check
    if (['recent', 'search', 'stats'].includes(action)) {
      const mockUrl = 'dummy'; // Provide a dummy URL to satisfy middleware
      return handler(mockUrl, req, res);
    }
    
    // For actions that require URL, use normal middleware
    return middleware(handler)(req, res);
  };
};

const analysisHistoryHandler = async (url, req) => {
  try {
    const { action, query, limit } = req.query;
    
    switch (action) {
      case 'get':
        if (!url || url === 'dummy') {
          throw new Error('URL parameter is required for get action');
        }
        const result = analysisCache.get(url);
        if (!result) {
          return { error: 'Analysis result not found in current session' };
        }
        return result;
        
      case 'recent':
        const recentLimit = parseInt(limit) || 10;
        const recentResults = recentAnalyses
          .sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date))
          .slice(0, recentLimit);
        return {
          analyses: recentResults,
          count: recentResults.length,
          note: 'Results are from current session only (in-memory storage)'
        };
        
      case 'search':
        if (!query) {
          throw new Error('Query parameter is required for search action');
        }
        const searchLimit = parseInt(limit) || 20;
        const searchResults = Array.from(analysisCache.values())
          .filter(analysis => 
            analysis.url.toLowerCase().includes(query.toLowerCase()) ||
            (analysis.domain && analysis.domain.toLowerCase().includes(query.toLowerCase()))
          )
          .sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date))
          .slice(0, searchLimit);
        
        return {
          analyses: searchResults,
          count: searchResults.length,
          query: query,
          note: 'Search results are from current session only (in-memory storage)'
        };
        
      case 'stats':
        const allAnalyses = Array.from(analysisCache.values());
        const uniqueDomains = new Set(allAnalyses.map(a => a.domain).filter(Boolean));
        
        return {
          total_analyses: allAnalyses.length,
          unique_domains: uniqueDomains.size,
          session_start: process.env.SERVER_START_TIME || new Date().toISOString(),
          storage_type: 'in-memory',
          note: 'Statistics are from current session only (in-memory storage)'
        };
        
      default:
        throw new Error('Invalid action. Supported actions: get, recent, search, stats');
    }
  } catch (error) {
    throw new Error(`Analysis history operation failed: ${error.message}`);
  }
};

// Function to save analysis result (called by other modules)
export const saveAnalysisResult = (url, results, llmInsights = null, metadata = {}) => {
  try {
    const domain = new URL(url).hostname;
    const now = new Date();
    
    const analysisData = {
      url: url,
      domain: domain,
      created_at: now,
      analysis_date: now.toISOString(),
      results: results,
      metadata: {
        user_agent: 'Web-Check/2.1.0',
        ip_address: metadata.ip_address || 'unknown',
        processing_time: metadata.processing_time || 0,
        storage_type: 'in-memory',
        ...metadata
      }
    };

    if (llmInsights) {
      analysisData.llm_insights = llmInsights;
    }

    // Store in cache and recent list
    analysisCache.set(url, analysisData);
    
    // Add to recent analyses (avoid duplicates)
    const existingIndex = recentAnalyses.findIndex(a => a.url === url);
    if (existingIndex >= 0) {
      recentAnalyses.splice(existingIndex, 1);
    }
    recentAnalyses.unshift(analysisData);
    
    // Cleanup if needed
    cleanupCache();
    
    console.log(`💾 Analysis result cached for ${url} (in-memory storage)`);
    return { success: true, cached: true };
  } catch (error) {
    console.error('❌ Error caching analysis result:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to get analysis result (called by other modules)
export const getAnalysisResult = (url) => {
  try {
    return analysisCache.get(url) || null;
  } catch (error) {
    console.error('❌ Error retrieving analysis result:', error.message);
    return null;
  }
};

// Set server start time for stats
if (!process.env.SERVER_START_TIME) {
  process.env.SERVER_START_TIME = new Date().toISOString();
}

export const handler = customMiddleware(analysisHistoryHandler);
export default handler; 