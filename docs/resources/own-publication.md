# Own Publication Resource

## Operations

### `Own Profile`

Returns the authenticated profile.

### `Own Notes`

Returns the authenticated user's notes.

### `Own Posts`

Returns the authenticated user's posts.

### `Own Following`

Returns the accounts followed by the authenticated user.

## Output Fields

Common shapes:

- profile: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- note: `id`, `body`, `likesCount`, `author`, `publishedAt`
- post summary: `id`, `title`, `publishedAt`, optional `subtitle`, optional `truncatedBody`
- following user: `id`, `handle`
