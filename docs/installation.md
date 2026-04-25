# Installation

## n8n Community Package

Install the package where n8n can load community nodes:

```bash
npm install n8n-nodes-substack-new
```

If you are using n8n's community package UI, install `n8n-nodes-substack-new` there and restart n8n afterward.

## Requirements

- Node.js `>=20.15`
- n8n with community packages enabled

## Credential Setup

Create a `Substack Gateway` credential for the Substack nodes with:

- `Gateway URL`
  - Store the gateway root URL, not a hardcoded `/api/v1` URL
- `Gateway Token`
  - Sent as `x-gateway-token`

## Installed Nodes

After installation, n8n should expose 4 nodes from this package:

- `Substack Gateway`
- `Substack Gateway Following Feed`
- `Substack Gateway Profile Feed`
- `Randomizer`

The installed package surface is fixed, but the Substack operations available at runtime can still vary depending on the specific Substack Gateway URL you configure.

## Local Development Setup

Install dependencies:

```bash
pnpm install
```

Build:

```bash
pnpm run build
```

Lint:

```bash
pnpm run lint
```

Test:

```bash
pnpm test
pnpm test:unit
pnpm run test:package
```
