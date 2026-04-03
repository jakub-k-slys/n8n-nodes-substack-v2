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
pnpm test:unit
pnpm run test:package
pnpm run dev
```

## Main Source Areas

- Node implementation:
  - [`nodes/SubstackGateway`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway)
- Credentials:
  - [`credentials/SubstackGatewayApi.credentials.ts`](/Users/jakubslys/n8n-nodes-substack-new/credentials/SubstackGatewayApi.credentials.ts)
- Tests:
  - [`test`](/Users/jakubslys/n8n-nodes-substack-new/test)

## Adding A New Operation

1. Add the operation to [`domain/operation.ts`](/Users/jakubslys/n8n-nodes-substack-new/nodes/SubstackGateway/domain/operation.ts)
2. Add any required fields in the matching `description/fields-*.ts`
3. Implement the resource-local input reader, command decode, request build, response decode, and execute flow
4. Add or update serialization DTOs in the matching resource folder
5. Add or update unit and feature tests

## Release Notes

If you change any of the following, verify the packaged output explicitly:

- `package.json` `n8n.credentials`
- `package.json` `n8n.nodes`
- credential file names
- node directory names
- build smoke in `pnpm run test:package`
