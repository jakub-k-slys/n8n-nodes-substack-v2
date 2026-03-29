# n8n-nodes-substack-new

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jakub-k-slys/n8n-nodes-substack-new/actions/workflows/test.yaml/badge.svg)](https://github.com/jakub-k-slys/n8n-nodes-substack-new/actions/workflows/test.yaml)

`n8n-nodes-substack-new` is an n8n community package for working with Substack through a gateway-backed client. It ships two related surfaces:

- The `Substack Gateway` n8n node for workflows
- A small typed `SubstackClient` exported from the package for direct programmatic use

This repository no longer wraps a separate `substack-api` package. The client implementation lives in this codebase under [`nodes/SubstackGateway/shared/SubstackGatewayClient.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/shared/SubstackGatewayClient.ts).

## What It Supports

- Profile operations
  - Get your own profile
  - Get a profile by publication slug
  - List followed profiles or followed user IDs
- Post operations
  - List posts from your own publication
  - List posts from another publication by slug
  - Fetch a post by ID
- Note operations
  - List notes from your own publication
  - List notes from another publication by slug
  - Fetch a note by ID
  - Create a note with optional attached link
- Comment operations
  - List comments for a post by ID

## Installation

Install the package into your n8n environment:

```bash
npm install n8n-nodes-substack-new
```

Then restart n8n and install `n8n-nodes-substack-new` as a community package if needed by your deployment model.

## Credentials

The node uses a credential named `SubstackGateway API` with three fields:

- `Publication Address`
  - Full publication URL such as `https://myblog.substack.com`
- `Gateway URL`
  - Optional gateway base URL
  - Defaults to `https://substack-gateway.vercel.app`
- `API Key`
  - Bearer token expected by the gateway

## Quick Example

List recent posts from your own publication:

```json
{
  "nodes": [
    {
      "name": "Get Recent Posts",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "post",
        "operation": "getAll",
        "limit": 10
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

Create a note:

```json
{
  "nodes": [
    {
      "name": "Create Note",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "note",
        "operation": "create",
        "body": "Published from n8n",
        "visibility": "everyone",
        "attachment": "none"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## Direct Client Usage

The package also exports a typed client:

```ts
import { SubstackClient } from 'n8n-nodes-substack-new';

const client = new SubstackClient({
  publicationUrl: 'https://myblog.substack.com',
  token: process.env.SUBSTACK_GATEWAY_TOKEN!,
});

const ownProfile = await client.ownProfile();

for await (const post of ownProfile.posts()) {
  console.log(post.title);
}
```

## Documentation

- [Introduction](docs/introduction.md)
- [Installation](docs/installation.md)
- [Quickstart](docs/quickstart.md)
- [n8n Usage](docs/n8n-usage.md)
- [API Reference](docs/api-reference.md)
- [Examples](docs/examples.md)
- [Architecture](docs/design.md)
- [Development](docs/development.md)
- [Testing](docs/testing.md)

Resource-specific docs:

- [Profiles](docs/resources/profile.md)
- [Posts](docs/resources/post.md)
- [Notes](docs/resources/note.md)
- [Comments](docs/resources/comment.md)

## License

[MIT](LICENSE.md)
