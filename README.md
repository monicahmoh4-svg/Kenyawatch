# KenyaWatch AI

**Procurement Accountability Platform for Kenya**

A modern, full-stack civic-tech platform that makes Kenyan government procurement transparent and accountable through AI-powered risk detection, ghost project monitoring, and anonymous citizen reporting.

## Features
- **Searchable Procurement Database**: Filter contracts across all 47 counties with AI risk scoring.
- **Ghost Project Detection**: Identify infrastructure projects funded but never built.
- **Anonymous Citizen Reporting**: Safe channel for whistleblowers.
- **AI Investigator Chat**: Natural language queries about procurement data.
- **Transparent Data Badging**: Every record shows its source (documented, live sync, manual scan, or reference).

## Architecture
### Frontend
- Next.js 14 (App Router)
- shadcn/ui components + Tailwind CSS
- Deployment: Vercel

### Backend
- Node.js + Express
- PostgreSQL
- Deployment: Render

## Quick Start
1. `cd kenyawatch-ai/backend && npm install`
2. `cd ../frontend && npm install`
3. Set up PostgreSQL and configure `.env` files.
4. Run `npm run dev` in both directories.

## Deployment
- **Backend**: Push to GitHub, connect to Render, set env vars (`DATABASE_URL`, `ADMIN_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`).
- **Frontend**: Push to GitHub, connect to Vercel, set `NEXT_PUBLIC_API_URL` to your Render backend URL.

## Data Integrity
Every record has a `data_type`:
- `documented`: Real, source-cited cases.
- `live_sync`: Programmatic OCDS feed.
- `manual_scan`: User-submitted.
- `reference`: Synthetic illustrative data (NOT real).

**Never present reference data as fact.** This is core to the platform's credibility.
"# Kenyawatch" 
