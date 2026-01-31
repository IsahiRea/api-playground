# Implementation Plan

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router 7 |
| Styling | Vanilla CSS (mobile-first, CSS custom properties) |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Fake Data | @faker-js/faker |

## Phase 0: Project Folder & Documentation Setup
- [x] Create `api-playground/` folder in Portfolio directory
- [x] Create `api-playground/docs/` folder
- [x] Create `docs/PRD.md` with Product Requirements Document
- [x] Create `docs/IMPLEMENTATION-PLAN.md` with technical plan
- [x] Create `docs/ARCHITECTURE.md` with system design details
- [ ] Initialize git repository on feature branch

## Phase 1: Project Setup
- [ ] Initialize monorepo with root package.json (npm workspaces)
- [ ] Create client with `npm create vite@latest client -- --template react`
- [ ] Create server with Express + Socket.io
- [ ] Configure ESLint flat config + Prettier
- [ ] Set up CSS structure with design tokens
- [ ] Create Layout and Header components
- [ ] Set up environment variables (.env)

## Phase 2: Backend Core
- [ ] Implement `endpointStore.js` (in-memory CRUD)
- [ ] Create `/api/endpoints` routes
- [ ] Implement `mockRouter.js` (dynamic route registration)
- [ ] Add request capture middleware
- [ ] Set up Socket.io with events
- [ ] Add CORS middleware for Vercel frontend

## Phase 3: Endpoint Management UI
- [ ] Build EndpointCard component
- [ ] Build EndpointList component
- [ ] Build EndpointBuilder form (create/edit)
- [ ] Create MethodBadge component (color-coded)
- [ ] Build ResponseEditor (JSON editing)
- [ ] Create useEndpoints hook
- [ ] Wire up to backend API

## Phase 4: Real-time Request Logging
- [ ] Create SocketContext provider
- [ ] Build useWebSocket hook
- [ ] Build RequestLogPanel (sidebar)
- [ ] Build RequestLogItem component
- [ ] Build RequestDetails modal
- [ ] Create useRequestLog hook

## Phase 5: Faker.js Integration
- [ ] Implement fakerService on backend
- [ ] Create template parser ({{faker.x.y()}} syntax)
- [ ] Add /api/faker/preview endpoint
- [ ] Add Faker template hints in ResponseEditor
- [ ] Create common templates constants

## Phase 6: API Tester Feature
- [ ] Build RequestForm (method, URL, headers, body)
- [ ] Build HeadersEditor (key-value pairs)
- [ ] Build ResponseViewer (formatted JSON)
- [ ] Create useApiTester hook
- [ ] Build TesterPage

## Phase 7: Polish & Deploy
- [ ] Add loading states and error handling
- [ ] Implement endpoint import/export (JSON)
- [ ] Mobile-responsive refinements
- [ ] Write README

## Commands
```bash
# Development
cd api-playground
npm install           # Install all dependencies
npm run dev           # Start both client and server

# Client only
cd client && npm run dev    # http://localhost:5173

# Server only
cd server && npm run dev    # http://localhost:3001

# Production build
npm run build
```
