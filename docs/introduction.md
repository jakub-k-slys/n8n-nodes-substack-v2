# Introduction

`n8n-nodes-substack-new` provides a gateway-backed Substack integration for n8n and a small TypeScript client for direct usage.

## Current Scope

The package supports:

- Reading profiles
- Listing followed profiles
- Reading posts
- Reading notes
- Creating notes
- Reading comments for a post

It does not currently implement post creation, post likes, or comment creation.

## Package Surfaces

### n8n Node

The n8n node is exposed as `Substack Gateway` and is implemented in [`nodes/SubstackGateway/Substack.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/Substack.node.ts).

Resources:

- `profile`
- `post`
- `note`
- `comment`

### TypeScript Client

The package entrypoint re-exports `SubstackClient` from [`index.ts`](/Users/jakubslys/n8n-nodes-substack-new/index.ts).

The client implementation lives in [`nodes/SubstackGateway/shared/SubstackGatewayClient.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/shared/SubstackGatewayClient.ts).

## Authentication Model

Requests are sent to a gateway service using:

- Bearer token in the `Authorization` header
- Publication URL in the `x-publication-url` header

The n8n credential exposes:

- `publicationAddress`
- `gatewayUrl`
- `apiKey`

## Data Flow

At runtime the n8n node:

1. Loads `SubstackGateway API` credentials
2. Builds a `SubstackClient`
3. Routes the selected resource and operation to the matching handler
4. Formats results into n8n-friendly JSON output

## Where To Start

- Use [Quickstart](quickstart.md) for first setup
- Use [n8n Usage](n8n-usage.md) for workflow-facing behavior
- Use [API Reference](api-reference.md) for the direct client
