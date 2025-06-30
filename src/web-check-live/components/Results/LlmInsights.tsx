import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import axios from 'axios';

import colors from 'web-check-live/styles/colors';
import { StyledCard } from 'web-check-live/components/Form/Card';
import { StyledRow } from 'web-check-live/components/Form/Row';
import Button from 'web-check-live/components/Form/Button';
import Loader from 'web-check-live/components/misc/Loader';
import Heading from 'web-check-live/components/Form/Heading';

const InsightsContainer = styled(StyledCard)`
  .insights-content {
    max-height: 600px;
    overflow-y: auto;
    padding: 1rem;
    background: ${colors.background};
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
    font-family: 'PTMono';
    font-size: 0.9rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .insights-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${colors.primaryTransparent};
  }

  .insights-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .section-title {
    color: ${colors.primary};
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-content {
    color: ${colors.textColor};
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .risk-level {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0.5rem 0;
  }

  .risk-low {
    background: ${colors.success}20;
    color: ${colors.success};
    border: 1px solid ${colors.success};
  }

  .risk-medium {
    background: ${colors.warning}20;
    color: ${colors.warning};
    border: 1px solid ${colors.warning};
  }

  .risk-high {
    background: ${colors.danger}20;
    color: ${colors.danger};
    border: 1px solid ${colors.danger};
  }

  .recommendations-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  .recommendations-list li {
    padding: 0.25rem 0;
    position: relative;
    padding-left: 1.5rem;
  }

  .recommendations-list li:before {
    content: "→";
    position: absolute;
    left: 0;
    color: ${colors.primary};
    font-weight: bold;
  }

  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid ${colors.neutral};
  }

  .model-info {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .model-badge {
    background: ${colors.primary}20;
    color: ${colors.primary};
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
    border: 1px solid ${colors.primary};
  }

  .risk-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .analysis-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: ${colors.backgroundLighter};
    border-radius: 4px;
  }

  .summary-item {
    text-align: center;
    padding: 0.5rem;
    background: ${colors.background};
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
  }

  .summary-label {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    margin-bottom: 0.25rem;
  }

  .summary-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${colors.primary};
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1rem;
  }

  .progress-container {
    width: 100%;
    max-width: 400px;
    margin: 1rem 0;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: ${colors.neutral};
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: ${colors.primary};
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .progress-text {
    text-align: center;
    font-size: 0.9rem;
    color: ${colors.textColorSecondary};
    margin-top: 0.5rem;
  }

  .error-message {
    color: ${colors.danger};
    background: ${colors.danger}10;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid ${colors.danger};
    margin: 1rem 0;
  }

  .retry-button {
    margin-top: 1rem;
  }

  .model-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-online {
    background: ${colors.success};
  }

  .status-offline {
    background: ${colors.danger};
  }

  .status-checking {
    background: ${colors.warning};
  }

  .security-focus-banner {
    background: linear-gradient(135deg, ${colors.primary}20, ${colors.success}20);
    border: 1px solid ${colors.primary};
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .focus-title {
    color: ${colors.primary};
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .focus-areas {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .focus-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${colors.textColor};
  }

  .focus-icon {
    color: ${colors.primary};
    font-size: 1.2rem;
  }
`;

interface LlmInsightsProps {
  address: string;
  addressType: string;
  api: string;
  allResults?: Record<string, any>;
}

interface LlmInsightsData {
  security_risk_assessment: string;
  model: string;
  timestamp: string;
  analysis_focus: {
    open_ports: boolean;
    dnssec: boolean;
    http_security: boolean;
  };
  data_availability: {
    open_ports_available: boolean;
    dnssec_available: boolean;
    http_security_available: boolean;
    total_analyzed_areas: number;
  };
}

