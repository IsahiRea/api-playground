# Execution Flows

Step-by-step code path traces through the key operations in API Playground. Each flow follows exact file paths and function names so you can read along in the source. For component relationships, data models, and API surface, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Flow 1: Server Startup

What happens when `npm run dev:server` starts the Express process.

**Entry point:** `server/src/index.js`

```
1. express()                          Create Express app instance
   |
2. createServer(app)                  Wrap in Node http.Server (needed for Socket.io)
   |
3. setupSocket(httpServer)            server/src/socket.js
   |  └─ new Server(httpServer, { cors })
   |  └─ io.on('connection') handler registered
   |     └─ listens for 'subscribe:logs' → socket.join('request-logs')
   |     └─ listens for 'disconnect'
   |
4. app.use(corsMiddleware)            server/src/middleware/cors.js
   |
5. app.use(express.json())            Body parser with MAX_BODY_SIZE limit
   |
6. app.get('/health')                 Health check endpoint
   |
7. Route mounting (in order):
   |  ├─ /api/endpoints               server/src/routes/endpoints.js
   |  ├─ /api/faker                   server/src/routes/faker.js
   |  └─ /api/proxy                   server/src/routes/proxy.js
   |
8. app.use('/mock', ...)              Mock route chain:
   |  ├─ requestCaptureMiddleware     server/src/middleware/requestCapture.js
   |  └─ mockRouterMiddleware         server/src/services/mockRouter.js
   |
9. 404 handler                        Catches unmatched routes
   |
10. Error handler                     err, _req, res, _next signature
    |
11. httpServer.listen(PORT)           Server ready
```

**Side effect at module load:** When `mockRouter.js` is first imported (step 8), the last line calls `rebuildMockRouter()`. Since no endpoints exist yet, this creates an empty `Router()` with only a 404 fallback handler. The mock router is ready to hot-swap later when endpoints are created.

---

## Flow 2: Mock Endpoint Request Lifecycle

What happens when an HTTP request hits a user-created mock endpoint (e.g., `GET /mock/users`).

**Phase A — Request Capture** (`server/src/middleware/requestCapture.js: requestCaptureMiddleware`)

```
1. Generate requestId            randomUUID()
2. Build requestLog object       { id, timestamp, method, path, headers, query, body, status: 'pending' }
   |  ├─ sanitizeHeaders()       Redacts authorization, cookie, x-api-key
   |  └─ truncateBody()          Caps at 10,000 chars, adds _truncated flag
3. emitRequestNew(requestLog)    socket.js → io.to('request-logs').emit('request:new')
4. Monkey-patch response         Store originals: res.json, res.send, res.end
   |  └─ Each patched method calls completeRequest() before the original
   |     └─ completeRequest uses a `completed` flag to prevent double-fire
5. next()                        Hand off to mockRouterMiddleware
```

**Phase B — Route Matching** (`server/src/services/mockRouter.js`)

```
6. mockRouterMiddleware(req, res, next)
   └─ Delegates to current `mockRouter` variable (a plain Express Router)
   └─ Router matches req.method + req.path against registered endpoints
      ├─ Match found → calls createMockHandler(endpoint) result
      └─ No match   → mock 404: { error: 'No mock endpoint found', hint: '...' }
```

**Phase C — Response Generation** (`mockRouter.js: createMockHandler → handler`)

```
7. await delay(response.delay)   Sleep if delay > 0
8. Set custom headers             Object.entries(response.headers).forEach(setHeader)
9. Process body:
   |  ├─ String body → JSON.parse → processBody()     (or processBody raw on parse fail)
   |  └─ Object body → processBody() directly
   |
   |  processBody (fakerService.js):
   |    ├─ String  → processTemplate() — regex replaces {{faker.x.y()}} with faker call
   |    ├─ Array   → map(processBody) recursively
   |    ├─ Object  → entries.map(processBody) recursively
   |    └─ Primitive → pass through unchanged
   |
10. Send response:
    ├─ null/undefined body → res.end()
    ├─ Object body         → res.json(body)
    └─ String body         → res.send(body)
```

**Phase D — Response Interception** (back in `requestCapture.js`)

