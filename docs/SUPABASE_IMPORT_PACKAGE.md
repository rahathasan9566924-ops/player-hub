# Prepare a Supabase import package

This tool converts a permission-cleared canonical catalogue into CSV files that match the existing Player-Hub Supabase tables.

## Run
```sh
node scripts/validate-catalog.mjs data/catalog.json
node scripts/prepare-supabase-import.mjs data/catalog.json supabase-import
```

The generated directory contains identity, player-card, attributes, skills, position proficiency, manager, and manager-tactics CSV files plus a manifest.

## Import order
1. `player_identities.csv`
2. `player_cards.csv`
3. `player_card_attributes.csv`, `player_card_skills.csv`, `player_card_positions.csv`
4. `managers.csv`
5. `manager_tactics.csv`

The generator validates the source permission declaration and catalog shape first. Cards must have a stable `playerId`; missing identity rows are generated from the card's sourced identity fields. All generated rows are unpublished. This is a local file generator only: it does not connect to Supabase or publish records. Check the source's actual licence or written permission; never treat a self-declared permission field as proof.
