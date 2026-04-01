# API Reference

This package exports `SubstackClient` for direct usage outside n8n.

```ts
import { SubstackClient } from 'n8n-nodes-substack-new';
```

## Constructor

```ts
new SubstackClient(config)
```

### `SubstackClientConfig`

```ts
interface SubstackClientConfig {
  publicationUrl: string;
  token: string;
  gatewayUrl?: string;
  perPage?: number;
  maxRequestsPerSecond?: number;
}
```

## Top-Level Methods

### `ownProfile()`

```ts
ownProfile(): Promise<SubstackOwnProfile>
```

Returns the authenticated profile context.

### `profileForSlug(slug)`

```ts
profileForSlug(slug: string): Promise<SubstackProfile>
```

Returns a profile context for the given publication slug.

### `postForId(id)`

```ts
postForId(id: number): Promise<SubstackPost>
```

Returns a post object with comment iteration support.

### `noteForId(id)`

```ts
noteForId(id: number): Promise<SubstackNote>
```

Returns a single note.

## Context Types

### `SubstackProfileSummary`

```ts
interface SubstackProfileSummary {
  id: number;
  name: string;
  handle: string;
  slug: string;
  url: string;
  bio?: string;
  avatarUrl?: string;
}
```

### `SubstackProfile`

```ts
interface SubstackProfile extends SubstackProfileSummary {
  posts(): AsyncIterable<SubstackPostSummary>;
  notes(): AsyncIterable<SubstackNote>;
}
```

### `SubstackOwnProfile`

```ts
interface SubstackOwnProfile extends SubstackProfile {
  following(): AsyncIterable<SubstackProfileSummary>;
  publishNote(
    content: string,
    options?: { attachment?: string }
  ): Promise<SubstackPublishNoteResponse>;
}
```

### `SubstackPostSummary`

```ts
interface SubstackPostSummary {
  id: number;
  title: string;
  subtitle: string;
  slug?: string;
  url?: string;
  truncatedBody: string;
  htmlBody: string;
  markdown: string;
  publishedAt: string;
}
```

### `SubstackPost`

```ts
interface SubstackPost extends SubstackPostSummary {
  comments(): AsyncIterable<SubstackComment>;
}
```

### `SubstackNote`

```ts
interface SubstackNote {
  id: number;
  body: string;
  likesCount: number;
  publishedAt: string;
  author: {
    id: number;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
}
```

### `SubstackComment`

```ts
interface SubstackComment {
  id: number;
  body: string;
  isAdmin: boolean;
}
```

### `SubstackPublishNoteResponse`

```ts
interface SubstackPublishNoteResponse {
  id: number;
}
```

## Examples

### Iterate Your Own Posts

```ts
const client = new SubstackClient({
  publicationUrl: 'https://myblog.substack.com',
  token: process.env.SUBSTACK_GATEWAY_TOKEN!,
});

const ownProfile = await client.ownProfile();

for await (const post of ownProfile.posts()) {
  console.log(post.id, post.title);
}
```

### Create A Note

```ts
const ownProfile = await client.ownProfile();
const created = await ownProfile.publishNote('Shipped from the gateway client');

console.log(created.id);
```

### Read Comments For A Post

```ts
const post = await client.postForId(12345);

for await (const comment of post.comments()) {
  console.log(comment.body);
}
```
