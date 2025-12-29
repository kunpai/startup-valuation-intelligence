# Startup Valuation Intelligence Dashboard (SVI)

## Overview

A full-stack web application that serves as a valuation intelligence calculator for startup founders. The platform helps founders estimate and communicate their startup's indicative valuation to investors by blending quantitative financial data with qualitative scoring methodologies.

The app provides multiple valuation approaches (VC Method, Scorecard Method, Market Comparables, DCF), scenario simulation, market comparable analysis, and generates investor-ready reports and deal room materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built with Vite
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: React Context API (ValuationContext) for global valuation state, TanStack Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables, dark mode default
- **Charts**: Recharts for data visualization (area charts, scatter plots, radar charts, pie charts)
- **Animations**: Framer Motion for page transitions and micro-interactions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas (via drizzle-zod) for request validation

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Core Tables**:
  - `users` - Authentication (prepared for future use)
  - `companies` - Startup profiles with sector, stage, region
  - `valuation_snapshots` - Point-in-time valuation data with financials and scores
  - `scenarios` - What-if simulation configurations

### Build System
- **Development**: Vite dev server with HMR, Express backend with tsx
- **Production**: esbuild bundles server, Vite builds client to `dist/public`
- **Path Aliases**: `@/` for client, `@shared/` for shared code, `@assets/` for attached assets

### Key Design Patterns
- **Shared Schema**: Database schemas and types defined once in `shared/schema.ts`, used by both frontend and backend
- **Demo Mode**: Context supports demo mode with pre-populated data for showcase purposes
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations for testability
- **Guided Onboarding**: Multi-step onboarding flow collects company data before dashboard access

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### UI/Component Libraries
- Radix UI primitives (dialogs, dropdowns, sliders, tabs, etc.)
- shadcn/ui component system
- Lucide React for icons
- Embla Carousel for carousel components
- Vaul for drawer components
- cmdk for command palette

### Data & Validation
- Zod for schema validation
- drizzle-zod for generating Zod schemas from Drizzle tables
- date-fns for date formatting

### Development Tools
- Replit-specific Vite plugins for dev experience (cartographer, dev-banner, error overlay)
- Custom meta-images plugin for OpenGraph tags