# Implementation Insights — Phase 4: Real-time Request Logging

A collection of patterns, trade-offs, and lessons learned while building the request logging feature.

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
