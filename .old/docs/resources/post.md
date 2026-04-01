# Post Resource

## Operations

### `getAll`

Parameters:

- `limit`
  - default `50`

Lists posts from the authenticated publication.

### `getPostsBySlug`

Parameters:

- `slug` string, required
- `limit`
  - default `50`

Lists posts for another publication identified by slug.

### `getPostById`

Parameters:

- `postId` string, required

Returns a single post.

## Output Fields

- `id`
- `title`
- `subtitle`
- `slug`
- `url`
- `postDate`
- `description`
- `htmlBody`
- `markdown`
