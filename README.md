<div align="center">

<svg width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="0.30304" cy="2.42612" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75226" cy="2.42612" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="11.2132" cy="2.42612" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="16.662" cy="2.42783" rx="1.81824" ry="1.81846" fill="white"/>
<ellipse cx="22.1135" cy="2.42622" rx="2.12128" ry="2.12153" fill="white"/>
<ellipse cx="27.5767" cy="2.42461" rx="2.42432" ry="2.42461" fill="white"/>
<ellipse cx="0.30304" cy="7.88511" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75226" cy="7.88511" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="11.2066" cy="7.87476" rx="1.5152" ry="1.51538" fill="white"/>
<ellipse cx="16.662" cy="7.88291" rx="1.81824" ry="1.81846" fill="white"/>
<ellipse cx="22.1135" cy="7.88325" rx="2.12128" ry="2.12153" fill="white"/>
<ellipse cx="27.5783" cy="7.88325" rx="2.12128" ry="2.12153" fill="white"/>
<ellipse cx="0.30304" cy="13.3402" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75226" cy="13.3402" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="11.2122" cy="13.3354" rx="1.21216" ry="1.2123" fill="white"/>
<ellipse cx="16.6715" cy="13.3318" rx="1.5152" ry="1.51538" fill="white"/>
<ellipse cx="22.1229" cy="13.3321" rx="1.81824" ry="1.81846" fill="white"/>
<ellipse cx="27.5721" cy="13.3321" rx="1.81824" ry="1.81846" fill="white"/>
<ellipse cx="0.30304" cy="18.7914" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75452" cy="18.7937" rx="0.606081" ry="0.606152" fill="white"/>
<ellipse cx="11.2138" cy="18.794" rx="0.909121" ry="0.909228" fill="white"/>
<ellipse cx="16.6614" cy="18.7904" rx="1.21216" ry="1.2123" fill="white"/>
<ellipse cx="22.1207" cy="18.7888" rx="1.5152" ry="1.51538" fill="white"/>
<ellipse cx="27.5765" cy="18.7914" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="0.30304" cy="24.2406" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75452" cy="24.2487" rx="0.606081" ry="0.606152" fill="white"/>
<ellipse cx="11.2076" cy="24.2487" rx="0.606081" ry="0.606152" fill="white"/>
<ellipse cx="16.6624" cy="24.2406" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="22.1234" cy="24.2406" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="27.5765" cy="24.2406" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="0.30304" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="5.75226" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="11.2132" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="16.6624" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="22.1234" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
<ellipse cx="27.5765" cy="29.6976" rx="0.30304" ry="0.303076" fill="white"/>
</svg>

# ASET — Academic Safety and Evidencing Truth

### AI-Powered Scientific Claim Verification Platform

[![Status](https://img.shields.io/badge/Status-Production-success)](https://d3tdxezxcen5k0.cloudfront.net)
[![Papers](https://img.shields.io/badge/Papers-1.2M+-blue)](https://d3tdxezxcen5k0.cloudfront.net)
[![Domains](https://img.shields.io/badge/Domains-8-purple)](https://d3tdxezxcen5k0.cloudfront.net)
[![AWS](https://img.shields.io/badge/Deployed_on-AWS-orange)](https://d3tdxezxcen5k0.cloudfront.net)
[![Hackathon](https://img.shields.io/badge/AWS_10K_AIdeas-Top_50_Finalist-gold)](https://builder.aws.com/content/39cMiFMTs7dRujnZnJd6Rw0oqkE)

**Top 50 Finalist — AWS 10,000 AIdeas Hackathon**

[Live App](https://d3tdxezxcen5k0.cloudfront.net) · [AWS Builder Article](https://builder.aws.com/content/39cMiFMTs7dRujnZnJd6Rw0oqkE)

</div>

---

## What is ASET?

ASET stops AI hallucinations and misinformation by verifying scientific claims against 1.2M+ peer-reviewed papers across 8 domains — in real time.

**The problem:** 46% of AI-generated citations are fabricated. Students, teachers, journalists, and content creators unknowingly spread misinformation backed by fake research.

**The solution:** ASET verifies any claim — typed, uploaded, or from a YouTube video — against a pre-indexed database of peer-reviewed papers, returning a trust score and supporting evidence in under 10 seconds.

---

## Features

- **Mode 1 — Single Claim**: Type any scientific claim and verify it instantly
- **Mode 2 — YouTube**: Paste a YouTube URL, ASET extracts the transcript and verifies every factual claim
- **Mode 3 — Document**: Upload a PDF, DOCX, or image — ASET identifies and verifies all claims
- **Self-Growing DB**: When no local papers exist, ASET fetches from arXiv + PubMed and permanently adds them
- **8 Scientific Domains**: Space Science, Biology, Medicine, Chemistry, Physics, CS, Engineering + more
- **1.2M+ Papers**: Pre-indexed with FTS5 for sub-200ms search

---

## Architecture

```
Frontend (React + Vite)          Backend (Node.js + Express)
CloudFront + S3                  AWS App Runner (auto-scaling)
        │                                │
        └──────── HTTPS API ─────────────┘
                                         │
                              Turso SQLite (1.2M papers)
                              FTS5 full-text search
                              Groq LLM (claim verification)
                              arXiv + PubMed (self-growing)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, globe.gl |
| Backend | Node.js, Express |
| Database | Turso (libSQL/SQLite) with FTS5 |
| AI | Groq (llama-3.3-70b-versatile) |
| Deployment | AWS App Runner + S3 + CloudFront |
| Auth | JWT + bcrypt + Email OTP |
| Document Processing | pdf-parse, mammoth, tesseract.js |

---

## Live URLs

- **Frontend**: https://d3tdxezxcen5k0.cloudfront.net
- **Backend API**: https://dhhmp9ef9u.us-east-1.awsapprunner.com
- **Health Check**: https://dhhmp9ef9u.us-east-1.awsapprunner.com/health

---

## Local Development

```bash
# Backend
node backend/server-turso.js

# Frontend
cd "ASET frontend"
npm run dev
```

---

## Database Expansion

To add new domains to the database:

```bash
# Run all domain ingestion (PubMed + arXiv OAI)
node scripts/ingest-all-domains.js

# Migrate new papers to Turso
node scripts/migrate-new-domains.js

# Rebuild FTS index if needed
node scripts/rebuild-fts.js
```

---

## Deployment

```bash
# Build and push backend
docker build -t aset-backend .
docker tag aset-backend:latest <ecr-url>/aset-backend:latest
docker push <ecr-url>/aset-backend:latest
aws apprunner start-deployment --service-arn <arn> --region us-east-1

# Deploy frontend
npm run build  # in ASET frontend/
aws s3 sync "ASET frontend/dist" s3://<bucket> --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

---

## Hackathon

ASET was built for the **AWS 10,000 AIdeas Hackathon** and selected as a **Top 50 Finalist** out of thousands of submissions.

Judged on: Technical Innovation (34%) · Implementation Quality (33%) · Market Impact (33%)

Built by **Om Singh (jayom5797)** · [AWS Builder Profile](https://builder.aws.com/content/39cMiFMTs7dRujnZnJd6Rw0oqkE)
