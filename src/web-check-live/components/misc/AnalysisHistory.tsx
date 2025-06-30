import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

interface AnalysisResult {
  _id: string;
  url: string;
  domain: string;
  created_at: string;
  analysis_date: string;
  cached?: boolean;
  cache_age_minutes?: number;
  metadata?: {
    processing_time: number;
    ip_address: string;
  };
}

interface AnalysisHistoryProps {
  onSelectAnalysis: (url: string) => void;
  currentUrl?: string;
}

const AnalysisHistoryContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px 0;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const HistoryTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
`;

const HistoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  background: ${props => props.active ? '#eff6ff' : 'transparent'};
  transition: all 0.2s;
`;

const SearchSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  
  input:focus {
    border-color: #3b82f6;
  }
  
  &::before {
    content: "🔍";
    position: absolute;
    left: 12px;
    color: #9ca3af;
  }
`;

const AnalysesList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const AnalysisItem = styled.div<{ current: boolean }>`
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.current ? '#eff6ff' : 'transparent'};
  border-left: ${props => props.current ? '4px solid #3b82f6' : 'none'};
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const UrlInfo = styled.div`
  flex: 1;
`;

const Url = styled.div`
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  margin-bottom: 2px;
`;

const Domain = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const CacheBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const AnalysisMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
`;

const ProcessingTime = styled.span`
  color: #059669;
  font-weight: 500;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  
  &::before {
    content: "📊";
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ onSelectAnalysis, currentUrl }) => {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'search'>('recent');
  const [stats, setStats] = useState<{ total_analyses: number; unique_domains: number } | null>(null);

  const fetchRecentAnalyses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analysis-history?action=recent&limit=10');
      const data = await response.json();
      if (data.analyses) {
        setRecentAnalyses(data.analyses);
      }
    } catch (error) {
      console.error('Failed to fetch recent analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analysis-history?action=stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const searchAnalyses = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/analysis-history?action=search&query=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      if (data.analyses) {
        setSearchResults(data.analyses);
      }
    } catch (error) {
      console.error('Failed to search analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatProcessingTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  useEffect(() => {
    fetchRecentAnalyses();
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAnalyses();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderAnalysisItem = (analysis: AnalysisResult) => (
    <AnalysisItem
      key={analysis._id}
      current={currentUrl === analysis.url}
      onClick={() => onSelectAnalysis(analysis.url)}
    >
      <AnalysisHeader>
        <span>🌐</span>
        <UrlInfo>
          <Url>{analysis.url}</Url>
          <Domain>{analysis.domain}</Domain>
        </UrlInfo>
        {analysis.cached && (
          <CacheBadge>
            ⏰ {analysis.cache_age_minutes}m
          </CacheBadge>
        )}
      </AnalysisHeader>
      <AnalysisMeta>
        <span>{formatDate(analysis.analysis_date)}</span>
        {analysis.metadata?.processing_time && (
          <ProcessingTime>
            {formatProcessingTime(analysis.metadata.processing_time)}
          </ProcessingTime>
        )}
      </AnalysisMeta>
    </AnalysisItem>
  );

  return (
    <AnalysisHistoryContainer>
      <HistoryHeader>
        <HistoryTitle>
          📊 Analysis History
        </HistoryTitle>
        {stats && (
          <Stats>
            <span>{stats.total_analyses} analyses</span>
            <span>{stats.unique_domains} domains</span>
          </Stats>
        )}
      </HistoryHeader>

      <HistoryTabs>
        <Tab
          active={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}
        >
          ⏰ Recent
        </Tab>
        <Tab
          active={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search
        </Tab>
      </HistoryTabs>

      {activeTab === 'search' && (
        <SearchSection>
          <SearchInput>
            <input
              type="text"
              placeholder="Search by URL or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>
        </SearchSection>
      )}

      <AnalysesList>
        {isLoading ? (
          <Loading>Loading...</Loading>
        ) : activeTab === 'recent' ? (
          recentAnalyses.length > 0 ? (
            recentAnalyses.map(renderAnalysisItem)
          ) : (
            <EmptyState>
              <p>No recent analyses found</p>
            </EmptyState>
          )
        ) : (
          searchResults.length > 0 ? (
            searchResults.map(renderAnalysisItem)
          ) : searchQuery ? (
            <EmptyState>
              <p>No results found for "{searchQuery}"</p>
            </EmptyState>
          ) : (
            <EmptyState>
              <p>Enter a search term to find analyses</p>
            </EmptyState>
          )
        )}
      </AnalysesList>
    </AnalysisHistoryContainer>
  );
};

export default AnalysisHistory; 