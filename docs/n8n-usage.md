# n8n Usage

## Node Identity

- Display name: `Substack Gateway`
- Internal name: `substackGateway`
- Credential name: `substackGatewayApi`

## Resources And Operations

### Own Publication

- `ownProfile`
- `ownNotes`
- `ownPosts`
- `ownFollowing`

### Note

- `createNote`
- `getNote`
- `deleteNote`

### Draft

- `createDraft`
- `getDraft`
- `listDrafts`
- `updateDraft`
- `deleteDraft`

### Post

- `getPost`
- `getPostComments`

### Profile

- `getProfile`
- `getProfileNotes`
- `getProfilePosts`

## Parameters

### Note Parameters

- `content`
  - Required for `createNote`
- `attachment`
  - Optional for `createNote`
- `noteId`
  - Required for `getNote` and `deleteNote`

### Draft Parameters

- `draftId`
  - Required for `getDraft`, `updateDraft`, and `deleteDraft`
- `title`, `subtitle`, `body`
  - Used for `createDraft` and `updateDraft`

### Post Parameters

- `postId`
  - Required for `getPost` and `getPostComments`

### Profile Parameters

- `profileSlug`
  - Required for all `Profile` operations
- `cursor`
  - Used on `getProfileNotes`
- `limit`
  - Used on `getProfilePosts`
  - Default: `50`
- `offset`
  - Used on `getProfilePosts`
  - Default: `0`

## Output Shapes

The node returns plain JSON items. Output fields vary by resource and operation.

Common shapes:

- profile: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- note: `id`, `body`, `likesCount`, `author`, `publishedAt`
- draft summary: `id`, `uuid`, optional `title`, optional `updated`
- post summary/full post: `id`, `title`, `publishedAt`, plus post-specific optional fields
- comment: `id`, `body`, `isAdmin`

## Error Handling

Operation handlers return structured failures that the main node converts into n8n errors, unless `Continue On Fail` is enabled.

Common failure cases:

- Missing gateway token
- Invalid gateway URL
- Empty `content` when creating a note
- Invalid numeric IDs
- Gateway-side request failures
