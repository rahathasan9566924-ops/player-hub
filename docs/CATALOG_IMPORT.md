# Catalog import validation

Run this validator before importing any Player Card or Manager records.

## Requirements
- Node.js 18 or newer
- No third-party packages

## Run
```sh
node scripts/validate-catalog.mjs path/to/catalog.json
```

## Input shape
See `data/catalog-template.json`.

## Safety
- This is a local JSON validator only. It does not connect to Supabase.
- The source metadata must explicitly declare `reusePermission` as `permitted` or `user_provided`.
- Duplicate card/manager IDs, missing provenance, invalid positions, impossible ratings, and malformed dates fail validation.
- Records marked `partial` or `unverified` produce warnings. They should remain unpublished until checked.
- Never put a Supabase service-role key in a browser file or repository.
