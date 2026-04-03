# Profile Resource

## Operations

### `Get`

Parameters:

- `profileSlug` string, required

Returns the profile for the given publication slug.

### `Get Notes`

Parameters:

- `profileSlug` string, required
- `cursor` optional string

Returns notes for the given profile.

### `Get Posts`

Parameters:

- `profileSlug` string, required
- `limit` number, default `50`
- `offset` number, default `0`

Returns posts for the given profile.

## Output Fields

- profile: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- note: `id`, `body`, `likesCount`, `author`, `publishedAt`
- post summary: `id`, `title`, `publishedAt`, optional `subtitle`, optional `truncatedBody`
