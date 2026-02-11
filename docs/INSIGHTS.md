# Implementation Insights

A collection of patterns, trade-offs, and lessons learned across phases.

---

## Phase 4: Real-time Request Logging

## Socket.io Client Patterns

### Lazy Singleton Initialization

Instead of creating the socket connection at import time, the `getSocket()` factory in `lib/socket.js` creates the instance on first call. This prevents the socket from connecting before React mounts (important during SSR or testing), and ensures only one connection exists across the entire app.

```js
// Bad: connects immediately on import, even if no component needs it
export const socket = io('http://localhost:3001');

// Good: creates on demand, returns same instance thereafter
let socket = null;
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}
```

### Room Subscription on Every Connect

The server requires clients to `emit('subscribe:logs')` to join the broadcasting room. This must happen on every `connect` event — not just on mount — because Socket.io reconnections trigger a fresh `connect`, and the server-side room membership is lost when a client disconnects.

## React State Management

### Context + Hook Separation

`SocketContext` owns the connection lifecycle (connect, disconnect, reconnect), while `useWebSocket` is a thin consumer hook. Components never import the Context directly — they always go through the hook. This decouples context internals from consumers, making refactoring trivial.

### Why `useState(() => getSocket())` Instead of `useRef`

React's strict linter flags `ref.current` access during render because refs are "escape hatches" — React can't track when they change, so reading `ref.current` in JSX means the context value could be stale. The ref could update without triggering a re-render.

Since `getSocket()` is a synchronous singleton that returns the same value forever, `useState` with a lazy initializer is the correct choice: it initializes once, participates in React's rendering cycle, and satisfies the linter.

Similarly, calling `setState` synchronously inside a `useEffect` body triggers cascading renders. The lazy initializer pattern `useState(() => factory())` avoids this for synchronous factory functions.

### Fast Refresh + Context Splitting

Vite's fast refresh (HMR) module can only hot-swap files that export React components exclusively. Mixing `createContext()` with component exports in the same file breaks hot module replacement. The solution is to put the context object in its own `.js` file and import it in both the provider and the hook:

```
context/socketContext.js    ← createContext(null) lives here
context/SocketContext.jsx   ← SocketProvider component lives here
```

### Reducer for Two-Phase Event Lifecycle

The `useRequestLog` hook uses `useReducer` instead of `useState` because the state transitions involve multiple interdependent fields (`logs`, `selectedLog`) across several action types. A reducer centralizes this logic and makes the state transitions predictable and testable.

The key challenge: `request:new` arrives first with `status: 'pending'`, then `request:complete` updates it with the response and duration. The reducer matches these by request `id`. A race condition can occur where `complete` arrives before `new` — the reducer handles this by inserting the completed log directly as a new entry when no match is found.

```js
case 'REQUEST_COMPLETE': {
  const index = state.logs.findIndex(log => log.id === action.payload.id);
  if (index === -1) {
    // Race condition: complete arrived first — insert as already-completed
    return { ...state, logs: [action.payload, ...state.logs.slice(0, MAX_LOGS - 1)] };
  }
  // Normal path: update the pending entry in place
  const updatedLogs = [...state.logs];
  updatedLogs[index] = { ...updatedLogs[index], ...action.payload };
  return { ...state, logs: updatedLogs };
}
```

### `.map()` vs `findIndex` for In-Place Updates

Two valid approaches for updating a specific array element:

- **`.map()`**: Declarative, scans every element. Clean when you don't need the "not found" case.
- **`findIndex` + splice**: Can do a targeted update and naturally handles the "not found" fallback. Slightly more efficient for large arrays, but with a 200-item cap the difference is negligible. The real win is the natural branching for edge case handling.

## CSS Layout Patterns

### Mobile-First Layout Shift

On mobile, the sidebar is an overlay toggled by a floating action button — the main content stays full width. At the 1024px breakpoint, the layout switches from `flex-direction: column` to `row`, so the sidebar sits alongside the main content.

The key CSS trick: the sidebar container is `position: fixed` with `pointer-events: none` / `opacity: 0` on mobile (invisible and non-interactive), toggled visible via a modifier class. At desktop, it resets to `position: static` with a fixed width from the `--sidebar-width` token, becoming a natural flex child.

### Status Code Color Mapping

HTTP status codes follow a universal convention. Rather than creating a lookup table, a simple range check maps to the right semantic class:

```js
if (code < 300) return 'success';   // 2xx → green
if (code < 400) return 'redirect';  // 3xx → blue
if (code < 500) return 'warning';   // 4xx → amber
return 'error';                      // 5xx → red
```

This leverages the existing design tokens (`--color-success-*`, `--color-warning-*`, `--color-error-*`) without maintaining a separate color map.

## Event Constant Mirroring

Keeping server and client event strings in sync via shared constant files prevents subtle bugs from typos in event names. A `request:new` vs `request.new` mismatch would silently fail — the listener would never fire, with no error to debug. Constants make this a compile-time (or at least import-time) concern.

---

## Phase 5: Faker.js Integration

### Server-Side Preview vs. Client-Side Faker

The preview feature sends template data to `POST /api/faker/preview` on the server rather than bundling `@faker-js/faker` into the client bundle. This is a deliberate trade-off:

