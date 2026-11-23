# Player Hub data import specification

This document defines the safe, repeatable format for importing eFootball player cards and managers. It does not change the live site or any Supabase project.

## 1. Separate three kinds of records

- **Player card**: one specific in-game card/version. A player may have many cards.
- **Player identity**: the real-world player identity, independent of card ratings.
- **Manager**: one in-game manager/coach record and its tactical attributes.

Do not merge multiple cards just because they belong to the same footballer. Do not treat an identity ID as a card ID.

## 2. Player card JSON shape

```json
{
  "cardId": "stable-source-card-id",
  "playerId": "stable-player-identity-id",
  "name": "Player name",
  "cardName": "Card/version label",
  "cardType": "Standard",
  "pack": "Pack or event name",
  "releaseDate": "YYYY-MM-DD",
  "databaseVersion": "eFootball version",
  "pos": "CF",
  "playstyle": "Goal Poacher",
  "ovr": 0,
  "maxOvr": 0,
  "age": null,
  "height": null,
  "weight": null,
  "foot": "",
  "nationality": "",
  "club": "",
  "league": "",
  "image": "",
  "attributes": {},
  "skills": [],
  "source": "",
  "sourceUrl": "",
  "retrievedAt": "YYYY-MM-DD",
  "verification": "unverified",
  "notes": ""
}
```

Use numeric values only when the source explicitly provides them. Keep unavailable values null or empty. Do not estimate ratings, skills, card type, or release dates.

## 3. Manager JSON shape

```json
{
  "managerId": "stable-source-manager-id",
  "name": "Manager name",
  "team": "",
  "nationality": "",
  "formation": "",
  "attackingPlaystyle": "",
  "buildUp": "",
  "attackingArea": "",
  "positioning": "",
  "defensivePlaystyle": "",
  "containmentArea": "",
  "pressuring": "",
  "defensiveLine": null,
  "compactness": null,
  "boosters": [],
  "linkUp": [],
  "source": "",
  "sourceUrl": "",
  "retrievedAt": "YYYY-MM-DD",
  "verification": "unverified",
  "notes": ""
}
```

Manager values must be recorded exactly as shown by a permitted source. Do not infer tactical ratings from a manager's real-world reputation.

## 4. Verification rules

- `verified`: every displayed field used by the site was checked against a cited, permitted source.
- `partial`: the source confirms some fields, but one or more important fields are missing or unchecked.
- `unverified`: source is absent, unclear, or not yet checked.
- Every imported record must retain `source`, `sourceUrl`, and `retrievedAt`.
- A missing field must stay missing. Never fill gaps with guesses.
- Before import, validate required names/positions, numeric ranges, dates, duplicate IDs, and source URLs.
- A card's unique key is `cardId`; a manager's unique key is `managerId`. Name alone is not a safe deduplication key.

## 5. Data-source and reuse rules

Use official information where available, user-provided exports that the user has permission to use, or third-party datasets whose current licence explicitly permits the intended reuse. Keep attribution and source dates with each record.

Do **not** bulk-scrape or reconstruct another site's database. For example, the current PESDB terms permit ordinary limited manual copying for personal reference but prohibit automated collection, systematic copying, database reconstruction, and redistribution. KONAMI's eFootball terms also restrict systematic downloading/storing of game materials and scraping. A public webpage is not automatically a reusable dataset.

Third-party sites can be used as research references only where their terms allow it. Do not copy their card artwork, logos, page layout, or substantial database contents without permission.

## 6. Import and deployment safety

- Validate a batch before changing any stored records.
- Import in small batches and use stable IDs for upserts.
- Never delete unmatched cloud rows as part of an import.
- Back up existing data before any schema or bulk-data change.
- Keep Supabase service-role/secret keys out of browser code and GitHub. Browser clients may use only the project's publishable/anon key with correctly configured Row Level Security.
- Do not run a migration against an existing Supabase project until its current tables, columns, policies, and functions have been inspected.

## 7. Current prototype status

The repository's original prototype currently contains five fictional demonstration players. They are UI samples, not usable real eFootball data. The player-card and manager datasets must be imported and verified separately before the site can be described as a complete database.
