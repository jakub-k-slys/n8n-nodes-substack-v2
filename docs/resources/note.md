# Note Resource

## Operations

### `Create`

Parameters:

- `content` string, required
- `attachment` optional string

Returns:

- `id`

### `Get`

Parameters:

- `noteId` number, required

Returns a single note.

### `Delete`

Parameters:

- `noteId` number, required

Returns:

- `success`
- `noteId`

## Output Fields

- `id`
- `body`
- `likesCount`
- `author`
- `publishedAt`
