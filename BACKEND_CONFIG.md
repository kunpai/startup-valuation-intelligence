# Backend Configuration Guide

## Environment Variables Required

Create a `.env` file in the project root with the following variables:

### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/gqi
```

### Session Configuration
```bash
SESSION_SECRET=your-session-secret-change-this-in-production
```

### OpenAI Configuration (for Mira AI Assistant)
```bash
AI_INTEGRATIONS_OPENAI_API_KEY=your-openai-api-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

### Harmonic API (for Market Comparables)
```bash
HARMONIC_API_KEY=your-harmonic-api-key-here
```

### Replit Authentication (if using Replit)
```bash
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
```

### Server Configuration
```bash
PORT=5000
NODE_ENV=development
```

## Database Setup

1. Ensure PostgreSQL is installed and running
2. Create a database named `gqi`
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Running the Backend

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Logout

### Companies
- `GET /api/companies` - Get all companies for user
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company
- `PATCH /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Valuation Snapshots
- `GET /api/companies/:companyId/snapshots` - Get snapshots
- `GET /api/snapshots/:id` - Get single snapshot
- `POST /api/snapshots` - Create snapshot
- `DELETE /api/snapshots/:id` - Delete snapshot

### Scenarios
- `GET /api/companies/:companyId/scenarios` - Get scenarios
- `POST /api/companies/:companyId/scenarios` - Create scenario
- `PATCH /api/companies/:companyId/scenarios/:id` - Update scenario
- `DELETE /api/companies/:companyId/scenarios/:id` - Delete scenario

### Comparables
- `GET /api/companies/:companyId/comparables` - Get comparables
- `POST /api/companies/:companyId/comparables` - Create comparable
- `DELETE /api/companies/:companyId/comparables/:id` - Delete comparable

### Valuation Calculation
- `POST /api/calculate-valuation` - Calculate valuation

### Team Management
- `GET /api/companies/:companyId/team` - Get team members
- `POST /api/companies/:companyId/invites` - Send invite
- `DELETE /api/companies/:companyId/invites/:inviteId` - Cancel invite
- `GET /api/invites/pending` - Get pending invites for user
- `POST /api/invites/:token/accept` - Accept invite
- `DELETE /api/companies/:companyId/team/:memberId` - Remove member

### Market Comparables (Harmonic API)
- `GET /api/harmonic/search` - Search comparable companies
- `GET /api/harmonic/company` - Lookup company by domain
- `GET /api/harmonic/search-by-name` - Search companies by name

### Mira AI Assistant
- `POST /api/mira/chat` - Chat with Mira
- `POST /api/mira/quick-insight` - Get quick insight

### Realtime Collaboration (WebSocket)
- WebSocket endpoint: `/socket.io`
- Events:
  - `join:room` - Join collaboration room
  - `presence:editing` - Update editing status
  - `presence:cursor` - Update cursor position
  - `valuation:update` - Broadcast valuation changes

## Fixed Issues

1. **Mira.ts Authentication Bug**: Fixed missing `userId` parameter in `storage.getCompany()` call
2. **Added Authentication Middleware**: All Mira routes now require authentication
3. **Environment Variables**: Properly documented all required environment variables
4. **API Keys**: Configured OpenAI and Harmonic API keys

## Testing

All endpoints require authentication. Use the `/api/login` endpoint to authenticate first.