```
11. Patched res.json/send/end fires → completeRequest(responseBody)
    |  ├─ duration = Date.now() - startTime
    |  ├─ requestLog.status = 'completed'
    |  ├─ requestLog.response = { status, headers, body }
    |  ├─ Push to requestLogs[] circular buffer (max LIMITS.MAX_REQUEST_LOG, shift oldest)
    |  └─ emitRequestComplete(requestLog) → io.to('request-logs').emit('request:complete')
    |
12. Original res method executes   Sends HTTP response to caller
```

**Cross-boundary:** The `request:new` (step 3) and `request:complete` (step 11) events are received by the client's `useRequestLog` reducer — see Flow 6.

---

## Flow 3: Endpoint CRUD → Router Rebuild

What happens when a user creates, updates, or deletes an endpoint through the management API.

**Example: Creating an endpoint**

```
Client                                    Server
──────                                    ──────
endpointsApi.create(data)
  └─ POST /api/endpoints ──────────────→ routes/endpoints.js: router.post('/')
                                            |
                                         1. createEndpoint(req.body)
                                            |  endpointStore.js:
                                            |  ├─ validateEndpoint(data)
                                            |  |   └─ Check name, method, path, response shape
                                            |  ├─ Check endpoints.size < MAX_ENDPOINTS
                                            |  ├─ Check no duplicate method+path combo
                                            |  └─ endpoints.set(id, endpoint)
                                            |
                                         2. broadcastEndpoints()
                                            |  ├─ rebuildMockRouter()
                                            |  |   mockRouter.js:
                                            |  |   ├─ new Router()
                                            |  |   ├─ getAllEndpoints().filter(ep => ep.enabled)
                                            |  |   ├─ registerEndpoint(router, ep) for each
                                            |  |   |   └─ router[method](path, createMockHandler(ep))
                                            |  |   ├─ Add 404 fallback handler
                                            |  |   └─ mockRouter = newRouter  ← hot-swap
                                            |  |
                                            |  └─ emitEndpointsSync(getAllEndpoints())
                                            |      └─ io.emit('endpoints:sync', endpoints)
                                            |
                                         3. res.status(201).json({ endpoint })
                                            |
  ◄──────────────────────────────────────── |
  |
useEndpoints.createEndpoint():
  ├─ Optimistic: setEndpoints(prev => [...prev, endpoint])
  └─ Return endpoint
```

**Key detail — hot-swap pattern:** `rebuildMockRouter()` builds a completely new `Router()`, registers all enabled endpoints on it, then assigns it to the module-level `mockRouter` variable. The `mockRouterMiddleware` function always reads the current `mockRouter` reference, so the swap is atomic from Express's perspective — no request can hit a half-built router.

**Same flow for update/delete/toggle:** Every mutation route (`PUT /:id`, `DELETE /:id`, `POST /:id/toggle`) calls `broadcastEndpoints()` after the store operation, triggering the same rebuild + sync cycle.

---

## Flow 4: Frontend App Initialization

What happens when the React app loads in the browser.

**Provider wrapping order** (`client/src/App.jsx`):

```
<ErrorBoundary>                    Catches render errors, shows fallback UI
  <BrowserRouter>                  React Router — enables /tester route
    <SocketProvider>               Connects to Socket.io server
      <ToastProvider>              Toast notification state + overlay
        <Layout>                   Header + main content area
          <Routes>
            / → DashboardPage      Endpoint list + request log
            /tester → TesterPage   API testing tool
          </Routes>
        </Layout>
      </ToastProvider>
    </SocketProvider>
  </BrowserRouter>
</ErrorBoundary>
```

**Socket initialization** (`SocketProvider` in `client/src/features/request-log/context/SocketContext.jsx`):

```
1. useState(() => getSocket())     Lazy init — calls lib/socket.js singleton factory
   |  lib/socket.js:
   |  └─ io(SOCKET_URL, { autoConnect: false, reconnection: true, ... })
   |     Returns socket instance (not yet connected)
   |
2. useEffect: socket.connect()     Initiates WebSocket connection
   |
3. on 'connect' callback:
   |  ├─ setConnected(true)
   |  └─ socket.emit('subscribe:logs')   Joins 'request-logs' room on server
   |
4. Context provides { socket, connected } to all children
```

