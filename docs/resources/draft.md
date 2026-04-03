# Draft Resource

## Operations

### `Create`

Parameters:

- `title` optional string
- `subtitle` optional string
- `body` optional string

### `Get`

Parameters:

- `draftId` number, required

### `Get Many`

No additional parameters.

### `Update`

Parameters:

- `draftId` number, required
- `title` optional string
- `subtitle` optional string
- `body` optional string

### `Delete`

Parameters:

- `draftId` number, required

## Output Fields

Depending on the operation, draft responses include:

- `id`
- `uuid`
- optional `title`
- optional `subtitle`
- optional `body`
- optional `updated`
- `success`
- `draftId`
