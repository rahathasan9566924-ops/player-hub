# External eFootball data-source audit

Audit date: 2026-11-23

This audit records discovery and quality checks only. No third-party player or manager records, photos, or artwork have been copied into this repository.

## Manager catalogue candidate

Repository: https://github.com/amine250/efootball-managers  
Dataset file: `data/managers.json`  
Observed dataset blob SHA: `d69747d94502588919cb9a9908e73b099c11d7ed`

### Structural checks performed

- 76 manager entries parsed successfully as JSON.
- 76 distinct IDs; no duplicate IDs found.
- Every entry had an ID, name, and playstyle proficiency object.
- Proficiency values checked against the upstream README's 10–99 range; no out-of-range values found for the five documented playstyles.
- Two records have no release date: Luis A. Roman (`laroman`) and Cristo Valbuena (`cvalbuena`).
- Dataset includes booster effects and optional link-up-play data.

### Reuse decision: NOT CLEARED

The upstream repository tree inspected on 2026-11-23 did not contain a LICENSE file. A public GitHub repository is not automatically licensed for copying or redistribution. Therefore this dataset is a research lead only and must not be imported or redistributed until the owner grants written permission or adds a license that clearly permits the intended use.

Manager photos are also excluded. Image files can have separate copyright or publicity rights.

### Schema mapping when permission is obtained

- `id` -> source record ID
- `name` -> manager name
- `releaseDate` -> source release date; keep null if missing
- `teamPlaystyleProficiency` -> preserve original JSON as raw source data; map only documented fields
- `boosterEffects` -> boosters JSON
- `linkUpPlay` -> link-up JSON
- `photo` -> do not copy the image; retain only a source reference if permitted

No team, nationality, formation, or defensive tactical values should be inferred from real-world coaching history. The upstream schema does not establish those fields.

## Player catalogue candidate

PlayersDB: https://playersdb.app/  
Its public site describes a large historical PES/eFootball player-ID dataset and offers CSV/JSONL downloads. The inspected site footer states "All rights reserved". Its data is useful for research and identity/ID cross-reference discovery, but reuse permission for bulk redistribution into this project is not established. Do not import the download unless the operator grants permission or a clear reuse license is published.

PESDB: https://pesdb.net/  
Treat as a manual reference only unless current terms explicitly authorize the intended access and reuse. Do not automate collection, mirror the database, or reproduce substantial parts of it.

## Import gate

A source may move from research to import only after all of the following are documented:

1. Explicit license or written permission covering the intended storage, transformation, and public display.
2. Stable source record identifiers.
3. Source URL and retrieval date for each imported record.
4. Field-level validation and duplicate checks.
5. Unknown values left null, not guessed.
6. Unverified records kept unpublished.
7. Import performed through the project's validation and reviewed batch process.

## Current outcome

- No third-party dataset has been imported.
- No existing Supabase data has been changed.
- The manager source is structurally promising but not legally cleared for reuse.
- The PlayersDB source is large and relevant but bulk reuse permission is not established.


## Additional KONAMI terms review (2026-11-23)

The current KONAMI eFootball Terms of Use state that game materials are protected intellectual property, grant access for personal non-commercial use, and prohibit systematically downloading and storing Materials to create a database. They also prohibit scraping/data mining Materials without express prior written consent. See the official terms: https://legal.konami.com/games/efootball/terms/tou/202603/en-us.html (sections 1 and 2).

KONAMI's official notice dated 2026-10-23 also warns against reverse engineering, modified game distributions, and unauthorized programs related to game operation/content: https://www.konami.com/efootball/en/topic/news/6033

**Result:** Do not collect card data by reverse engineering, scraping KONAMI, automating game interaction, or systematically extracting game materials. Obtain explicit written permission or an approved licensed feed before building a bulk card catalogue. This is a practical project safeguard, not legal advice.

PlayersDB publicly offers downloadable CSV/JSONL files and describes its dataset as community-maintained, but the pages inspected do not establish a clear redistribution licence for our intended use. Keep it in research-only status until the maintainer confirms rights in writing.

Permission-request drafts and a status tracker are in `docs/DATA_PERMISSION_REQUESTS.md`. No request has been sent and no third-party data has been imported.
