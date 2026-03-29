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

Create a `SubstackGateway API` credential with:

- `Publication Address`
  - Example: `https://myblog.substack.com`
- `Gateway URL`
  - Optional override for the gateway base URL
  - Default: `https://substack-gateway.vercel.app`
- `API Key`
  - Gateway bearer token

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
```
