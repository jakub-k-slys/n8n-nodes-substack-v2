# Contributing

This repository contains the `n8n-nodes-substack-new` package and is focused on the `Substack Gateway` n8n integration. Contributions should follow the existing repository structure and runtime patterns rather than generic n8n starter examples.

## Before You Start

Install dependencies:

```bash
pnpm install
```

Read the repo guidance before changing code:

- planning or starting work: [`.agents/workflow.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/workflow.md)
- any node file under `nodes/`: [`.agents/nodes.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/nodes.md) and [`.agents/properties.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/properties.md)
- programmatic node runtime: [`.agents/nodes-programmatic.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/nodes-programmatic.md)
- credentials: [`.agents/credentials.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/credentials.md)
- versioning: [`.agents/versioning.md`](/Users/jakubslys/n8n-nodes-substack-new/.agents/versioning.md)

## Repository Areas

- main node: [`nodes/SubstackGateway`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway)
- triggers: [`nodes/SubstackGateway/FollowingFeed.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/FollowingFeed.node.ts) and [`nodes/SubstackGateway/ProfileFeed.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/ProfileFeed.node.ts)
- shared feed logic: [`nodes/shared/atom-feed`](/Users/jakubslys/n8n-nodes-substack-new/nodes/shared/atom-feed)
- gateway transport: [`nodes/shared/gateway-transport`](/Users/jakubslys/n8n-nodes-substack-new/nodes/shared/gateway-transport)
- credentials: [`credentials/SubstackGatewayApi.credentials.ts`](/Users/jakubslys/n8n-nodes-substack-new/credentials/SubstackGatewayApi.credentials.ts)
- tests: [`test`](/Users/jakubslys/n8n-nodes-substack-new/test)

## Development Workflow

1. Create a branch for the change.
2. Review the relevant `.agents` docs before editing code.
3. Keep the UI description, domain operation catalog, runtime behavior, and schemas aligned.
4. Add or update tests for the changed behavior.
5. Run the required verification commands.
6. Open a pull request with a clear summary of the behavior change.

## Implementation Guidelines

- Keep changes typed. Avoid `any` unless there is no practical typed alternative.
- Reuse the existing Effect-based runtime pipeline instead of introducing parallel imperative parsing or transport logic.
- Prefer shared helpers when multiple nodes need the same behavior.
- Preserve backward compatibility for saved credentials and workflows where practical.
- Keep user-facing resource, operation, and field text clear in the n8n editor.
- Do not leak secrets into code, logs, fixtures, screenshots, or tests.

## Common Change Areas

### Adding or changing an operation

Update the relevant files:

- [`nodes/SubstackGateway/domain/operation.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/domain/operation.ts)
- the matching files under [`nodes/SubstackGateway/description`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/description)
- the resource runtime under [`nodes/SubstackGateway/runtime/resources`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/runtime/resources)
- schemas under [`nodes/SubstackGateway/schema`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/schema) when request or response shapes change
- tests covering decode, execution, and serialized output where relevant

### Changing credentials or transport

Update:

- [`credentials/SubstackGatewayApi.credentials.ts`](/Users/jakubslys/n8n-nodes-substack-new/credentials/SubstackGatewayApi.credentials.ts)
- shared URL and auth handling in [`nodes/shared/gateway-transport`](/Users/jakubslys/n8n-nodes-substack-new/nodes/shared/gateway-transport)
- tests that cover URL normalization, metadata lookup, or authentication behavior

Important: credentials store the gateway root URL, not a hardcoded `/api/v1` URL. Code should derive capability discovery and API base paths from that root.

### Changing triggers

Update the relevant trigger node and any shared feed parsing or checkpoint logic in [`nodes/shared/atom-feed`](/Users/jakubslys/n8n-nodes-substack-new/nodes/shared/atom-feed), then add trigger-facing tests.

## Verification

For code changes, run at least:

```bash
pnpm run test:unit
pnpm run build
pnpm run lint
```

Run broader coverage when packaging or end-to-end behavior changes:

```bash
pnpm run test
pnpm run test:package
```

## Pull Request Checklist

- the change matches the existing Substack Gateway architecture
- docs are updated when operations, parameters, credentials, or behavior change
- tests cover the changed behavior
- build, lint, and required tests pass locally
- no secrets or hardcoded environment-specific values were introduced

## Commit Messages

Use conventional commit titles:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

Use `feat!:` or `fix!:` for breaking changes, or include a `BREAKING CHANGE:` section in the commit body when appropriate.
