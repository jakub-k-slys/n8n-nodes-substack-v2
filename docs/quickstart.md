# Quickstart

## 1. Install The Package

```bash
npm install n8n-nodes-substack-new-template
```

Restart n8n after installation.

## 2. Create Credentials

Add a `Substack Gateway` credential with:

- `Gateway URL`: leave the default unless you run your own gateway
- `Gateway Token`: your gateway token

## 3. Add The Node

In n8n, add the `Substack Gateway` node.

## 4. Try A Read Operation

Use:

- `Resource`: `Own Publication`
- `Operation`: `Own Profile`

This returns your current profile summary.

## 5. Try A Write Operation

Use:

- `Resource`: `Note`
- `Operation`: `Create`
- `Content`: some note text
- `Attachment`: optional URL

This creates a note through the gateway and returns a created note identifier.

## 6. Try A List Operation

Use:

- `Resource`: `Draft`
- `Operation`: `Get Many`

This returns the current draft list from the gateway.
