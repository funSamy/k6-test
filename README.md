# Web Application Security Testing

This repository contains tools and configurations for testing the security and performance of the Bitrab web application.

## Security Testing with OWASP ZAP

OWASP ZAP (Zed Attack Proxy) is an open-source web application security scanner. It helps identify security vulnerabilities in web applications.

### Automated Security Scans

Two types of security scans are configured in our GitHub Actions workflows:

1. **Baseline Scan** - Passive scanning that doesn't perform active attacks
   - Runs weekly on a schedule
   - Identifies basic security issues without actively exploiting them

2. **Full Scan** - Comprehensive scan that includes active attacks
   - Only runs when manually triggered
   - More thorough but potentially more disruptive

### Running Security Scans Manually

To run a security scan manually:
1. Go to the "Actions" tab in GitHub
2. Select the "OWASP ZAP Security Scan" workflow
3. Click "Run workflow"
4. Choose whether to run both baseline and full scans

### Understanding Security Scan Results

After a scan completes, it will:
- Create a GitHub issue with the scan report
- Provide detailed findings categorized by risk level
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