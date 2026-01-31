# API Playground & Mock Server

## Product Requirements Document (PRD)

### Overview
A developer tool for API development and testing. Users can visually build mock API endpoints, generate dynamic fake data, and see real-time request logging.

### Problem Statement
Developers face friction when:
- Frontend needs to build against APIs that don't exist yet
- Testing edge cases (errors, timeouts) on real APIs is difficult
- Debugging webhook integrations requires deploying to staging
- Setting up mock servers is tedious and requires code

### Target Users
- Frontend developers waiting on backend APIs
- Backend developers testing integrations
- QA engineers simulating error scenarios
- Developers debugging webhook payloads

### MVP Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Endpoint Builder** | Visual form to create mock endpoints (method, path, status, response body, headers, delay) | P0 |
| **Dynamic Responses** | Faker.js template support for generating realistic fake data | P0 |
| **Request Logging** | Real-time feed of all incoming requests with full details | P0 |
| **API Tester** | Built-in tool to test requests against mock endpoints | P1 |
| **Enable/Disable** | Toggle endpoints on/off without deleting | P1 |
| **Import/Export** | Save and load endpoint configurations as JSON | P2 |

### Out of Scope (v1)
- Public URL tunneling (ngrok-like)
- Team workspaces / collaboration
- OpenAPI/Swagger export
- User authentication
- Persistent storage (uses in-memory for MVP)

### Success Metrics
- User can create a mock endpoint in under 30 seconds
- Request logs appear in real-time (<100ms latency)
- Tool is usable on both desktop and mobile
