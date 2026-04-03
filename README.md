# n8n-nodes-substack-new

`n8n-nodes-substack-new` provides the `Substack Gateway` n8n community node.

It integrates n8n with a gateway-backed Substack API and currently supports own publication data, notes, drafts, posts, and profiles.

## Installation

Install the package in the n8n instance where community nodes are enabled:

```bash
npm install n8n-nodes-substack-new
```

Restart n8n after installation.

## Credentials

The node uses the `Substack Gateway` credential with:

- `Gateway URL`
- `Gateway Token`

## Resources

Current resources and operations:

- `Own Publication`
  - `Own Profile`
  - `Own Notes`
  - `Own Posts`
  - `Own Following`
- `Note`
  - `Create`
  - `Get`
  - `Delete`
- `Draft`
  - `Create`
  - `Get`
  - `Get Many`
  - `Update`
  - `Delete`
- `Post`
  - `Get`
  - `Get Comments`
- `Profile`
  - `Get`
  - `Get Notes`
  - `Get Posts`

## Quickstart

1. Install the package and restart n8n.
2. Create a `Substack Gateway` credential.
3. Add the `Substack Gateway` node to a workflow.
4. Try:
   - `Resource: Own Publication`
   - `Operation: Own Profile`

For a simple write flow, use:

- `Resource: Note`
- `Operation: Create`
- `Content: ...`
- `Attachment: ...` (optional)

## Development

Common commands:

```bash
pnpm run build
pnpm run dev
pnpm run lint
pnpm test
pnpm test:unit
pnpm run test:package
```

Notes:

- `pnpm run build` uses `tsup` and copies the n8n static assets into `dist/`
- `pnpm run dev` builds the package, prepares a local dev package, and runs local n8n with watch mode
- `pnpm test` runs the Cucumber feature suite
- `pnpm test:unit` runs the fast source-level TypeScript tests
- `pnpm run test:package` verifies the built `dist/` package

## Documentation

- [Docs Index](/Users/jakubslys/n8n-nodes-substack-new/docs/index.md)
- [Quickstart](/Users/jakubslys/n8n-nodes-substack-new/docs/quickstart.md)
- [n8n Usage](/Users/jakubslys/n8n-nodes-substack-new/docs/n8n-usage.md)
- [Architecture](/Users/jakubslys/n8n-nodes-substack-new/docs/design.md)
- [Testing](/Users/jakubslys/n8n-nodes-substack-new/docs/testing.md)

## Compatibility

This package targets modern n8n releases with community nodes enabled. Verify against the current build and test workflow in this repository.
