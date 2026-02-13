# System Architecture

## Project Structure

```
api-playground/
├── docs/                      # Project documentation
│   ├── PRD.md                 # Product Requirements Document
│   ├── IMPLEMENTATION-PLAN.md # Technical implementation plan
│   └── ARCHITECTURE.md        # System design & data models
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── endpoints/     # Endpoint management
│   │   │   ├── request-log/   # Real-time logging
│   │   │   └── tester/        # API tester
│   │   ├── shared/            # Reusable components (ErrorBoundary, ToastProvider)
│   │   ├── lib/               # API client, socket setup
│   │   └── css/               # Layered CSS structure
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Request capture, CORS
│   └── package.json
│
├── README.md                  # Project overview
├── CLAUDE.md                  # Project-specific guidance
└── package.json               # Root (workspaces)
```

## Data Models

### Endpoint

```javascript
{
  id: "uuid",
  name: "Get Users",
  method: "GET",              // GET, POST, PUT, PATCH, DELETE
  path: "/users",             // Supports :params
  enabled: true,
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { "name": "{{faker.person.fullName()}}" },
    delay: 0                  // ms
  }
}
```

### Request Log

```javascript
{
  id: "uuid",
  timestamp: "2024-01-15T10:30:00Z",
  method: "GET",
  path: "/mock/users",
  headers: { ... },
  body: null,
  query: { ... },
  response: { status: 200, body: { ... } },
  duration: 150,              // ms
  endpointId: "uuid"          // matched endpoint
}
```

## API Design

### Management API (`/api/*`)

| Method | Endpoint                  | Description                   |
| ------ | ------------------------- | ----------------------------- |
| GET    | /api/endpoints            | List all endpoints            |
| POST   | /api/endpoints            | Create endpoint               |
| PUT    | /api/endpoints/:id        | Update endpoint               |
| DELETE | /api/endpoints/:id        | Delete endpoint               |
| POST   | /api/endpoints/:id/toggle | Enable/disable                |
| POST   | /api/endpoints/import     | Bulk import endpoints         |
| POST   | /api/faker/preview        | Preview Faker template output |
| GET    | /api/faker/methods        | List available Faker methods  |
| POST   | /api/proxy                | Forward request to external URL |

### Mock Server (`/mock/*`)

All user-created endpoints mounted here.

- User creates `GET /users` -> accessible at `GET /mock/users`
- User creates `POST /orders/:id` -> accessible at `POST /mock/orders/:id`

## WebSocket Events

| Event              | Direction        | Payload                   |
| ------------------ | ---------------- | ------------------------- |
| `request:new`      | Server -> Client | Request log entry         |
| `request:complete` | Server -> Client | Updated log with response |
| `endpoints:sync`   | Server -> Client | Full endpoint list        |
| `subscribe:logs`   | Client -> Server | Start receiving logs      |

## Request Log Feature Architecture

The request-log feature follows a layered architecture:

```
lib/socket.js                    Singleton socket.io-client instance (lazy init)
    ↓
context/socketContext.js         React Context object (separate file for fast refresh)
context/SocketContext.jsx        SocketProvider — manages connect/disconnect lifecycle
    ↓
useWebSocket.js                  Thin hook consuming SocketContext
useRequestLog.js                 Reducer-based state: logs array, selection, clear
    ↓
components/RequestLogPanel.jsx   Sidebar with live feed, connection indicator
components/RequestLogItem.jsx    Single row: method badge, path, status, duration
components/RequestDetails.jsx    Modal with full request/response inspection
```

**Two-phase request lifecycle**: The server emits `request:new` (pending) when a mock endpoint is hit, then `request:complete` (with response and duration) after the response is sent. The client reducer matches these by request `id`. If `complete` arrives before `new` (race condition), it's inserted directly as a completed entry.

**Layout strategy**: Mobile-first. On small screens the log panel is a slide-up overlay triggered by a floating action button. At 1024px+ it becomes a static sidebar column using `--sidebar-width`.

## Faker Integration Architecture

The faker feature has two sides: a backend processing pipeline (Phase 2) and a frontend template picker with live preview (Phase 5).

```
Backend (already existed):
  fakerService.js                 processTemplate() — regex-based {{faker.x.y()}} replacement
      ↓                           processBody() — recursive object/array/string processing
  mockRouter.js                   Calls processBody() when serving mock responses

Backend (Phase 5):
  routes/faker.js                 POST /preview — accepts string or object, returns processed result
                                  GET /methods — introspects faker modules, returns method catalog

Frontend (Phase 5):
  constants/FAKER_TEMPLATES.js    Curated template categories for the picker UI
      ↓
  ResponseEditor.jsx              Template picker panel (collapsible grid of clickable chips)
                                  Cursor-position insertion via textareaRef
                                  Preview button → calls fakerApi.preview() → shows generated output
```

**Server-side preview**: The preview sends templates to the server rather than running Faker client-side. This guarantees the preview matches exactly what mock endpoints will return, since both use the same `processBody()` code path.

