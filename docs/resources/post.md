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
