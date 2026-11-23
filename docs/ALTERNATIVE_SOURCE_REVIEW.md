# Alternative eFootball data-source review

Review date: 2026-11-23  
Project: eFootball Zone 0.1 / Player-hub

## Decision summary

No newly reviewed source is approved for bulk import into the public Player-hub catalogue. A public webpage, public GitHub repository, or downloadable JSON file is not by itself permission to copy, transform, store, or republish the data.

## Candidate: eFootball Meta Lab

Repository: https://github.com/jbernasconif/efootball-meta-lab

The repository describes its card and manager information as collected from public eFHUB pages. Its own data notice says eFHUB has no public API or data licence and that the source pages state "All rights reserved". The repository also attributes the data to eFHUB and describes scraper tooling.

Decision: research lead only. Do not copy its CSV/JSON outputs, scrape eFHUB, or mirror its records. Ask the relevant rights holder for written permission covering storage, transformation, and public display.

## Candidate: eFootball Managers

Repository: https://github.com/amine250/efootball-managers

The existing source audit found 76 structurally valid manager records, but no LICENSE file was present in the inspected repository tree.

Decision: do not import manager records or photos until the repository owner confirms the licence/rights in writing. Manager images require separate clearance.

## Candidate: eFVerse

Repository: https://github.com/zahin002/eFVerse

The public project description documents a companion-app architecture and API shape, but the material reviewed does not establish that its data or assets are licensed for reuse in this project.

Decision: architecture reference only. Do not copy its data, code, or assets without checking the repository's exact licence and any third-party data rights.

## Safe implementation path

1. Keep the Player-hub schema and validator ready, but leave the production catalogue empty until a source is cleared.
2. Accept only a source licence or written permission that explicitly covers the intended public website use, data transformation, retention, and attribution.
3. Store provenance per record: source name, source URL, retrieval date, source record ID, permission reference, and verification status.
4. Keep card artwork, player photos, manager photos, logos, and screenshots out of the import unless their separate image rights are cleared.
5. Do not scrape, reverse engineer, automate game interaction, or systematically extract KONAMI materials.
6. Do not change the existing Supabase project or production tables as part of this source review.

## Current status

- Guardian approval: user reports obtained.
- KONAMI data permission: not confirmed.
- PlayersDB bulk reuse permission: not confirmed.
- eFHUB-derived data reuse permission: not confirmed.
- eFootball Managers dataset permission: not confirmed.
- Third-party records imported: none.
- Existing Supabase data changed: no.

This document is a project compliance and engineering note, not legal advice.
