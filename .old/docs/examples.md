# Examples

## n8n: Get Own Profile

```json
{
  "nodes": [
    {
      "name": "Get Own Profile",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "profile",
        "operation": "getOwnProfile"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## n8n: Get Posts From Another Publication

```json
{
  "nodes": [
    {
      "name": "Get Posts By Slug",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "post",
        "operation": "getPostsBySlug",
        "slug": "example",
        "limit": 10
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## n8n: Create Note With Attached Link

```json
{
  "nodes": [
    {
      "name": "Create Note",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "note",
        "operation": "create",
        "body": "Worth reading",
        "visibility": "everyone",
        "attachment": "link",
        "linkUrl": "https://example.com/article"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## n8n: Get Comments For A Post

```json
{
  "nodes": [
    {
      "name": "Get Comments",
      "type": "n8n-nodes-substack-new.substack",
      "parameters": {
        "resource": "comment",
        "operation": "getAll",
        "postId": 12345,
        "limit": 20
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## Client: Read Notes By Slug

```ts
import { SubstackClient } from 'n8n-nodes-substack-new';

const client = new SubstackClient({
  publicationUrl: 'https://myblog.substack.com',
  token: process.env.SUBSTACK_GATEWAY_TOKEN!,
});

const profile = await client.profileForSlug('example');

for await (const note of profile.notes()) {
  console.log(note.id, note.body);
}
```
