# Post Resource

## Operations

### `Get`

Parameters:

- `postId` number, required

Returns a single post.

### `Get Comments`

Parameters:

- `postId` number, required

Returns the comments for a post.

### `Like`

Parameters:

- `postId` number, required

Returns:

- `success`
- `postId`
- `liked`

### `Unlike`

Parameters:

- `postId` number, required

Returns:

- `success`
- `postId`
- `liked`

## Output Fields

- `id`
- `title`
- `slug`
- `url`
- `publishedAt`
- optional `subtitle`
- `htmlBody`
- `markdown`
- optional `truncatedBody`
- optional `reactions`
- optional `restacks`
- optional `tags`
- optional `coverImage`

`restacks` is a read-only output field here. The package does not currently expose `Restack` or `Unrestack` operations.
