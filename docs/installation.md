# Installation

## n8n Community Package

Install the package where n8n can load community nodes:

```bash
npm install n8n-nodes-substack-new-template
```

If you are using n8n's community package UI, install `n8n-nodes-substack-new-template` there and restart n8n afterward.

## Requirements

- Node.js `>=20.15`
- n8n with community packages enabled

## Credential Setup

Create a `Substack Gateway` credential with:

- `Gateway URL`
  - Default: `https://substack-gateway.vercel.app/api/v1`
- `Gateway Token`
  - Sent as `x-gateway-token`

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
