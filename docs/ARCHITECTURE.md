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
│   │   ├── shared/            # Reusable components
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
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/endpoints | List all endpoints |
| POST | /api/endpoints | Create endpoint |
| PUT | /api/endpoints/:id | Update endpoint |
| DELETE | /api/endpoints/:id | Delete endpoint |
| POST | /api/endpoints/:id/toggle | Enable/disable |
| POST | /api/faker/preview | Preview Faker template output |

### Mock Server (`/mock/*`)
All user-created endpoints mounted here.
- User creates `GET /users` -> accessible at `GET /mock/users`
- User creates `POST /orders/:id` -> accessible at `POST /mock/orders/:id`

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `request:new` | Server -> Client | Request log entry |
| `request:complete` | Server -> Client | Updated log with response |
| `endpoints:sync` | Server -> Client | Full endpoint list |
| `subscribe:logs` | Client -> Server | Start receiving logs |

## Critical Files

| File | Purpose |
|------|---------|
| `server/src/services/mockRouter.js` | Dynamic Express route registration |
| `server/src/services/fakerService.js` | Template parsing + Faker generation |
| `server/src/socket.js` | WebSocket setup and events |
| `client/src/features/endpoints/components/EndpointBuilder.jsx` | Main endpoint creation form |
| `client/src/features/request-log/context/SocketContext.jsx` | WebSocket connection management |
| `client/src/css/index.css` | Design tokens (CSS custom properties) |
