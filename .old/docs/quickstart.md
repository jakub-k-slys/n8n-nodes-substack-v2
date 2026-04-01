# Quickstart

## 1. Install The Package

```bash
npm install n8n-nodes-substack-new
```

Restart n8n after installation.

## 2. Create Credentials

Add a `SubstackGateway API` credential with:

- `Publication Address`: `https://your-publication.substack.com`
- `Gateway URL`: leave default unless you run your own gateway
- `API Key`: your gateway bearer token

## 3. Add The Node

In n8n, add the `Substack Gateway` node.

## 4. Try A Read Operation

Use:

- `Resource`: `profile`
- `Operation`: `getOwnProfile`

This returns your current profile summary.

## 5. Try A Write Operation

Use:

- `Resource`: `note`
- `Operation`: `create`
- `Body`: some note text
- `Visibility`: `everyone`
- `Attachment`: `none`

This creates a note through the gateway and returns:

- `noteId`
- `body`
- `url`
- `date`
- `status`
- `visibility`

## 6. Try Direct Client Usage

```ts
import { SubstackClient } from 'n8n-nodes-substack-new';

const client = new SubstackClient({
  publicationUrl: 'https://your-publication.substack.com',
  token: process.env.SUBSTACK_GATEWAY_TOKEN!,
});

const ownProfile = await client.ownProfile();
const created = await ownProfile.publishNote('Hello from the client');

console.log(created.id);
```
