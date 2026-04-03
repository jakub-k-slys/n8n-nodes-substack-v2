# API Reference

This package currently documents the `Substack Gateway` n8n node, not a standalone TypeScript client API.

## Node

- display name: `Substack Gateway`
- internal name: `substackGateway`
- credential name: `substackGatewayApi`

## Credential Fields

- `Gateway URL`
- `Gateway Token`

## Resources And Operations

### Own Publication

- `Own Profile`
- `Own Notes`
- `Own Posts`
- `Own Following`

### Note

- `Create`
- `Get`
- `Delete`

### Draft

- `Create`
- `Get`
- `Get Many`
- `Update`
- `Delete`

### Post

- `Get`
- `Get Comments`

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

## Output Shape

The node returns plain JSON items shaped by resource-specific serializers. Common fields include:

- profiles: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- notes: `id`, `body`, `likesCount`, `author`, `publishedAt`
- posts: `id`, `title`, `slug`, `url`, `publishedAt`, optional rich post fields
- drafts: `id`/`uuid` for summary and creation flows, or optional `title`/`subtitle`/`body` for fetched draft content
- comments: `id`, `body`, `isAdmin`
