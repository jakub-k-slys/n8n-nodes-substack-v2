# Architecture

## High-Level Structure

The package is organized around the `Substack Gateway` n8n node and a resource-oriented runtime.

Key paths:

- [`nodes/SubstackGateway/SubstackGateway.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/SubstackGateway.node.ts)
- [`nodes/SubstackGateway/runtime`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/runtime)
- [`nodes/SubstackGateway/domain`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/domain)
- [`nodes/SubstackGateway/schema`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/schema)

## Node Layer

`SubstackGateway.node.ts` is the n8n-facing adapter:

- loads credentials
- validates `Gateway URL`
- runs the selected operation for each input item
- converts domain/runtime errors into n8n errors

## Runtime Layer

The runtime is split by resource under [`runtime/resources`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/runtime/resources):

- `own-publication`
- `note`
- `draft`
- `post`
- `profile`

Each resource owns its:

- input reader
- command decode
- request build
- response decode
- execute pipeline
- output DTO serialization

## Effect Integration

The runtime uses:

- `Effect` for orchestration
- `Effect.Schema` for input, response, and output DTO boundaries
- `@effect/platform` `HttpClient` as the transport abstraction

Host-specific adapters live under [`runtime/live`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/runtime/live).

## Build Output

The package compiles to `dist/`, and `package.json` points n8n to:

- `dist/credentials/SubstackGatewayApi.credentials.js`
- `dist/nodes/SubstackGateway/SubstackGateway.node.js`
