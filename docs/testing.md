# Testing

## Test Suite

Feature tests:

```bash
pnpm test
```

Fast source-level unit tests:

```bash
pnpm test:unit
```

Build-coupled package smoke test:

```bash
pnpm run test:package
```

## What Is Tested

The current test suite covers:

- operation decoding
- input reading
- resource-local execution pipelines
- transport layer behavior
- result serialization
- packaged build smoke

## Test Strategy

The tests do not call a live gateway.

The runtime is tested at two levels:

- source-level unit tests against the TypeScript modules under [`nodes/SubstackGateway/runtime`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/runtime)
- Cucumber feature tests for higher-level behavior
- one package smoke test against built `dist/` output

Main helpers:

- [`test/features`](/Users/jakubslys/n8n-nodes-substack-new/test/features)
- [`test/package/package-smoke.test.ts`](/Users/jakubslys/n8n-nodes-substack-new/test/package/package-smoke.test.ts)

## Before Merging

Run:

```bash
pnpm run lint
pnpm run build
pnpm test
pnpm test:unit
pnpm run test:package
```
