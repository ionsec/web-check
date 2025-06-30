import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import Heading from 'web-check-live/components/Form/Heading';

const Ja4Container = styled(Card)`
  .ja4-fingerprint {
    font-family: 'PTMono', monospace;
    font-size: 1.1rem;
    background: ${colors.backgroundLighter};
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
    margin: 1rem 0;
    word-break: break-all;
  }

  .client-simulation {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid ${colors.neutral};
    border-radius: 4px;
    background: ${colors.background};
  }

  .client-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .client-name {
    font-weight: bold;
    color: ${colors.primary};
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .status-success {
    background: ${colors.success}20;
    color: ${colors.success};
    border: 1px solid ${colors.success};
  }

  .status-error {
    background: ${colors.danger}20;
    color: ${colors.danger};
    border: 1px solid ${colors.danger};
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .component-item {
    background: ${colors.backgroundLighter};
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
  }

  .component-label {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .component-value {
    font-family: 'PTMono', monospace;
    font-size: 0.9rem;
    color: ${colors.textColor};
    word-break: break-all;
  }

  .security-insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .insight-item {
    text-align: center;
    padding: 1rem;
    background: ${colors.backgroundLighter};
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
  }

  .insight-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .insight-label {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    margin-bottom: 0.25rem;
  }

  .insight-value {
    font-weight: bold;
    color: ${colors.primary};
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .stat-item {
    text-align: center;
    padding: 1rem;
    background: ${colors.backgroundLighter};
    border-radius: 4px;
    border: 1px solid ${colors.neutral};
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${colors.primary};
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

interface Ja4FingerprintProps {
  data: any;
  title: string;
  actionButtons?: React.ReactNode;
}

const Ja4Fingerprint: React.FC<Ja4FingerprintProps> = ({ data, title, actionButtons }) => {
  if (!data || data.error) {
    return (
      <Ja4Container heading={title} actionButtons={actionButtons}>
        <p>No JA4 fingerprinting data available.</p>
        {data?.error && <p style={{ color: colors.danger }}>Error: {data.error}</p>}
      </Ja4Container>
    );
  }

  const { target, client_simulations, summary, security_insights, database_analysis } = data;

  return (
    <Ja4Container heading={title} actionButtons={actionButtons}>
      {target && (
        <>
          <Row lbl="Target Host" val={target.hostname} />
          <Row lbl="Port" val={target.port} />
        </>
      )}
      
      {/* Summary Statistics */}
      {summary && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Summary Statistics</Heading>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{summary.total_clients}</div>
              <div className="stat-label">Total Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{summary.successful_connections}</div>
              <div className="stat-label">Successful</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{summary.unique_ja4_fingerprints}</div>
              <div className="stat-label">Unique JA4</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{summary.tls_versions_supported?.length || 0}</div>
              <div className="stat-label">TLS Versions</div>
            </div>
          </div>
        </>
      )}

      {/* Security Insights */}
      {security_insights && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Security Insights</Heading>
          <div className="security-insights">
            <div className="insight-item">
              <div className="insight-icon">
                {security_insights.tls_1_3_support ? '✅' : '❌'}
              </div>
              <div className="insight-label">TLS 1.3 Support</div>
              <div className="insight-value">
                {security_insights.tls_1_3_support ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">
                {security_insights.strong_ciphers ? '✅' : '❌'}
              </div>
              <div className="insight-label">Strong Ciphers</div>
              <div className="insight-value">
                {security_insights.strong_ciphers ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">
                {security_insights.certificate_validation ? '✅' : '❌'}
              </div>
              <div className="insight-label">Valid Certificates</div>
              <div className="insight-value">
                {security_insights.certificate_validation ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">
                {security_insights.alpn_support ? '✅' : '❌'}
              </div>
              <div className="insight-label">ALPN Support</div>
              <div className="insight-value">
                {security_insights.alpn_support ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Database Analysis */}
      {database_analysis && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>JA4+ Database Analysis</Heading>
          {database_analysis.database_available ? (
            <>
              <Row lbl="Total Fingerprints Looked Up" val={database_analysis.total_fingerprints_looked_up} />
              <Row lbl="Total Database Matches" val={database_analysis.total_database_matches} />
              <Row lbl="Fingerprints with Matches" val={database_analysis.fingerprints_with_matches?.length || 0} />
              {/* Top Applications */}
              {database_analysis.top_applications && database_analysis.top_applications.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <Heading as="h4" align="left" color={colors.primary}>Top Applications</Heading>
                  <ul>
                    {database_analysis.top_applications.map((app: any, idx: number) => (
                      <li key={idx}>{app.name} ({app.observation_count} obs)</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Top Devices */}
              {database_analysis.top_devices && database_analysis.top_devices.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <Heading as="h4" align="left" color={colors.primary}>Top Devices</Heading>
                  <ul>
                    {database_analysis.top_devices.map((dev: any, idx: number) => (
                      <li key={idx}>{dev.name} ({dev.observation_count} obs)</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: colors.warning, margin: '1rem 0' }}>
              JA4+ Database lookup unavailable or returned no data.
            </div>
          )}
        </>
      )}

      {/* Most Common JA4 Fingerprint */}
      {summary && summary.most_common_ja4 && summary.most_common_ja4 !== 'unknown' && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Most Common JA4 Fingerprint</Heading>
          <div className="ja4-fingerprint">
            {summary.most_common_ja4}
          </div>
        </>
      )}

      {/* Client Simulations */}
      {client_simulations && client_simulations.length > 0 && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Client Simulations</Heading>
          {client_simulations.map((client: any, index: number) => (
            <div key={index} className="client-simulation">
              <div className="client-header">
                <span className="client-name">{client.client}</span>
                <span className={`status-badge ${client.success ? 'status-success' : 'status-error'}`}>
                  {client.success ? 'Success' : 'Failed'}
                </span>
              </div>
              
              {client.success && client.ja4 && (
                <>
                  <div className="ja4-fingerprint">
                    <strong>JA4:</strong> {client.ja4.ja4}
                  </div>
                  
                  <div className="components-grid">
                    {client.ja4.components && Object.entries(client.ja4.components).map(([key, value]: [string, any]) => (
                      <div key={key} className="component-item">
                        <div className="component-label">{key.replace(/_/g, ' ')}</div>
                        <div className="component-value">{value}</div>
                      </div>
                    ))}
                  </div>

                  {client.tls_info && (
                    <div style={{ marginTop: '1rem' }}>
                      <Row lbl="Protocol" val={client.tls_info.protocol} />
                      <Row lbl="Cipher" val={client.tls_info.cipher?.name} />
                      <Row lbl="Authorized" val={client.tls_info.authorized ? 'Yes' : 'No'} />
                    </div>
                  )}
                </>
              )}
              
              {!client.success && (
                <p style={{ color: colors.danger, margin: '0.5rem 0' }}>
                  Error: {client.error}
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {/* TLS Versions Supported */}
      {summary && summary.tls_versions_supported && summary.tls_versions_supported.length > 0 && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Supported TLS Versions</Heading>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {summary.tls_versions_supported.map((version: string, index: number) => (
              <span
                key={index}
                style={{
                  background: colors.primary + '20',
                  color: colors.primary,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  border: `1px solid ${colors.primary}`
                }}
              >
                {version}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Cipher Suites Supported */}
      {summary && summary.cipher_suites_supported && summary.cipher_suites_supported.length > 0 && (
        <>
          <Heading as="h3" align="left" color={colors.primary}>Supported Cipher Suites</Heading>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {summary.cipher_suites_supported.slice(0, 10).map((cipher: string, index: number) => (
              <span
                key={index}
                style={{
                  background: colors.success + '20',
                  color: colors.success,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  border: `1px solid ${colors.success}`
                }}
              >
                {cipher}
              </span>
            ))}
            {summary.cipher_suites_supported.length > 10 && (
              <span style={{ color: colors.textColorSecondary, fontSize: '0.8rem' }}>
                +{summary.cipher_suites_supported.length - 10} more
              </span>
            )}
          </div>
        </>
      )}
    </Ja4Container>
  );
};

export default Ja4Fingerprint; 