const formatSecurityAssessment = (assessmentText: string) => {
  if (!assessmentText) return '';
  
  // Parse security assessment sections
  const sections = assessmentText.split(/(?=\*\*[A-Z\s]+(?:ANALYSIS|SECURITY))/i);
  
  return sections.map((section, index) => {
    if (!section.trim()) return null;
    
    const lines = section.trim().split('\n');
    const titleMatch = lines[0].match(/\*\*([^*]+)\*\*/);
    const title = titleMatch ? titleMatch[1].trim() : `Security Analysis ${index + 1}`;
    
    // Extract risk level
    const riskMatch = section.match(/risk\s+level[:\s]*(\w+)/i);
    const riskLevel = riskMatch ? riskMatch[1].toLowerCase() : null;
    
    return (
      <div key={index} className="insights-section">
        <div className="section-title">{title}</div>
        {riskLevel && (
          <div className={`risk-level risk-${riskLevel}`}>
            Risk: {riskLevel.toUpperCase()}
          </div>
        )}
        <div className="section-content">
          {lines.slice(1).join('\n').replace(/\*\*/g, '')}
        </div>
      </div>
    );
  }).filter(Boolean);
};

const LlmInsights: React.FC<LlmInsightsProps> = ({ address, addressType, api, allResults }) => {
  const [insights, setInsights] = useState<LlmInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState('');
  const [modelStatus, setModelStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Test model connection
  const testModelConnection = useCallback(async (): Promise<boolean> => {
    try {
      setModelStatus('checking');
      const response = await fetch(`${api}/llm-insights-test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setModelStatus('online');
        return true;
      } else {
        setModelStatus('offline');
        return false;
      }
    } catch (err) {
      setModelStatus('offline');
      return false;
    }
  }, [api]);

  // Filter results to only include specific security checks
  const getFilteredResults = useCallback(() => {
    if (!allResults) return {};
    const filtered: Record<string, any> = {};
    
    // Include only specific security-related checks
    const securityChecks = ['dnssec', 'http-security', 'hsts', 'ports', 'security-txt', 'ssl'];
    
    securityChecks.forEach(check => {
      if (check in allResults && allResults[check] && !allResults[check].error) {
        filtered[check] = allResults[check];
      }
    });
    
    return filtered;
  }, [allResults]);

  const canAnalyze = allResults && ['dnssec', 'http-security', 'hsts', 'ports', 'security-txt', 'ssl'].some(check => check in allResults);

  const fetchInsights = useCallback(async () => {
    if (!api || !address) return;
    
    setLoading(true);
    setError(null);
    setProgress(10);
    
    try {
      let endpoint = `${api}/llm-insights?url=${encodeURIComponent(address)}`;
      
      // If we have all results, include them for better analysis
      if (allResults) {
        endpoint += `&processedResults=${encodeURIComponent(JSON.stringify(allResults))}`;
      }
      
      setProgress(30);
      
      const response = await axios.get(endpoint, {
        timeout: 60000, // 60 second timeout for LLM processing
      });
      
      setProgress(80);
      
      if (response.data) {
        setInsights(response.data);
        setProgress(100);
        toast.success('Security risk assessment completed');
      } else {
        throw new Error('No security assessment data received');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Security risk assessment failed';
      setError(errorMessage);
      toast.error(`Security Risk Assessment Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [api, address, allResults]);

  const getRiskLevel = (insights: string): 'low' | 'medium' | 'high' => {
    const lowerInsights = insights.toLowerCase();
    if (lowerInsights.includes('high risk') || lowerInsights.includes('critical') || lowerInsights.includes('severe')) {
      return 'high';
    } else if (lowerInsights.includes('medium risk') || lowerInsights.includes('moderate')) {
      return 'medium';
    }
    return 'low';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <InsightsContainer>
        <Heading as="h3" align="left" color={colors.primary}>
          Security Risk Assessment
        </Heading>
        <div className="security-focus-banner">
          <div className="focus-title">DeepSeek R1 1.5B Security Analysis</div>
          <div className="focus-areas">
            <div className="focus-area">
              <span className="focus-icon">🛡️</span>
              <span>Open Ports</span>
            </div>
            <div className="focus-area">
              <span className="focus-icon">🔐</span>
              <span>DNS Security</span>
            </div>
            <div className="focus-area">
              <span className="focus-icon">🛡️</span>
              <span>HTTP Security</span>
            </div>
          </div>
        </div>
        
        <div className="loading-container">
          <Loader show={true} />
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {progress < 30 ? 'Initializing security analysis...' :
               progress < 80 ? 'Analyzing security risks with DeepSeek R1...' :
               'Finalizing risk assessment...'}
            </div>
          </div>
        </div>
      </InsightsContainer>
    );
  }

  if (error) {
    return (
      <InsightsContainer>
        <Heading as="h3" align="left" color={colors.primary}>
          Security Risk Assessment
        </Heading>
        <div className="security-focus-banner">
          <div className="focus-title">Security Risk Assessment Failed</div>
        </div>
        <div className="error-message">
          <strong>Error:</strong> {error}
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={fetchInsights}>
              Retry Security Analysis
            </Button>
          </div>
        </div>
      </InsightsContainer>
    );
  }

  if (!insights) {
    return (
      <InsightsContainer>
        <Heading as="h3" align="left" color={colors.primary}>
          Security Risk Assessment
        </Heading>
        <div className="security-focus-banner">
          <div className="focus-title">AI-Powered Security Risk Assessment</div>
          <div className="focus-areas">
            <div className="focus-area">
              <span className="focus-icon">🛡️</span>
              <span>Open Ports Analysis</span>
            </div>
            <div className="focus-area">
              <span className="focus-icon">🔐</span>
              <span>DNS Security (DNSSEC)</span>
            </div>
            <div className="focus-area">
              <span className="focus-icon">📋</span>
              <span>HTTP Security Headers</span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Click the button below to generate a comprehensive security risk assessment using DeepSeek R1 1.5B.</p>
          <Button onClick={fetchInsights}>
            Generate Security Risk Assessment
          </Button>
        </div>
      </InsightsContainer>
    );
  }

  return (
    <InsightsContainer>
      <Heading as="h3" align="left" color={colors.primary}>
        Security Risk Assessment
      </Heading>
      <div className="security-focus-banner">
        <div className="focus-title">AI-Powered Security Risk Assessment</div>
        <div className="focus-areas">
          <div className="focus-area">
            <span className="focus-icon">🛡️</span>
            <span>Open Ports</span>
          </div>
          <div className="focus-area">
            <span className="focus-icon">🔐</span>
            <span>DNS Security</span>
          </div>
          <div className="focus-area">
            <span className="focus-icon">📋</span>
            <span>HTTP Security</span>
          </div>
        </div>
      </div>

      <div className="insights-header">
        <Heading as="h4" align="left" color={colors.primary}>
          Risk Assessment Results
        </Heading>
        <div className="model-info">
          <div className="model-badge">DeepSeek R1 1.5B</div>
          <span>Generated: {formatTimestamp(insights.timestamp)}</span>
        </div>
      </div>

      {insights.data_availability && (
        <div className="analysis-summary">
          <div className="summary-item">
            <div className="summary-label">Open Ports</div>
            <div className="summary-value">
              {insights.data_availability.open_ports_available ? '✅' : '❌'}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">DNS Security</div>
            <div className="summary-value">
              {insights.data_availability.dnssec_available ? '✅' : '❌'}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">HTTP Security</div>
            <div className="summary-value">
              {insights.data_availability.http_security_available ? '✅' : '❌'}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Areas Analyzed</div>
            <div className="summary-value">
              {insights.data_availability.total_analyzed_areas}/3
            </div>
          </div>
        </div>
      )}

      <div className="insights-content">
        {formatSecurityAssessment(insights.security_risk_assessment)}
      </div>

      <StyledRow>
        <Button onClick={fetchInsights}>
          Refresh Security Assessment
        </Button>
      </StyledRow>
    </InsightsContainer>
  );
};

export default LlmInsights; 