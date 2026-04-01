# Contributing

Contributions are welcome.

## Workflow

1. Create a branch
2. Make the change
3. Add or update tests
4. Run:

```bash
pnpm run lint
pnpm run build
pnpm test
```

5. Open a pull request

## Guidelines

- Keep the n8n node surface aligned with the shared client
- Prefer small, explicit output shapes
- Update docs when operations or parameters change
- Do not introduce stale references to the removed external `substack-api` package
