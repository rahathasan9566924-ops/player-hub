# Player-Hub: practical data acquisition plan

## Decision
Do not block the project on a single third-party database or on KONAMI permission. Build the catalogue through three parallel, auditable lanes:

1. **Owner-provided data**: accept CSV/JSON exports the project owner has the right to use. Preserve the original file, record its checksum, source, retrieval date and permission basis.
2. **Directly entered and verified records**: create records from information the contributor is authorized to submit. Keep unknown card ratings, skills, boosts, card art and manager tactics blank. Require a source URL and reviewer check before publication.
3. **Licensed partner data**: request written permission from dataset maintainers. Import only after the permission covers storage, modification, public display and redistribution for Player-Hub.

## What is not an acceptable shortcut
- A public webpage or downloadable file is not automatically licensed for bulk reuse.
- Do not scrape, mirror, reconstruct, or copy another site's catalogue or artwork.
- Do not extract protected game files or use private endpoints.
- Do not fabricate card ratings, skills, manager tactics, release dates, or card identities to make the catalogue look full.

## First delivery target
- Keep the existing 37 player identity records.
- Add real card records only when each record has a stable card ID, source URL, retrieval date and evidence for its displayed fields.
- Add manager records under the same evidence requirements.
- Use `partial` verification when some fields are confirmed and `unverified` until reviewed.
- Keep all imported records unpublished until the admin approves them.

## Import workflow
1. Owner uploads an authorized CSV/JSON file to the admin import area.
2. Validate file format, required IDs, field types, numeric ranges, dates, duplicate keys and source URLs.
3. Produce a dry-run report: rows accepted, rejected, duplicates and missing fields.
4. Back up affected tables.
5. Import in small idempotent batches using stable source IDs.
6. Recount rows and sample-check records against their cited sources.
7. Admin explicitly publishes approved records.

## Permission request checklist
Any written permission request must ask whether Player-Hub may:
- store and normalize the dataset;
- show the resulting records publicly on a free fan reference website;
- retain source attribution and update records;
- display text fields separately from protected logos, photos and card artwork;
- make periodic updates and retain historical versions.

A permission reply that does not clearly cover these uses is not approval.

## Current state
The current Supabase project has 37 player identities copied into the player master table as unpublished, unverified records. This is an identity bootstrap only, not a card catalogue. Player cards and managers still require source-backed records. Do not relabel these 37 identities as cards.

## Next engineering work
- Build a CSV/JSON dry-run validator and import report around the existing schema.
- Add an admin-only import path that uses the authenticated Supabase session and existing RLS; never put a service-role key in browser code.
- Add a manual entry form for player cards and managers with mandatory source URL and verification status.
- Add public catalogue queries that show only published records.
