# Testing

## Test Suite

Run all unit tests:

```bash
pnpm test
```

Watch mode:

```bash
pnpm run test:watch
```

## What Is Tested

The unit tests cover:

- Profile operations
- Post operations
- Note operations
- Comment operations
- Output formatting
- Input validation
- Integration-style behavior inside the node execution flow

## Test Strategy

The tests do not call a live gateway. They mock the client returned by `SubstackUtils.initializeClient()`.

Main helpers:

- [`tests/mocks/mockSubstackClient.ts`](/Users/jakubslys/n8n-nodes-substack-new/tests/mocks/mockSubstackClient.ts)
- [`tests/mocks/mockExecuteFunctions.ts`](/Users/jakubslys/n8n-nodes-substack-new/tests/mocks/mockExecuteFunctions.ts)
- [`tests/utils/testSetup.ts`](/Users/jakubslys/n8n-nodes-substack-new/tests/utils/testSetup.ts)

## Before Merging

Run:

```bash
pnpm run lint
pnpm run build
pnpm test
```
