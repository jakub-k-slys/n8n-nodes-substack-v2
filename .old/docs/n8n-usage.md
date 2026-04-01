# n8n Usage

## Node Identity

- Display name: `Substack Gateway`
- Internal name: `substack`
- Credential name: `substackApi`

## Resources And Operations

### Profile

- `getOwnProfile`
- `getProfileBySlug`
- `getFollowees`

### Post

- `getAll`
- `getPostsBySlug`
- `getPostById`

### Note

- `create`
- `get`
- `getNotesBySlug`
- `getNoteById`

### Comment

- `getAll`

## Parameters

### Shared

- `limit`
  - Used on list-style operations
  - Minimum value: `1`
  - Default: `50`

### Profile Parameters

- `slug`
  - Required for `getProfileBySlug`
- `returnType`
  - Used by `getFollowees`
  - Values:
    - `profiles`
    - `ids`

### Post Parameters

- `slug`
  - Required for `getPostsBySlug`
- `postId`
  - Required for `getPostById`

### Note Parameters

- `body`
  - Required for `create`
- `visibility`
  - Values:
    - `everyone`
    - `subscribers`
- `attachment`
  - Values:
    - `none`
    - `link`
- `linkUrl`
  - Required when `attachment` is `link`
- `slug`
  - Required for `getNotesBySlug`
- `noteId`
  - Required for `getNoteById`

### Comment Parameters

- `postId`
  - Required for `getAll`

## Output Shapes

### Profiles

Profile responses contain:

- `id`
- `name`
- `handle`
- `bio`
- `url`
- `avatarUrl`

### Posts

Post responses contain:

- `id`
- `title`
- `subtitle`
- `slug`
- `url`
- `postDate`
- `description`
- `htmlBody`
- `markdown`

### Notes

Note responses contain:

- `noteId`
- `body`
- `url`
- `date`
- `status`
- `userId`
- `likes`
- `type`

### Comments

Comment responses contain:

- `id`
- `body`
- `isAdmin`
- `parentPostId`

## Error Handling

Operation handlers return structured failures that the main node converts into n8n errors, unless `Continue On Fail` is enabled.

Common failure cases:

- Missing API key
- Invalid publication URL
- Empty `body` when creating a note
- Invalid numeric IDs
- Gateway-side request failures