- **Consistency**: Both the preview and the actual mock endpoint responses run through the exact same `processBody()` function. If Faker were also running client-side, version mismatches, locale differences, or divergent method availability could cause the preview to show output that doesn't match what the mock endpoint actually returns.
- **Bundle size**: `@faker-js/faker` is ~800KB minified. Keeping it server-only avoids inflating the client bundle for a feature that's used occasionally.
- **Cost**: One extra network round-trip per preview click. Acceptable for a developer tool where previews are infrequent and latency to localhost is negligible.

### Cursor-Position Insertion with Controlled Inputs

React's controlled textarea (`value` + `onChange`) re-renders the entire value on every state change, which resets the browser's native cursor position. To insert text at the cursor:

1. Read `selectionStart` / `selectionEnd` from the DOM element via `ref`
2. Splice the template string into the value at that position
3. Call `onChange` with the new value (triggers React re-render)
4. Use `requestAnimationFrame` to set the cursor position *after* React's re-render completes

The `requestAnimationFrame` is critical — without it, `setSelectionRange()` runs before the DOM updates with the new value, and the browser ignores it. This is one of the few places where React's declarative model needs imperative DOM coordination.

```js
const insertTemplate = useCallback((template) => {
  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const newValue = value.slice(0, start) + template + value.slice(textarea.selectionEnd);
  onChange(newValue);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + template.length, start + template.length);
  });
}, [value, onChange]);
```

### Template Parsing via Regex

The backend's `processTemplate()` uses a single regex: `/\{\{faker\.([a-zA-Z]+)\.([a-zA-Z]+)\((.*?)\)\}\}/g`. This captures three groups: module, method, and arguments. The argument string is parsed as JSON (`JSON.parse(\`[\${args}]\`)`), falling back to a raw string if parsing fails.

This approach is simple and fast for the expected input (developer-authored templates), but has a deliberate limitation: it doesn't support nested templates like `{{faker.helpers.arrayElement({{faker.person.firstName()}})}}`. Nesting would require a recursive parser or AST-based approach — complexity that isn't justified for the MVP where templates are always flat substitutions.

### Curating a Template Catalog

The `FAKER_TEMPLATE_CATEGORIES` constant is a curated subset of Faker's full API surface. Faker.js exposes 200+ methods across 30+ modules, but most are irrelevant for API mocking. The catalog focuses on 5 categories (~20 methods) that cover the most common mock data needs: user profiles (Person), authentication/contact (Internet), addresses (Location), e-commerce (Commerce), and business entities (Company).

This curation is a UX decision — showing every available method would overwhelm the picker. The `GET /methods` endpoint still exposes the full catalog for advanced users who want to type templates manually.

### Responsive Template Grid

The template picker uses CSS Grid with a progressive column layout:

- **Mobile** (default): `grid-template-columns: 1fr` — single column, each category stacks vertically
- **768px+**: `repeat(2, 1fr)` — two columns, categories flow naturally
- **1024px+**: `repeat(3, 1fr)` — three columns, full desktop width

This is simpler than a flexbox approach because Grid auto-places items without needing `flex-basis` calculations or explicit wrapping logic. The categories are independent blocks that don't need to align with each other, making Grid's auto-placement ideal.

---

## Phase 6: API Tester Feature

### Client-Side Routing with React Router 7

React Router v7 consolidated imports into a single `react-router` package — the separate `react-router-dom` install is no longer needed. `NavLink`'s `className` prop accepts a render callback `({isActive}) => string`, which integrates cleanly with BEM naming by conditionally appending the `--active` modifier. The `end` prop on the root route (`/`) prevents it from matching every path.

### Server-Side Proxy Pattern

The proxy endpoint (`POST /api/proxy`) exists to work around browser CORS restrictions. When a user wants to test an external API (e.g., `https://api.github.com/users`), the browser blocks the request due to same-origin policy. By forwarding it through the Express server, the request comes from Node.js (no CORS) and the response is relayed back to the client.

The proxy uses semantically correct HTTP status codes for its own error handling: `502 Bad Gateway` for unreachable targets (server is acting as an intermediary that failed), and `504 Gateway Timeout` for requests exceeding the 10-second limit.

### Dual Request Path: Direct vs. Proxy

The `sendRequest()` function in `useApiTester.js` needs to decide between two paths:

- **Direct fetch**: When the URL starts with `MOCK_BASE` (i.e., `http://localhost:3001/mock/...`), the browser can fetch directly since the mock server and API share the same origin. This avoids an unnecessary hop through the proxy and means the request shows up in the real-time log as a genuine incoming request.
- **Proxy fetch**: When the URL targets an external domain, the request must go through `POST /api/proxy` to bypass CORS.

Both paths normalize the response to the same shape: `{ status, statusText, headers, data, timing }`. This allows `ResponseViewer` to render identically regardless of the path taken.

### `void` Expressions for Lint Compliance in Placeholder Code

When writing a hook placeholder that will be completed later, unused variables trigger `no-unused-vars` lint errors. Using `void variable` explicitly marks them as intentionally referenced without side effects. This is preferable to `// eslint-disable` comments because it's visible, self-documenting, and will naturally be removed when the real implementation replaces the placeholder.

### Data-Attribute Driven Styling for Method Selectors

The method `<select>` element uses `data-method={method.toLowerCase()}` to drive its background color through CSS attribute selectors (`[data-method="post"]`). This avoids JavaScript-computed inline styles and keeps the color logic in CSS where it belongs. The same token variables (`--color-method-*`) are reused from the existing MethodBadge component, maintaining visual consistency.