**Cursor insertion**: Clicking a template chip inserts the template string at the textarea's current cursor position using `selectionStart`/`selectionEnd`, then restores focus with `requestAnimationFrame` to ensure React's controlled value update completes first.

## API Tester Architecture

The tester feature provides a built-in Postman-like interface for sending HTTP requests and viewing responses.

```
Client-side routing (React Router 7):
  App.jsx                           BrowserRouter → Routes → / | /tester
  Header.jsx                        NavLink with isActive callback for route highlighting

Proxy route:
  server/src/routes/proxy.js        POST /api/proxy — forwards requests to external URLs
                                    Uses native fetch, 10s timeout, returns normalized response

Hook + components:
  useApiTester.js                   State: method, url, headers[], body, response, error, isLoading
      ↓                             sendRequest() — local mock = direct fetch, external = proxy
  TesterPage.jsx                    Page composition — request form + response viewer
  RequestForm.jsx                   Method select + URL input + body textarea + send button
  HeadersEditor.jsx                 Dynamic key-value rows with add/remove + preset buttons
  ResponseViewer.jsx                4 states: empty, loading, error, success (status + tabs)
```

**Local vs. proxy routing**: When the target URL starts with `MOCK_BASE` (e.g., `http://localhost:3001/mock/...`), the tester fetches directly from the browser — no proxy needed since both client and server share the same origin in development. External URLs are forwarded through `POST /api/proxy` to avoid CORS restrictions.

**Response normalization**: Both paths produce the same shape: `{ status, statusText, headers, data, timing }`. The proxy endpoint measures timing server-side; direct fetch measures it client-side via `Date.now()` before/after.

## Critical Files

| File                                                           | Purpose                               |
| -------------------------------------------------------------- | ------------------------------------- |
| `server/src/services/mockRouter.js`                            | Dynamic Express route registration    |
| `server/src/services/fakerService.js`                          | Template parsing + Faker generation   |
| `server/src/socket.js`                                         | WebSocket setup and events            |
| `client/src/features/endpoints/components/EndpointBuilder.jsx` | Main endpoint creation form           |
| `client/src/features/request-log/context/SocketContext.jsx`    | SocketProvider — connection lifecycle  |
| `client/src/features/request-log/context/socketContext.js`     | SocketContext object (fast refresh)    |
| `client/src/features/request-log/useRequestLog.js`             | Request log state reducer + hook      |
| `client/src/lib/socket.js`                                     | Singleton socket.io-client factory    |
| `client/src/constants/FAKER_TEMPLATES.js`                      | Template categories for picker UI     |
| `server/src/routes/faker.js`                                   | Faker preview + methods API routes    |
| `server/src/routes/proxy.js`                                   | Proxy for external API requests       |
| `client/src/features/tester/useApiTester.js`                   | Tester hook — state + request logic   |
| `client/src/features/tester/components/TesterPage.jsx`         | API Tester page composition           |
| `client/src/shared/components/ToastProvider.jsx`               | Toast notification state + UI         |
| `client/src/shared/components/useToast.js`                     | Toast consumer hook                   |
| `client/src/shared/components/ErrorBoundary.jsx`               | Crash recovery fallback UI            |
| `client/src/features/endpoints/endpointIO.js`                  | Import/export utilities               |
| `client/src/css/tokens.css`                                    | Design tokens (CSS custom properties) |

## Import/Export Architecture

The import/export feature allows users to share endpoint collections as portable JSON files.

```
Export flow (client-only):
  DashboardPage.handleExport()
      ↓
  endpointIO.exportEndpoints(endpoints)   Strips id/createdAt/updatedAt
      ↓                                   Creates Blob + createObjectURL
  Browser downloads .json file            No server roundtrip needed

Import flow (client → server):
  EndpointList <input type="file">
      ↓
  DashboardPage.handleImport(file)
      ↓
  endpointIO.validateImportData(data)     Client-side shape validation
      ↓
  endpointsApi.import(endpoints)          POST /api/endpoints/import
      ↓
  Server creates each via createEndpoint  Returns { created[], errors[] }
      ↓
  fetchEndpoints() refreshes list         Toast shows result
```

**Validation boundary**: The client validates the file shape (`{ endpoints: [...] }`), while the server validates individual endpoint fields (name, method, path) through the existing `createEndpoint` service. This avoids duplicating validation logic that could drift out of sync.

## Toast Notification Architecture

```
shared/components/toastContext.js     Context object (separate file for fast refresh)
shared/components/ToastProvider.jsx   useReducer for toast array, auto-dismiss via setTimeout
shared/components/useToast.js         Consumer hook — returns { addToast(type, message) }
```

**Provider placement**: `ToastProvider` sits inside `SocketProvider` but outside `Layout`, so toasts render above all content (fixed position, z-index 1000). The toast container uses `aria-live="polite"` for screen reader announcements.
