# Dr. Meysam Zanjirzan Hosseini Academic & Publishing Platform

An enterprise-grade, high-concurrency educational platform, digital bookstore, and DRM-protected audio lecture portal for **Dr. Meysam Zanjirzan Hosseini** (Senior Scholar of Islamic Philosophy, Transcendental Theosophy, and Illuminationist Philosophy).

## Architecture

- **Backend:** FastAPI (Python 3.11+) with Clean Layered Architecture (Controllers -> Services -> Schemas -> Core).
- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS + Lucide Icons.
- **Security:** AES-128 DRM stream protection, forensic dynamic watermarking, JWT sessions.
- **E-Commerce:** Iran Post 24-digit tracking, Shaparak gateway integration, Fidibo/Taaghche e-reader.

## Quick Start

### Backend:
`ash
py -m uvicorn backend.app.main:app --port 8000 --reload
`
Interactive Swagger Documentation: http://127.0.0.1:8000/docs

### Frontend:
`ash
cd frontend
npm run build
npm start
`
Web Application: http://localhost:3000
