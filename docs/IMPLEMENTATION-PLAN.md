# Implementation Plan

## Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Frontend  | React 19, Vite, React Router 7                    |
| Styling   | Vanilla CSS (mobile-first, CSS custom properties) |
| Backend   | Node.js, Express                                  |
| Real-time | Socket.io                                         |
| Fake Data | @faker-js/faker                                   |

## Phase 0: Project Folder & Documentation Setup

- [x] Create `api-playground/` folder in Portfolio directory
- [x] Create `api-playground/docs/` folder
- [x] Create `docs/PRD.md` with Product Requirements Document
- [x] Create `docs/IMPLEMENTATION-PLAN.md` with technical plan
- [x] Create `docs/ARCHITECTURE.md` with system design details
- [x] Initialize git repository on feature branch

## Phase 1: Project Setup

- [x] Initialize monorepo with root package.json (npm workspaces)
- [x] Create client with `npm create vite@latest client -- --template react`
- [x] Create server with Express + Socket.io
- [x] Configure ESLint flat config + Prettier
- [x] Set up CSS structure with design tokens
- [x] Create Layout and Header components
- [x] Set up environment variables (.env)

## Phase 2: Backend Core

- [x] Implement `endpointStore.js` (in-memory CRUD)
- [x] Create `/api/endpoints` routes
- [x] Implement `mockRouter.js` (dynamic route registration)
- [x] Add request capture middleware
- [x] Set up Socket.io with events
- [x] Add CORS middleware for Vercel frontend

## Phase 3: Endpoint Management UI

- [x] Build EndpointCard component
- [x] Build EndpointList component
- [x] Build EndpointBuilder form (create/edit)
- [x] Create MethodBadge component (color-coded)
- [x] Build ResponseEditor (JSON editing)
- [x] Create useEndpoints hook
- [x] Wire up to backend API

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
