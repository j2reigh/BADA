# BADA - Operating Pattern Assessment Platform

## Overview

BADA is a self-discovery web application that combines psychological assessments with traditional Korean astrology (Saju/Four Pillars). Users complete an 8-question Operating Pattern survey, provide birth details, and receive personalized insights generated via AI. The platform features an ocean-themed design aesthetic with soft blues and modern typography.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom ocean-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints defined in shared/routes.ts
- **Validation**: Zod schemas for request/response validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Flow
1. Survey answers collected step-by-step in React state
2. Scoring calculated client-side using `lib/scoring.ts` algorithms
3. Results submitted to `/api/survey/submit` endpoint
4. Data persisted to PostgreSQL via Drizzle ORM
5. Birth pattern data used for Saju calculations via `lunar-typescript` library

### Saju (Four Pillars) System
- **Calculator**: `lib/saju_calculator.ts` converts birth datetime to traditional Korean astrology pillars
- **Time Utils**: `lib/time_utils.ts` handles DST correction using Luxon for international birthplaces before converting to KST
- **Knowledge Base**: `lib/saju_constants.ts` maps Chinese characters to English archetypes
- **Interpretation**: `lib/saju_knowledge.ts` contains Five Elements and Ten Gods interaction patterns
- **AI Integration**: `lib/gemini_client.ts` generates personalized reports using Google Generative AI

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route pages (Landing, Survey, Results)
    hooks/        # Custom React hooks
    lib/          # Client utilities (scoring, query client)
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database operations
  db.ts           # Drizzle database connection
shared/           # Shared between client/server
  schema.ts       # Drizzle table definitions
  routes.ts       # API contract with Zod schemas
lib/              # Core business logic
  saju_*.ts       # Saju calculation and interpretation
  gemini_client.ts # AI report generation
  photon_client.ts # City geocoding for birth location
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store for survey results
- **Drizzle ORM**: Type-safe database queries with automatic migrations via `drizzle-kit push`

### AI Services
- **Google Generative AI (Gemini)**: Generates personalized Saju interpretation reports
- **API Key**: Stored in `GEMINI_API_KEY` environment secret

### Geocoding
- **Photon API** (komoot.io): City autocomplete for birth location input
- **geo-tz**: Calculates timezone from geographic coordinates

### Astrology Calculation
- **lunar-typescript**: Chinese calendar and BaZi (Eight Characters) calculation library for Saju pillars
- **Luxon**: DateTime library for accurate historical DST detection and timezone conversion

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google AI API key for report generation