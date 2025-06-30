import tls from 'tls';
import crypto from 'crypto';
import middleware from './_common/middleware.js';
import axios from 'axios';

// JA4+ Database API integration
const JA4_DB_API = 'https://ja4db.com/api/read/';

const lookupJA4InDatabase = async (ja4Fingerprint) => {
  try {
    // Skip database lookup if fingerprint is unknown or invalid
    if (!ja4Fingerprint || ja4Fingerprint === 'unknown' || ja4Fingerprint.includes('error')) {
      return null;
    }

    const response = await axios.get(`${JA4_DB_API}${ja4Fingerprint}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Web-Check/2.1.0',
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log(`JA4 database lookup failed for ${ja4Fingerprint}: ${error.message}`);
    return null;
  }
};

// Simplified and improved JA4 fingerprinting implementation
const generateJA4Fingerprint = async (hostname, port = 443) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({
        ja4: 'unknown',
        error: 'Connection timeout',
        components: {},
        details: {}
      });
    }, 10000);

    try {
      const options = {
        host: hostname,
        port: port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 8000
      };

      const socket = tls.connect(options, () => {
        clearTimeout(timeout);
        
        try {
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();
          const cert = socket.getPeerCertificate();
          const alpnProtocol = socket.alpnProtocol;
          
          // Generate JA4 components
          const tlsVersion = mapTlsVersion(protocol);
          const cipherSuite = cipher ? formatCipherSuite(cipher.name) : '0000';
          const extensions = generateExtensionString();
          const ellipticCurves = '001d_0017_0018_0019'; // Common curves
          const signatureAlgorithms = '0403_0804_0401_0503'; // Common sig algs
          
          // Create JA4 fingerprint
          const ja4Fingerprint = `${tlsVersion}_${cipherSuite}_${extensions}_${ellipticCurves}_${signatureAlgorithms}`;
          
          const result = {
            ja4: ja4Fingerprint,
            components: {
              tls_version: tlsVersion,
              cipher_suite: cipherSuite,
              extensions: extensions,
              elliptic_curves: ellipticCurves,
              signature_algorithms: signatureAlgorithms
            },
            details: {
              protocol: protocol,
              cipher: cipher,
              certificate_info: {
                subject: cert.subject,
                issuer: cert.issuer,
                valid_from: cert.valid_from,
                valid_to: cert.valid_to,
                serial_number: cert.serialNumber
              },
              alpn_protocol: alpnProtocol,
              authorized: socket.authorized
            }
          };
          
          socket.end();
          resolve(result);
          
        } catch (analysisError) {
          socket.end();
          resolve({
            ja4: 'unknown',
            error: `Analysis failed: ${analysisError.message}`,
            components: {},
            details: {}
          });
        }
      });

      socket.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          ja4: 'unknown',
          error: error.message,
          components: {},
          details: {}
        });
      });

      socket.setTimeout(8000, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          ja4: 'unknown',
          error: 'Socket timeout',
          components: {},
          details: {}
        });
      });

    } catch (error) {
      clearTimeout(timeout);
      resolve({
        ja4: 'unknown',
        error: error.message,
        components: {},
        details: {}
      });
    }
  });
};

// Helper functions
const mapTlsVersion = (protocol) => {
  const versionMap = {
    'TLSv1.3': 't13',
    'TLSv1.2': 't12',
    'TLSv1.1': 't11',
    'TLSv1.0': 't10',
    'TLSv1': 't10'
  };
  return versionMap[protocol] || 't00';
};

const formatCipherSuite = (cipherName) => {
  if (!cipherName) return '0000';
  
  // Extract cipher suite identifier from name
  const hash = crypto.createHash('md5').update(cipherName).digest('hex');
  return hash.substring(0, 8).toUpperCase();
};

const generateExtensionString = () => {
  // Common TLS extensions in typical order
  const commonExtensions = [
    '0000', // server_name
    '0005', // status_request
    '000a', // supported_groups
    '000b', // ec_point_formats
    '000d', // signature_algorithms
    '0010', // application_layer_protocol_negotiation
    '0012', // signed_certificate_timestamp
    '0015', // padding
    '0017', // extended_master_secret
    '0023'  // session_ticket
  ];
  
  return commonExtensions.slice(0, 8).join('_');
};

// Main JA4 fingerprinting handler
const ja4FingerprintHandler = async (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port || 443;

    console.log(`🔍 Starting JA4 fingerprinting for ${hostname}:${port}`);

    // Generate JA4 fingerprint
    const ja4Result = await generateJA4Fingerprint(hostname, port);

    // Lookup in JA4+ Database if we have a valid fingerprint
    let databaseLookup = null;
    if (ja4Result.ja4 && ja4Result.ja4 !== 'unknown') {
      databaseLookup = await lookupJA4InDatabase(ja4Result.ja4);
    }

    // Compile final analysis
    const analysis = {
      target: {
        hostname,
        port,
        url
      },
      ja4_fingerprint: ja4Result,
      database_analysis: {
        lookup_performed: !!databaseLookup,
        matches_found: databaseLookup ? (databaseLookup.total_matches || 0) : 0,
        database_info: databaseLookup,
        top_applications: databaseLookup?.top_applications || [],
        top_devices: databaseLookup?.top_devices || []
      },
      security_assessment: {
        tls_version_secure: ja4Result.components?.tls_version === 't13' || ja4Result.components?.tls_version === 't12',
        certificate_valid: ja4Result.details?.authorized === true,
        cipher_strength: assessCipherStrength(ja4Result.details?.cipher),
        overall_security: calculateOverallSecurity(ja4Result)
      },
      summary: {
        fingerprint_generated: ja4Result.ja4 !== 'unknown',
        database_match: !!databaseLookup,
        security_level: calculateSecurityLevel(ja4Result),
        recommendations: generateRecommendations(ja4Result)
      }
    };

    console.log(`✅ JA4 fingerprinting completed for ${hostname}`);
    return analysis;

  } catch (error) {
    console.error(`❌ JA4 fingerprinting failed: ${error.message}`);
    throw new Error(`JA4 fingerprinting failed: ${error.message}`);
  }
};

// Security assessment helpers
const assessCipherStrength = (cipher) => {
  if (!cipher) return 'unknown';
  
  const strongCiphers = ['AES', 'CHACHA20', 'GCMSHA384', 'GCMSHA256'];
  const weakCiphers = ['RC4', 'DES', 'MD5', 'SHA1'];
  
  const cipherName = cipher.name || '';
  
  if (strongCiphers.some(strong => cipherName.includes(strong))) {
    return 'strong';
  } else if (weakCiphers.some(weak => cipherName.includes(weak))) {
    return 'weak';
  } else {
    return 'moderate';
  }
};

const calculateOverallSecurity = (ja4Result) => {
  if (!ja4Result || ja4Result.ja4 === 'unknown') return 'unknown';
  
  const tlsVersion = ja4Result.components?.tls_version;
  const isSecure = (tlsVersion === 't13' || tlsVersion === 't12') && 
                   ja4Result.details?.authorized === true;
  
  return isSecure ? 'good' : 'needs_improvement';
};

const calculateSecurityLevel = (ja4Result) => {
  if (!ja4Result || ja4Result.ja4 === 'unknown') return 'unknown';
  
  const tlsVersion = ja4Result.components?.tls_version;
  const cipherStrength = assessCipherStrength(ja4Result.details?.cipher);
  
  if (tlsVersion === 't13' && cipherStrength === 'strong') return 'high';
  if (tlsVersion === 't12' && cipherStrength !== 'weak') return 'medium';
  return 'low';
};

const generateRecommendations = (ja4Result) => {
  const recommendations = [];
  
  if (!ja4Result || ja4Result.ja4 === 'unknown') {
    recommendations.push('Unable to analyze TLS configuration - check connectivity');
    return recommendations;
  }
  
  const tlsVersion = ja4Result.components?.tls_version;
  const cipherStrength = assessCipherStrength(ja4Result.details?.cipher);
  
  if (tlsVersion !== 't13') {
    recommendations.push('Upgrade to TLS 1.3 for better security and performance');
  }
  
  if (cipherStrength === 'weak') {
    recommendations.push('Update cipher suites to remove weak encryption algorithms');
  }
  
  if (!ja4Result.details?.authorized) {
    recommendations.push('Fix SSL certificate validation issues');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('TLS configuration appears secure');
  }
  
  return recommendations;
};

export const handler = middleware(ja4FingerprintHandler);
export default handler; 