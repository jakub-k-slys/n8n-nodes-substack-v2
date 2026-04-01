# Profile Resource

## Operations

### `getOwnProfile`

Returns the authenticated profile.

Output fields:

- `id`
- `name`
- `handle`
- `bio`
- `url`
- `avatarUrl`

### `getProfileBySlug`

Parameters:

- `slug` string, required

Returns the profile for the given publication slug.

### `getFollowees`

Parameters:

- `returnType`
  - `profiles`
  - `ids`
- `limit`
  - default `50`

When `returnType` is `profiles`, each item includes:

- `id`
- `name`
- `handle`
- `bio`
- `url`
- `avatarUrl`

When `returnType` is `ids`, each item includes:

- `id`
