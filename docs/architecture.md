# System Architecture

## Overview

The SEO SOP Repository & Onboarding System follows a modern three-tier architecture:
- **Presentation Layer**: React SPA with Vite
- **Application Layer**: Node.js/Express REST API
- **Data Layer**: PostgreSQL with Sequelize ORM

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│                   (React + Vite SPA)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API Gateway / Load Balancer               │
│                   (nginx/AWS ALB)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Express.js Backend                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services → Models            │  │
│  │  - Authentication (JWT)                              │  │
│  │  - SOP Management                                    │  │
│  │  - Onboarding Workflows                              │  │
│  │  - User Management                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 PostgreSQL Database                         │
│  - Users & Authentication                                   │
│  - SOP Documents & Versions                                 │
│  - Onboarding Modules & Tasks                              │
│  - Progress Tracking                                        │
│  - Activity Logs                                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### SOP Retrieval
1. User requests SOP list → Frontend sends GET to `/api/v1/sops`
2. Auth middleware validates JWT token
3. Controller parses query params (search, category, filters)
4. Service queries database with Sequelize
5. Results transformed and returned as JSON
6. Frontend displays SOPs with React Query caching

### Onboarding Progress Update
1. User marks task complete → Frontend sends PUT to `/api/v1/onboarding/tasks/:id`
2. Auth middleware validates user
3. Controller updates UserTaskProgress record
4. Service recalculates overall progress
5. Response sent to frontend
6. React Query invalidates cache and refetches

## Security Architecture

### Authentication Flow
```
1. User Login → POST /api/v1/auth/login
2. Backend validates credentials (bcrypt)
3. Generate JWT token (7-day expiry)
4. Return token + user data
5. Frontend stores in localStorage (via Zustand persist)
6. All subsequent requests include: Authorization: Bearer <token>
7. Backend middleware verifies token on protected routes
```

### Authorization Layers
- **Route-level**: Middleware checks user.role
- **Resource-level**: Controllers verify ownership
- **Field-level**: Models exclude sensitive data from responses

### Security Measures
- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- CORS configuration
- SQL injection prevention (Sequelize parameterized queries)
- XSS protection (sanitize-html for user content)

## Database Design

### Key Design Decisions

**User Management**
- UUIDs for primary keys (better for distributed systems)
- Self-referential mentor relationship
- Soft delete with `is_active` flag

**SOP Documents**
- Automatic version creation via database trigger
- Array fields for tags (PostgreSQL feature)
- Full-text search index on title + content
- Status workflow: Draft → Published → Archived

**Onboarding System**
- Module-based structure for flexibility
- Task metadata as JSONB (supports quizzes, videos)
- Progress tracking with timestamps
- Composite unique constraint (userId + taskId)

### Scalability Considerations
- Database indexes on frequently queried fields
- Pagination for large result sets
- Caching strategy with React Query (5min stale time)
- Connection pooling (10 max connections)

## Frontend Architecture

### State Management Strategy
- **Zustand**: Global auth state (persisted)
- **React Query**: Server state & caching
- **Component State**: UI-only state (modals, forms)

### Component Hierarchy
```
App
├── Layout (shared navigation)
│   ├── Dashboard
│   ├── SOPRepository
│   │   └── SOPDetail
│   └── OnboardingDashboard
└── Login (public route)
```

### Data Fetching Pattern
- React Query hooks for all API calls
- Automatic retries and caching
- Optimistic updates for better UX
- Background refetching on window focus

## Performance Optimizations

### Backend
- Database query optimization (includes, limits)
- Gzip compression
- Response caching headers
- Async/await for non-blocking I/O

### Frontend
- Code splitting by route
- Lazy loading of components
- Debounced search inputs
- Virtualized lists for large datasets
- Image optimization

## Monitoring & Logging

### Backend Logging
- Winston logger with file rotation
- Log levels: error, warn, info, debug
- Request logging with Morgan
- Activity log table for audit trail

### Error Handling
- Global error handler middleware
- Structured error responses
- Development vs production error details
- Unhandled rejection handling

## Deployment Architecture

### Production Setup
```
┌────────────────┐
│   CloudFlare   │ → CDN & DDoS protection
└────────┬───────┘
         │
┌────────▼───────┐
│   nginx        │ → Reverse proxy + SSL
└────────┬───────┘
         │
    ┌────▼─────┬──────────┐
    │          │          │
┌───▼────┐ ┌──▼─────┐ ┌─▼──────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │ → Load balanced
└───┬────┘ └──┬─────┘ └─┬──────┘
    │         │          │
    └─────────┼──────────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │ → Primary DB
        │  (RDS)     │
        └────────────┘
```

## Future Enhancements

- Real-time notifications (WebSockets)
- Advanced analytics dashboard
- Multi-language support
- SSO integration (OAuth2)
- Mobile app (React Native)
- AI-powered SOP recommendations
- Version diff viewer
- Export to PDF functionality
