# Introduction

`n8n-nodes-substack-new` currently provides 4 n8n nodes:

- `Substack Gateway`
- `Substack Gateway Following Feed`
- `Substack Gateway Profile Feed`
- `Randomizer`

## Current Scope

The package supports:

- own publication profile, notes, posts, and following
- note create/get/delete
- draft create/get/list/update/delete
- post get and comment listing
- profile get, notes, and posts

## Package Surfaces

### Main Action Node

The node is implemented in [`nodes/Gateway/Gateway.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/Gateway/Gateway.node.ts).

Current resources:

- `Own Publication`
- `Note`
- `Draft`
- `Post`
- `Profile`

### Trigger Nodes

The package also exposes:

- [`nodes/FollowingFeed/FollowingFeed.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/FollowingFeed/FollowingFeed.node.ts)
  Polls the authenticated user's following feed through Substack Gateway
- [`nodes/ProfileFeed/ProfileFeed.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/ProfileFeed/ProfileFeed.node.ts)
  Polls a specific profile feed through Substack Gateway
- [`nodes/Randomizer/Randomizer.node.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/Randomizer/Randomizer.node.ts)
  Emits random trigger events inside configured schedule windows

## Authentication Model

The Substack Gateway nodes send requests to a gateway service using:

- `x-gateway-token` header
- the configured `Gateway URL` as the base URL

The shared n8n credential exposes:

- `gatewayUrl`
- `gatewayToken`

## Gateway Variants

Different Substack Gateway deployments may support different resources, operations, and trigger features.

This means:

- the exact action list can vary by configured gateway
- some operations may be hidden in the editor when the gateway does not advertise support for them
- some requests may fail if the connected gateway does not implement the selected capability

## Data Flow

At runtime the `Substack Gateway` action node:

1. Loads `Substack Gateway` credentials
2. Decodes the selected resource and operation
3. Runs the matching resource-local Effect pipeline
4. Serializes the result into n8n JSON output

The trigger nodes use two different execution models:

- `Following Feed` and `Profile Feed` fetch Atom feeds, track checkpoints, and emit only new entries after the initial poll when configured to do so
- `Randomizer` generates random fire times inside configured windows and emits them when they become due

## Where To Start

- Use [Quickstart](quickstart.md) for first setup
- Use [n8n Usage](n8n-usage.md) for workflow-facing behavior across all 4 nodes
- Use [API Reference](api-reference.md) for the package node and credential contract
