import axios from 'axios';
import middleware from './_common/middleware.js';
import { saveAnalysisResult, getAnalysisResult } from './analysis-history.js';

const checkWithHistoryHandler = async (url, req) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    const startTime = Date.now();
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

    // First, check if we have a recent analysis in cache
    console.log(`🔍 Checking for existing analysis of ${url}`);
    const existingAnalysis = getAnalysisResult(url);
    
    // If we have a recent analysis (less than 6 hours old), return it
    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.analysis_date).getTime();
      const maxAge = 6 * 60 * 60 * 1000; // 6 hours in milliseconds (reduced from 24 hours)
      
      if (analysisAge < maxAge) {
        console.log(`✅ Returning cached analysis for ${url} (age: ${Math.round(analysisAge / 1000 / 60)} minutes)`);
        return {
          ...existingAnalysis,
          cached: true,
          cache_age_minutes: Math.round(analysisAge / 1000 / 60),
          storage_type: 'in-memory'
        };
      } else {
        console.log(`⏰ Cached analysis for ${url} is too old (age: ${Math.round(analysisAge / 1000 / 60)} minutes), performing fresh analysis`);
      }
    }

    // Perform fresh analysis
    console.log(`🔄 Performing fresh analysis for ${url}`);
    
    // Get the base API endpoint
    const apiBase = process.env.PUBLIC_API_ENDPOINT || `http://localhost:${process.env.PORT || 3000}/api`;
    
    // Call all analysis endpoints
    const allResultsResponse = await axios.get(`${apiBase}?url=${encodeURIComponent(url)}`, {
      timeout: 120000
    });

    if (allResultsResponse.data && allResultsResponse.data.error) {
      throw new Error(`Failed to fetch analysis results: ${allResultsResponse.data.error}`);
    }

    const analysisResults = allResultsResponse.data;
    const processingTime = Date.now() - startTime;

    // Try to get LLM security risk assessment if available
    let llmInsights = null;
    try {
      console.log(`🧠 Generating security risk assessment for ${url}`);
      const llmResponse = await axios.get(`${apiBase}/llm-insights?url=${encodeURIComponent(url)}&processedResults=${encodeURIComponent(JSON.stringify(analysisResults))}`, {
        timeout: 60000
      });
      if (llmResponse.data && !llmResponse.data.error) {
        llmInsights = llmResponse.data;
        console.log(`✅ Security risk assessment generated for ${url}`);
      }
    } catch (llmError) {
      console.log(`⚠️ LLM security risk assessment not available: ${llmError.message}`);
    }

    // Save the analysis results to in-memory cache
    const metadata = {
      ip_address: clientIP,
      processing_time: processingTime,
      user_agent: req.headers['user-agent'] || 'unknown',
      analysis_version: '2.1.0'
    };

    const saveResult = saveAnalysisResult(url, analysisResults, llmInsights, metadata);

    console.log(`💾 Analysis results ${saveResult.success ? 'cached' : 'failed to cache'} for ${url} (processing time: ${processingTime}ms)`);

    return {
      url: url,
      analysis_date: new Date().toISOString(),
      results: analysisResults,
      llm_insights: llmInsights,
      metadata: metadata,
      cached: false,
      processing_time: processingTime,
      storage_type: 'in-memory',
      version: '2.1.0'
    };

  } catch (error) {
    console.error(`❌ Error in check-with-history for ${url}:`, error.message);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};

export const handler = middleware(checkWithHistoryHandler);
export default handler; 