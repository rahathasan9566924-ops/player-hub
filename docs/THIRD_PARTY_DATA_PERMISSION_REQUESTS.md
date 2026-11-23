# Third-party data permission requests

**Status:** Drafts prepared; no request has been sent. Do not change a source to `authorized` until the rights holder gives written permission that covers the intended use.

## What Player-Hub is requesting

Player-Hub is a community eFootball information website backed by a database. We are requesting permission to reuse only the specific data fields the owner controls, with clear attribution and a source link. We will not request private information, account access, game files, or confidential data.

Please ask the owner to answer each point explicitly:

1. May Player-Hub store the data in its Supabase database?
2. May Player-Hub display the data publicly on its website?
3. May Player-Hub import the data in bulk (CSV/JSON/API), or is manual/limited use the only permitted method?
4. May the data be used on a free, non-commercial website? Is monetization permitted or prohibited?
5. Which fields are covered: player names/IDs, card names/types, ratings, attributes, skills, position proficiency, manager names, formations, playstyles, tactics?
6. Are photos, card artwork, logos, and other images excluded unless separately licensed?
7. What attribution text and source links are required?
8. Are modifications, corrections, caching, and periodic updates allowed?
9. Is there a licence or written permission document we can retain?
10. Can permission be withdrawn, and what removal process is required?

A response that only permits viewing, personal use, or linking is **not** permission for bulk import or public republication.

## Request template

Subject: Permission request to use selected eFootball data in Player-Hub

Hello,

I am working on Player-Hub, an independent community website that helps eFootball players browse player-card information and manager tactics.

I would like to ask whether you can grant written permission for Player-Hub to store and publicly display selected factual records from your project. The intended fields are: player names and identifiers, card names/types, ratings, attributes, skills, position proficiency, and/or manager names, formations, playstyles and tactical attributes, depending on which of these you own or are authorized to license.

Could you please confirm:

- Which specific fields we may reuse;
- Whether bulk CSV/JSON/API import is permitted;
- Whether public display on a free community website is permitted;
- Whether any commercial use or future monetization is permitted (we will treat this as not permitted unless you expressly approve it);
- Required attribution and source links;
- Whether images, card artwork, logos and photos are excluded or separately licensed;
- Any limits, licence terms, update conditions, or removal requirements.

We will not scrape restricted services, access confidential game data, or use any material outside the scope you expressly approve. We can provide attribution and remove records if required.

If you are not the rights holder for some fields, please let me know which party we should contact.

Thank you for your time.

Regards,
Player-Hub project team

## Source-specific contact routes

| Source | Contact route | What to request |
|---|---|---|
| PlayersDB | https://playersdb.app/about (use the business/contact email shown on the site's own footer) | Dataset licence, provenance, fields controlled by PlayersDB, bulk import and public display rights |
| eFootballToolkit | https://efootballtoolkit.com/en/contact | Written exception/licence for Player-Hub; their published terms currently describe personal, non-commercial reference use |
| eFootball Managers dataset | https://github.com/amine250/efootball-managers/issues | Ask repository owner to provide a licence or written permission for the JSON records; ask separately about photos |
| eFVerse | https://github.com/zahin002/eFVerse/issues | Ask for the seed-card data's provenance and a data-specific reuse licence; the software-code licence alone is not enough |
| KONAMI | https://www.konami.com/efootball/ | Ask the rights holder for written permission and the correct licensing/contact department. Do not acquire data from game internals or restricted systems |

## Permission evidence checklist

Before import, save the permission email/document and record:
- Rights holder identity and date received;
- Exact source URL and dataset/version;
- Exact fields and assets permitted;
- Bulk import, storage, public display, attribution, commercial-use status;
- Expiry, conditions, and withdrawal/removal process.

Only then update `public.data_sources.permission_status` to `authorized`, set `active=true` for the approved scope, and import the permitted fields. If permission is partial, keep the source restricted and document the exact allowed scope. Never infer permission from a public repository, an MIT code licence, or the ability to download a file.

## Safety and privacy

These are draft messages only. No message has been sent and no personal contact details are included. Have a trusted adult review any external contact before sending. Do not share home address, phone number, personal identity documents, passwords, or account access.
