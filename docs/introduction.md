# Introduction

`n8n-nodes-substack-new-template` currently provides one n8n node: `Substack Gateway`.

## Current Scope

The package supports:

- own publication profile, notes, posts, and following
- note create/get/delete
- draft create/get/list/update/delete
- post get and comment listing
- profile get, notes, and posts

## Package Surfaces

### n8n Node

The node is implemented in [`nodes/SubstackGateway/SubstackGateway.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/SubstackGateway.node.ts).

Current resources:

- `Own Publication`
- `Note`
- `Draft`
- `Post`
- `Profile`

## Authentication Model

Requests are sent to a gateway service using:

- `x-gateway-token` header
- the configured `Gateway URL` as the base URL

The n8n credential exposes:

- `gatewayUrl`
- `gatewayToken`

## Data Flow

At runtime the n8n node:

1. Loads `Substack Gateway` credentials
2. Decodes the selected resource and operation
3. Runs the matching resource-local Effect pipeline
4. Serializes the result into n8n JSON output

## Where To Start

- Use [Quickstart](quickstart.md) for first setup
- Use [n8n Usage](n8n-usage.md) for workflow-facing behavior
- Use [API Reference](api-reference.md) for the node contract
