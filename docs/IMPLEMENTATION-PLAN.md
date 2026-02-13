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

- [x] Create SocketContext provider
- [x] Build useWebSocket hook
- [x] Build RequestLogPanel (sidebar)
- [x] Build RequestLogItem component
- [x] Build RequestDetails modal
- [x] Create useRequestLog hook

## Phase 5: Faker.js Integration

- [x] Implement faker route handlers (`POST /preview`, `GET /methods`)
- [x] Wire up fakerRouter in server (`/api/faker`)
- [x] Create `FAKER_TEMPLATE_CATEGORIES` constant (5 categories)
- [x] Add `FAKER_METHODS` URL + `fakerApi.methods()` to API client
- [x] Enhance ResponseEditor with template picker (collapsible grid, cursor insertion)
- [x] Add live preview button (calls `/api/faker/preview`, shows generated output)
- [x] Add responsive CSS for template grid (1/2/3 columns) and preview panel

## Phase 6: API Tester Feature

- [x] Install React Router, add client-side routing (`/` and `/tester`)
- [x] Update Header with NavLink for active route highlighting
- [x] Create server-side proxy endpoint (`POST /api/proxy`)
- [x] Add PROXY constant + proxyApi helper to API client
- [x] Build RequestForm (method, URL, body, send button)
- [x] Build HeadersEditor (key-value pairs, presets)
- [x] Build ResponseViewer (status badge, body/headers tabs, formatted JSON)
- [x] Create useApiTester hook (state management + sendRequest placeholder)
- [x] Build TesterPage (two-column desktop layout)

## Phase 7: Polish & Deploy

- [x] Toast notification system (success/error/info feedback on CRUD actions)
- [x] Error boundary with crash recovery fallback UI
- [x] Endpoint import/export (JSON file download/upload)
- [x] Retry button on endpoint list error state
- [x] Mobile touch target refinements (44px min)
- [x] Full-screen modals on mobile, card-style at 768px+
- [x] Responsive HeadersEditor (stacked on mobile, grid at 768px+)
- [x] Responsive RequestDetails (single-column grid on mobile)
- [x] Update documentation

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
