# API Playground

**Build mock APIs in seconds. No code required.**

## Why This Exists

Every developer has been here:

- **"The backend isn't ready yet"** — You're building a frontend, but the API you need doesn't exist. You hardcode fake data, then spend hours ripping it out later.

- **"How do I test this error state?"** — Your app needs to handle 500 errors gracefully, but you can't make the real API fail on demand.

- **"The webhook payload looks wrong"** — You're debugging an integration, but you need to deploy to staging just to see what's being sent.

- **"Setting up a mock server is a whole thing"** — You *could* spin up a quick Express server, but that's 30 minutes of boilerplate for something you'll delete tomorrow.

API Playground removes this friction. Point, click, mock.

## What It Does

- **Visual Endpoint Builder** — Create `GET /users`, `POST /orders/:id`, or any endpoint through a simple form. No code.

- **Dynamic Fake Data** — Use Faker.js templates like `{{faker.person.fullName()}}` to generate realistic, randomized responses.

- **Real-time Request Log** — Watch requests hit your mock endpoints live. See headers, body, timing—everything.

- **Built-in API Tester** — Test your mocks without leaving the browser.

## Quick Start

```bash
npm install
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:3001`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite |
| Backend | Node.js, Express, Socket.io |
| Fake Data | @faker-js/faker |

## Architecture

```
api-playground/
├── client/                     # React frontend
│   └── src/
│       ├── features/
│       │   ├── endpoints/      # Endpoint CRUD UI
│       │   ├── request-log/    # Real-time log display
│       │   └── tester/         # API testing tool
│       ├── shared/             # Reusable components
│       ├── lib/                # API client, socket setup
│       └── css/                # Design tokens, base styles
│
└── server/                     # Express backend
    └── src/
        ├── routes/             # /api/* handlers
        ├── services/           # Business logic
        ├── middleware/         # Request capture, CORS
        └── socket.js           # WebSocket events
```

**Two Server Paths:**
- `/api/*` — Management API for creating, updating, deleting endpoints
- `/mock/*` — Where user-created endpoints are mounted and served

**Real-time Flow:**
1. Request hits `/mock/users`
2. Server matches to user-defined endpoint
3. Faker templates in response body are processed
4. Socket.io broadcasts `request:new` event to connected clients
5. Request log updates live in the browser

## Project Status

**In Development** — This is an MVP focused on the core workflow: create endpoint, see requests, iterate fast.

---

Built as a portfolio project to solve a real problem I kept running into.
