# Quickstart

## 1. Install The Package

```bash
npm install n8n-nodes-substack-new
```

Restart n8n after installation.

## 2. Create Credentials

Add a `Substack Gateway` credential for the Substack nodes with:

- `Gateway URL`: the gateway root URL
- `Gateway Token`: your gateway token

## 3. Choose A Node

In n8n, add one of the package nodes:

- `Substack Gateway`
- `Substack Gateway Following Feed`
- `Substack Gateway Profile Feed`
- `Randomizer`

Depending on the Substack Gateway you configured, some resources or operations may differ from the examples below.

## 4. Try The Main Action Node

Use `Substack Gateway` with:

- `Resource`: `Own Publication`
- `Operation`: `Own Profile`

This returns your current profile summary.

## 5. Try A Trigger Node

Use `Substack Gateway Following Feed` when you want new entries from your authenticated following feed, or `Substack Gateway Profile Feed` when you want entries from a chosen profile.

For `Substack Gateway Profile Feed`, set:

- `User Name`: the target Substack profile user name
- `Emit Only New Items`: enabled for typical polling flows

## 6. Try A Write Operation

Use:

- `Resource`: `Note`
- `Operation`: `Create`
- `Content`: some note text
- `Attachment`: optional URL

This creates a note through the gateway and returns a created note identifier.

## 7. Try A Random Schedule Trigger

Use `Randomizer` with:

- one schedule window
- a timezone
- `Times Per Window` greater than `0`

This emits items at random times inside the configured window.

## 8. Try A List Operation

Use:

- `Resource`: `Draft`
- `Operation`: `Get Many`

This returns the current draft list from the gateway.