**Dashboard initialization** (`DashboardPage`):

```
5. useEndpoints() hook:
   |  └─ useEffect → fetchEndpoints()
   |     └─ endpointsApi.getAll() → GET /api/endpoints
   |     └─ setEndpoints(data.endpoints)
   |
6. useRequestLog() hook:
   └─ useEffect → registers socket listeners for request:new / request:complete
   └─ Ready to receive live log events
```

---

## Flow 5: Endpoint Creation UI Flow

What happens when a user creates a new mock endpoint through the UI.

```
1. User clicks "Add Endpoint" button
   └─ DashboardPage: setShowBuilder(true)
   └─ EndpointBuilder modal renders (fixed overlay)

2. User fills form:
   ├─ Name input
   ├─ Method selector (GET/POST/PUT/PATCH/DELETE)
   ├─ Path input (e.g., /users)
   └─ ResponseEditor:
      ├─ Status code input
      ├─ Delay input (ms)
      ├─ JSON body textarea
      ├─ Template picker:
      |   └─ Collapsible grid of Faker template chips (from FAKER_TEMPLATES.js)
      |   └─ Click chip → inserts {{faker.x.y()}} at cursor position
      |      └─ Uses selectionStart/selectionEnd + requestAnimationFrame for focus
      └─ Preview button:
          └─ fakerApi.preview(bodyText) → POST /api/faker/preview
          └─ Server processBody() → returns generated output
          └─ Shows preview below textarea

3. User clicks "Create" → handleSubmit()
   ├─ Validates JSON body (try JSON.parse)
   ├─ Calls onSave(endpointData) callback
   └─ DashboardPage.handleCreate:
      └─ useEndpoints.createEndpoint(data)
         └─ endpointsApi.create() → POST /api/endpoints
         └─ Optimistic state update (see Flow 3 for server side)
         └─ addToast('success', 'Endpoint created')

4. Modal closes → setShowBuilder(false)
```

---

## Flow 6: Real-time Request Log Flow

What happens when a mock endpoint is hit and the request log updates live in the browser.

**Two-phase lifecycle:** The server emits two events per request — `request:new` (immediately, status "pending") and `request:complete` (after the response is sent, with status/duration/body). The client reducer reconciles both by matching on request `id`.

**Phase A — Server emits** (`server/src/socket.js`)

```
1. Request hits /mock/* → requestCaptureMiddleware (see Flow 2)
   |
2. emitRequestNew(requestLog)
   |  └─ io.to('request-logs').emit('request:new', requestLog)
   |     requestLog.status = 'pending', response = null, duration = null
   |
   ... mock handler processes + sends response ...
   |
3. Patched res.json/send/end → completeRequest()
   |  └─ requestLog.status = 'completed'
   |  └─ requestLog.response = { status, headers, body }
   |  └─ requestLog.duration = Date.now() - startTime
   |
4. emitRequestComplete(requestLog)
      └─ io.to('request-logs').emit('request:complete', requestLog)
```

**Phase B — Client receives** (`client/src/features/request-log/useRequestLog.js`)

```
5. useEffect registers socket listeners (on mount):
   |  socket.on('request:new', onRequestNew)
   |  socket.on('request:complete', onRequestComplete)
   |
6. 'request:new' arrives → dispatch({ type: 'REQUEST_NEW', payload: log })
   |  Reducer: prepend to logs[] → [newLog, ...logs.slice(0, 199)]
   |           Caps at MAX_LOGS = 200 entries (client-side circular buffer)
   |
7. 'request:complete' arrives → dispatch({ type: 'REQUEST_COMPLETE', payload: log })
   |  Reducer:
   |  ├─ Find by id: logs.findIndex(l => l.id === payload.id)
   |  ├─ Found (normal case):
   |  |   └─ Merge: updatedLogs[index] = { ...existing, ...payload }
   |  |      Adds response, duration, status: 'completed' to the pending entry
   |  └─ Not found (race condition — complete arrived before new):
   |      └─ Insert as already-completed: [payload, ...logs.slice(0, 199)]
```

