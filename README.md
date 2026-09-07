# KenyaWatch AI

**Procurement Accountability Platform for Kenya**

A modern, full-stack civic-tech platform that makes Kenyan government procurement transparent and accountable through AI-powered risk detection, ghost project monitoring, and anonymous citizen reporting.

## Features

- **Searchable Procurement Database**: Filter contracts across all 47 counties by sector, year, risk level, and data type with AI-powered risk scoring
- **Contract Detail View**: Click any contract to see full details including value, supplier, scope, risk flags, and source links
- **Ghost Project Detection**: Identify infrastructure projects funded but never built, with documented cases from official sources
- **Anonymous Citizen Reporting**: Safe whistleblower channel for reporting suspected corruption across all 47 counties
- **AI Investigator Chat**: Natural language queries about procurement data powered by Google Gemini
- **Transparent Data Badging**: Every record shows its source (documented, live sync, manual scan, or reference)
- **Risk Scoring Engine**: AI-powered analysis detecting single-source bids, value anomalies, vague scopes, and placeholder suppliers
- **OCDS Data Sync**: Pulls real procurement data from Open Contracting Data Standard feeds

## Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui components + Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Rate Limiting
- **AI**: Google Gemini 2.5 Flash
- **Deployment**: Render

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Google Gemini API key (for AI chat)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ADMIN_KEY` | Secret key for admin endpoints | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes (for AI) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Yes |
| `PORT` | Server port (default: 3000) | No |

### Frontend (.env.local)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## Deployment

### Backend (Render)
1. Push to GitHub
2. Connect repository to Render
3. Set environment variables in Render Dashboard
4. Deploy will auto-trigger

### Frontend (Vercel)
1. Push to GitHub
2. Connect repository to Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy will auto-trigger

## Data Integrity

Every record has a `data_type` badge:
- **Documented**: Real, source-cited cases from Auditor-General reports, media investigations, or oversight bodies
- **Live Sync**: Programmatic data from OCDS (Open Contracting Data Standard) feeds
- **Manual Scan**: User-submitted reports that need verification
- **Reference**: Synthetic illustrative data for demonstration (NOT real cases)

**Never present reference data as fact.** This is core to the platform's credibility.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/contracts` | List contracts with filters |
| GET | `/api/contracts/meta` | Filter metadata |
| GET | `/api/contracts/:id` | Get contract details |
| GET | `/api/contracts/search` | Search contracts |
| POST | `/api/contracts/scan` | Score a contract |
| GET | `/api/ghost-projects` | List ghost projects |
| POST | `/api/reports` | Submit corruption report |
| POST | `/api/ai/chat` | AI Investigator chat |
| POST | `/api/sync/ocds` | Trigger OCDS sync |
| GET | `/api/sync/status` | View sync logs |

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Open Contracting Partnership](https://www.open-contracting.org/) for OCDS standards
- [Auditor-General of Kenya](https://www.ago.go.ke/) for oversight reports
- [PPRA](https://ppra.go.ke/) for procurement data
