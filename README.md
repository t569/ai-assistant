# @t569/ai-assistant

The headless half of an animated AI assistant: a streaming client for a
LangGraph (or any SSE) backend, a table-driven state machine that turns what the
backend is doing into what the avatar should look like, and React bindings.

It renders nothing opinionated. Your app decides what the character looks like;
this package decides *when* it is thinking, speaking or waiting on you. Pair it
with [`@t569/scene-engine`](https://github.com/t569/scene-engine)'s `character`
plugin for a face that moves.

## Install

```bash
npm install github:t569/ai-assistant        # or copy it in with git subtree
```

Peer dependency: `react >= 18`. No other runtime dependencies.

## The pieces

| Export | What it does |
|---|---|
| `createLangGraphRuntime(endpoint, fetch?)` | POSTs `{ threadId, message?, … }`, reads the SSE response, hands you one `LangGraphStreamEvent` per `data:` frame. Malformed frames are dropped, never thrown. |
| `AVATAR_STATE_TRANSITIONS` | The state machine as a table: backend `(node, actionStatus)` → frontend `AvatarStatus`, each with a description. |
| `resolveAvatarStatus(actionStatus)` | Looks a status up in that table; unknown input falls back to `idle`, because it came off the network. |
| `describeAvatarStatus(status)` | The row's description, used as the avatar's accessible label. |
| `<AiAssistantProvider>` / `useAiAssistant()` | Commerce-shaped provider: messages, recommendations, a human-in-the-loop proposal to approve or reject, and host callbacks for every side effect. |
| `ProposalCard`, `ExplainabilityPanel`, `Avatar` | Minimal UI for the above. `Avatar` is only class names and data attributes to hang your own animation on. |

### Wire format

Each SSE frame is one JSON object:

```json
data: {"threadId":"…","node":"router_llm","actionStatus":"processing","state":{"messages":[…]}}
```

`node` says which graph node emitted it (or `null`), `actionStatus` which phase
the run is in, and `state` is a partial snapshot merged into the client's copy.
The frontend never computes any of this, it only relays it.

## Design rules

- **Black box.** Nothing here imports host code. Every side effect (commit an
  item, navigate, escalate to a human) is a callback the host implements.
- **Zero computation.** The runtime relays bytes. Reasoning, memory and token
  budgets live on the backend.
- **Deterministic avatar.** The avatar's state is *derived* from stream events
  through one table. Nothing sets it directly, so it can't drift.

Full specification: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Backend memory design: [`docs/memory-condensation-service.md`](docs/memory-condensation-service.md).

## Development

```bash
npm install
npm test            # vitest
npm run typecheck
npm run build       # → dist/
```

## Origin

Written for [Quickuder](https://quickuder-1.onrender.com/)'s shopping
assistant, then extracted when a second consumer (a blog mascot and agent-swarm
view) justified making it generic. MIT.
