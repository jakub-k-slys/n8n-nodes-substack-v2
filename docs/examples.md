# Examples

## n8n: Get Own Profile

```json
{
  "nodes": [
    {
      "name": "Get Own Profile",
      "type": "n8n-nodes-substack-new-template.substackGateway",
      "parameters": {
        "resource": "ownPublication",
        "operation": "ownProfile"
      },
      "credentials": {
        "substackGatewayApi": "your-credential-id"
      }
    }
  ]
}
```

## n8n: List Drafts

```json
{
  "nodes": [
    {
      "name": "List Drafts",
      "type": "n8n-nodes-substack-new-template.substackGateway",
      "parameters": {
        "resource": "draft",
        "operation": "listDrafts"
      },
      "credentials": {
        "substackGatewayApi": "your-credential-id"
      }
    }
  ]
}
```

## n8n: Create Note

```json
{
  "nodes": [
    {
      "name": "Create Note",
      "type": "n8n-nodes-substack-new-template.substackGateway",
      "parameters": {
        "resource": "note",
        "operation": "createNote",
        "content": "Worth reading",
        "attachment": "https://example.com/article"
      },
      "credentials": {
        "substackGatewayApi": "your-credential-id"
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
      "type": "n8n-nodes-substack-new-template.substackGateway",
      "parameters": {
        "resource": "post",
        "operation": "getPostComments",
        "postId": 12345
      },
      "credentials": {
        "substackGatewayApi": "your-credential-id"
      }
    }
  ]
}
```
