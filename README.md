# Web Application Security Testing

This repository contains tools and configurations for testing the security and performance of the Bitrab web application.

## Security Testing with OWASP ZAP

OWASP ZAP (Zed Attack Proxy) is an open-source web application security scanner. It helps identify security vulnerabilities in web applications.

### Automated Security Scans

Three types of security scans are configured in our GitHub Actions workflows:

1. **Baseline Scan** - Passive scanning that doesn't perform active attacks
   - Runs weekly on a schedule
   - Identifies basic security issues without actively exploiting them
   - Configured to detect common OWASP Top 10 vulnerabilities

2. **Full Scan** - Comprehensive scan that includes active attacks
   - Only runs when manually triggered with the "full_scan" option
   - More thorough but potentially more disruptive
   - Tests for XSS, SQL injection, CSRF, and other critical vulnerabilities
   - Uses enhanced configuration for deeper testing

3. **API Scan** - Specialized scan for testing API endpoints
   - Only runs when manually triggered with the "full_scan" option
   - Focuses on security issues specific to REST APIs
   - Targets the PHP backend endpoints

### OWASP ZAP Configuration

The ZAP scans are configured to test for the following vulnerabilities:

- Cross-Site Scripting (XSS)
- SQL Injection
- Cross-Site Request Forgery (CSRF)
- Path Traversal
- Server-Side Inclusion
- Authentication Issues
- Session Management Vulnerabilities
- Information Disclosure
- Insecure Headers

Configuration files:
- `.github/workflows/zap-rules.tsv` - Defines rules for vulnerability detection
- `.github/zap-full-scan-config.yml` - Advanced settings for the full scan

### Running Security Scans Manually

To run a security scan manually:
1. Go to the "Actions" tab in GitHub
2. Select the "OWASP ZAP Security Scan" workflow
3. Click "Run workflow"
4. Choose whether to run both baseline and full scans by toggling the "Run full scan" option

### Understanding Security Scan Results

After a scan completes, it will:
- Create a GitHub issue with the scan report
- Provide detailed findings categorized by risk level
- Generate artifacts with the full scan results
- Offer remediation advice for each vulnerability found

## Performance Testing with k6

This repository also includes k6 test scripts for performance testing:

- **advanced_load_profile.js** - Combined load testing script with:
  - Normal load testing (100 VUs)
  - Stress testing (500 VUs) 
  - Spike testing (up to 1500 VUs)

### Running Performance Tests

Performance tests can be executed both locally and via GitHub Actions:

```bash
# To run locally:
k6 run advanced_load_profile.js

# To modify test parameters:
k6 run --vus 50 --duration 60s advanced_load_profile.js
```

## Security Best Practices

When addressing security vulnerabilities:

1. Always prioritize fixing high-risk issues first
2. Test fixes in a development environment before deploying to production
3. Conduct regular security scans to catch new vulnerabilities
4. Keep dependencies and libraries up to date
5. Follow the OWASP Top 10 security recommendations

## References

- [OWASP ZAP Documentation](https://www.zaproxy.org/getting-started/)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [k6 Documentation](https://k6.io/docs/)