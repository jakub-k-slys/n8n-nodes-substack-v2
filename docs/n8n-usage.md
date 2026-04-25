# n8n Usage

## Package Nodes

- `Substack Gateway`
  Internal name: `substackGateway`
- `Substack Gateway Following Feed`
  Internal name: `substackGatewayFollowingFeed`
- `Substack Gateway Profile Feed`
  Internal name: `substackGatewayProfileFeed`
- `Randomizer`
  Internal name: `randomizer`

The three Substack nodes use the `substackGatewayApi` credential.

Available Substack resources and operations can vary depending on the specific gateway configured in that credential.

## Node Roles

- `Substack Gateway`
  Programmatic action node for Substack reads and writes.
- `Substack Gateway Following Feed`
  Polling trigger for the authenticated user's following feed.
- `Substack Gateway Profile Feed`
  Polling trigger for a selected Substack profile feed.
- `Randomizer`
  Schedule-driven trigger for random fire times inside daily, weekly, or monthly windows.

## Resources And Operations

### Own Publication

- `ownProfile`
- `ownNotes`
- `ownPosts`
- `ownFollowing`

### Note

- `createNote`
- `getNote`
- `deleteNote`
- `likeNote`
- `unlikeNote`

### Draft

- `createDraft`
- `getDraft`
- `listDrafts`
- `updateDraft`
- `deleteDraft`

### Post

- `getPost`
- `getPostComments`
- `likePost`
- `unlikePost`

### Profile

- `getProfile`
- `getProfileNotes`
- `getProfilePosts`

## Parameters

### Following Feed Parameters

- `emitOnlyNewItems`
  Whether the first successful poll should suppress already-existing feed entries
- `options.maximumEntityCount`
  Maximum XML entity count while parsing the feed
- `options.requestTimeoutSeconds`
  Request timeout in seconds

### Profile Feed Parameters

- `userName`
  Required profile user name to poll
- `emitOnlyNewItems`
  Whether the first successful poll should suppress already-existing feed entries

### Randomizer Parameters

- `schedules`
  One or more random schedule windows
- `windowStartHour`, `windowStartMinute`, `windowEndHour`, `windowEndMinute`
  Define the active window in the selected timezone
- `parameters.periodicity`
  Daily, weekly, or monthly scheduling
- `parameters.occurrences`
  Number of random fires to generate per window
- `parameters.timeZone`
  IANA timezone used for schedule evaluation
- `parameters.minimumSpacingMinutes`
  Minimum spacing between emitted times in one window

### Note Parameters

- `content`
  - Required for `createNote`
- `attachment`
  - Optional for `createNote`
- `noteId`
  - Required for `getNote`, `deleteNote`, `likeNote`, and `unlikeNote`

### Draft Parameters

- `draftId`
  - Required for `getDraft`, `updateDraft`, and `deleteDraft`
- `title`, `subtitle`, `body`
  - Used for `createDraft` and `updateDraft`

### Post Parameters

- `postId`
  - Required for `getPost`, `getPostComments`, `likePost`, and `unlikePost`

### Profile Parameters

- `profileSlug`
  - Required for all `Profile` operations
- `cursor`
  - Used on `getProfileNotes`
- `limit`
  - Used on `getProfilePosts`
  - Default: `50`
- `offset`
  - Used on `getProfilePosts`
  - Default: `0`

## Output Shapes

All 4 nodes return plain JSON items. Output fields vary by node and operation.

Common shapes:

- profile: `id`, `handle`, `name`, `url`, `avatarUrl`, optional `bio`
- note: `id`, `body`, `likesCount`, `author`, `publishedAt`
- draft summary: `id`, `uuid`, optional `title`, optional `updated`
- post summary/full post: `id`, `title`, `publishedAt`, plus post-specific optional fields
- comment: `id`, `body`, `isAdmin`
- feed entry: `id`, `type`, `publishedAt`, `title`, `url`, plus normalized feed-specific fields
- randomizer emission: schedule metadata plus the generated due occurrence timestamp

`restacks` may be present in post payloads, but restacking is not currently an available action in the node.

## Error Handling

The `Substack Gateway` action handlers return structured failures that the main node converts into n8n errors, unless `Continue On Fail` is enabled.

Common failure cases:

- Missing gateway token
- Invalid gateway URL
- Empty `content` when creating a note
- Invalid numeric IDs
- Gateway-side request failures
- Gateway does not support the selected operation or trigger capability
- Invalid or empty profile feed user name
- Invalid randomizer schedule configuration
