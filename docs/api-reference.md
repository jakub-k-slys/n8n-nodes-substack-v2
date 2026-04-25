# API Reference

This package documents the n8n package surface, not a standalone TypeScript client API.

## Nodes

- display name: `Substack Gateway`
  internal name: `substackGateway`
- display name: `Substack Gateway Following Feed`
  internal name: `substackGatewayFollowingFeed`
- display name: `Substack Gateway Profile Feed`
  internal name: `substackGatewayProfileFeed`
- display name: `Randomizer`
  internal name: `randomizer`

## Credential

Credential name: `substackGatewayApi`

## Credential Fields

- `Gateway URL`
- `Gateway Token`

## Capability Variance

The documented Substack resources and operations describe the package surface, but actual availability depends on the connected Substack Gateway deployment.

- different gateways may expose different capabilities
- some operations may be available only on certain gateways
- the node editor may hide unsupported operations after capability discovery

## Gateway Resources And Operations

### Own Publication

- `Own Profile`
- `Own Notes`
- `Own Posts`
- `Own Following`

### Note

- `Create`
- `Get`
- `Delete`
- `Like`
- `Unlike`

### Draft

- `Create`
- `Get`
- `Get Many`
- `Update`
- `Delete`

### Post

- `Get`
- `Get Comments`
- `Like`
- `Unlike`

### Profile

- `Get`
- `Get Notes`
- `Get Posts`

## Input Fields

Shared fields are resource-specific:

- `noteId`
- `draftId`
- `postId`
- `profileSlug`
- `content`
- `attachment`
- `title`
- `subtitle`
- `body`
- `cursor`
- `limit`
- `offset`

Trigger-specific fields include:

- `emitOnlyNewItems`
- `userName`
- `options.maximumEntityCount`
- `options.requestTimeoutSeconds`
- `schedules`

## Output Shape

The package returns plain JSON items shaped by node-specific serializers. Common fields include:

- profiles: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- notes: `id`, `body`, `likesCount`, `author`, `publishedAt`
- posts: `id`, `title`, `slug`, `url`, `publishedAt`, optional rich post fields
- drafts: `id`/`uuid` for summary and creation flows, or optional `title`/`subtitle`/`body` for fetched draft content
- comments: `id`, `body`, `isAdmin`
- feed entries: normalized Atom feed entry fields
- randomizer items: generated occurrence metadata and schedule context

The package may return post `restacks` data when reading posts, but it does not currently expose `Restack` or `Unrestack` operations.
