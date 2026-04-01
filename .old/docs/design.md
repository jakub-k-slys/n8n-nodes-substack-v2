# Architecture

## High-Level Structure

The package is organized around the `Substack Gateway` n8n node plus a shared client layer.

Key paths:

- [`nodes/SubstackGateway/Substack.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/Substack.node.ts)
- [`nodes/SubstackGateway/SubstackUtils.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/SubstackUtils.ts)
- [`nodes/SubstackGateway/shared/SubstackGatewayClient.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/shared/SubstackGatewayClient.ts)
- [`nodes/SubstackGateway/shared/DataFormatters.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/shared/DataFormatters.ts)

## Node Layer

`Substack.node.ts` reads the selected `resource` and `operation`, resolves the matching handler map, and executes the corresponding operation module.

Resource modules:

- `Profile.operations.ts`
- `Post.operations.ts`
- `Note.operations.ts`
- `Comment.operations.ts`

Each resource also has a matching `*.fields.ts` file for parameter definitions.

## Shared Utilities

### `SubstackUtils`

Responsible for:

- Loading n8n credentials
- Validating publication URLs
- Constructing `SubstackClient`
- Formatting structured error responses

### `OperationHandler`

Responsible for:

- Uniform success/error wrapping
- Shared list collection helpers
- Shared limit parsing
- Profile resolution by slug or own profile

### `DataFormatters`

Transforms raw client objects into the node's output shapes.

## Client Layer

`SubstackGatewayClient.ts` implements:

- Gateway HTTP transport via `axios`
- Request throttling via `axios-rate-limit`
- Profile, note, post, and comment iteration helpers
- A small public typed API re-exported from [`index.ts`](/Users/jakubslys/n8n-nodes-substack-new/index.ts)

## Build Output

The package compiles to `dist/`, and `package.json` points n8n to:

- `dist/credentials/SubstackGatewayApi.credentials.js`
- `dist/nodes/SubstackGateway/Substack.node.js`
