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

- Keep the documented node surface aligned with `domain/operation.ts`
- Prefer resource-local runtime code and serializers
- Update docs when operations, parameters, or credentials change
- Do not reintroduce references to a standalone `SubstackClient` API unless such an API actually exists