**Phase C — UI re-renders**

```
8. RequestLogPanel re-renders with updated logs[]
   |  └─ Maps over logs → RequestLogItem for each
   |
9. RequestLogItem shows:
   |  ├─ Method badge (color-coded via --color-method-*)
   |  ├─ Path
   |  ├─ Status code (pending → spinner, completed → status badge)
   |  └─ Duration (ms)
   |
10. User clicks a log entry → selectLog(log)
    |  └─ dispatch({ type: 'SELECT_LOG', payload: log })
    |  └─ state.selectedLog is set
    |
11. RequestDetails modal renders (fixed overlay)
    └─ Full request inspection: headers, query params, body
    └─ Full response inspection: status, headers, response body
    └─ Close → dispatch({ type: 'CLOSE_DETAILS' })
```

**Race condition handling:** Network timing isn't guaranteed — if the mock handler responds very fast (e.g., 0ms delay), the `request:complete` event can arrive at the client before `request:new`. The reducer handles this by inserting `complete` as a new entry when no matching `id` is found. When `new` arrives later, the prepend simply adds a duplicate pending entry at position 0, but since the completed version already exists further down in the array, the UI shows both briefly before the pending one gets pushed out by newer logs. In practice, this race is rare because Socket.io delivers messages in order on a single connection.

---

## Flow 7: API Tester Flow

What happens when the user sends a request from the built-in API tester.

**Entry point:** `client/src/features/tester/useApiTester.js: sendRequest()`

```
1. Validate URL               if (!url.trim()) return
2. setIsLoading(true)          Show loading state
3. clearResponse()             Reset previous response + error

4. Build headers object        Convert [{key, value}] array → { key: value } map
5. Determine body              GET/HEAD → null, otherwise use raw body string

6. Branch on URL:

   ┌─────────────────────────────────────────────────────────────────┐
   │  LOCAL: url.startsWith(MOCK_BASE)                               │
   │  e.g., http://localhost:3001/mock/users                         │
   │                                                                  │
   │  a. startTime = performance.now()                                │
   │  b. fetch(url, { method, headers, body })  ← direct, no proxy   │
   │  c. timing = Math.round(performance.now() - startTime)           │
   │  d. Collect response headers into object                         │
   │  e. setResponse({ status, statusText, headers, data, timing })   │
   │                                                                  │
   │  Note: This request also triggers Flow 2 on the server side      │
   │  (request capture → mock handler → socket events → log update)   │
   └─────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────┐
   │  EXTERNAL: any other URL                                        │
   │  e.g., https://api.github.com/users                             │
   │                                                                  │
   │  a. proxyApi.send({ method, url, headers, body })                │
   │     └─ POST /api/proxy                                           │
   │                                                                  │
   │  b. Server (routes/proxy.js):                                    │
   │     ├─ Validate URL format (new URL(url))                        │
   │     ├─ Build fetchOptions { method, headers, signal: 10s timeout}│
   │     ├─ Attach body for POST/PUT/PATCH                            │
   │     ├─ start = Date.now()                                        │
   │     ├─ await fetch(url, fetchOptions)                            │
   │     ├─ timing = Date.now() - start                               │
   │     ├─ Collect response headers                                  │
   │     └─ res.json({ status, statusText, headers, data, timing })   │
   │                                                                  │
   │  c. Client receives normalized response                          │
   │     └─ setResponse({ status, statusText, headers, data, timing })│
   │                                                                  │
   │  Error paths:                                                    │
   │     ├─ TimeoutError → 504 { error: 'Request timed out (10s)' }   │
   │     └─ Other        → 502 { error: err.message }                 │
   └─────────────────────────────────────────────────────────────────┘

7. setIsLoading(false)

8. ResponseViewer renders one of four states:
   ├─ Empty     → "Send a request to see the response"
   ├─ Loading   → Spinner
   ├─ Error     → Error message
   └─ Success   → Status badge + headers/body tabs
```

**Both paths normalize to the same shape:** `{ status, statusText, headers, data, timing }`. This means `ResponseViewer` doesn't need to know whether the request was local or proxied.
