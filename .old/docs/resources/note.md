# Note Resource

## Operations

### `create`

Parameters:

- `body` string, required
- `visibility`
  - `everyone`
  - `subscribers`
- `attachment`
  - `none`
  - `link`
- `linkUrl`
  - required when `attachment` is `link`

Returns:

- `noteId`
- `body`
- `url`
- `date`
- `status`
- `visibility`
- `attachment`
- `linkUrl`

### `get`

Parameters:

- `limit`
  - default `50`

Lists notes from the authenticated publication.

### `getNotesBySlug`

Parameters:

- `slug` string, required
- `limit`
  - default `50`

Lists notes from another publication identified by slug.

### `getNoteById`

Parameters:

- `noteId` string, required

Returns a single note.

## Output Fields

- `noteId`
- `body`
- `url`
- `date`
- `status`
- `userId`
- `likes`
- `type`
