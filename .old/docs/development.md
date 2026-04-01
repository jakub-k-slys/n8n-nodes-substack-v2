# Development

## Setup

```bash
pnpm install
```

## Common Commands

```bash
pnpm run build
pnpm run lint
pnpm test
pnpm run dev
```

## Main Source Areas

- Node implementation:
  - [`nodes/SubstackGateway`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway)
- Credentials:
  - [`credentials/SubstackGatewayApi.credentials.ts`](/Users/jakubslys/n8n-nodes-substack-new/credentials/SubstackGatewayApi.credentials.ts)
- Package entrypoint:
  - [`index.ts`](/Users/jakubslys/n8n-nodes-substack-new/index.ts)
- Tests:
  - [`tests/unit`](/Users/jakubslys/n8n-nodes-substack-new/tests/unit)

## Adding A New Operation

1. Add the operation enum entry in the relevant `*.operations.ts`
2. Add the operation option to the exported `INodeProperties[]`
3. Add required parameters in the matching `*.fields.ts`
4. Implement the handler
5. Format the output using `DataFormatters` when appropriate
6. Add tests

## Release Notes

If you change any of the following, verify the packaged output explicitly:

- `package.json` `n8n.credentials`
- `package.json` `n8n.nodes`
- credential file names
- node directory names
