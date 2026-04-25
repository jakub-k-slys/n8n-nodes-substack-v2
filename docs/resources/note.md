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

### `Like`

Parameters:

- `noteId` number, required

Returns:

- `success`
- `noteId`
- `liked`

### `Unlike`

Parameters:

- `noteId` number, required

Returns:

- `success`
- `noteId`
- `liked`

## Output Fields

- `id`
- `body`
- `likesCount`
- `author`
- `publishedAt`
