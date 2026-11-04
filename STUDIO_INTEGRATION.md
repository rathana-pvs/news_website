# Reel Studio integration

This website supports the desktop application's schema-driven `http-json-v1`
connector and the legacy `payload-news-v1` connector.
Connect with an existing CMS editor/admin email and password. Payload's normal
login endpoint issues a JWT; Studio calls use `Authorization: JWT <token>`.
All content mutations enforce the CMS collection permissions.

The simple connection JSON is [reel-studio-connection.example.json](reel-studio-connection.example.json).
Download it, fill in the root `email` and `password`, and upload it once through
**Settings → Websites → Upload website JSON → Test connection & save** in the
desktop app. For Photo, Reel, and Live posts, enable **Read more** and select the
saved website. The credential-filled local `reel-studio-connection.json` is ignored
by Git. No schema file is needed for this simple connection.

For another website, adapt those schema sections to its API. Schema version 2
supports login tokens, HTTP Basic, API tokens, JSON/form/multipart payloads,
custom required fields, response mappings, and optional separate media upload.
Its APIs must provide publishing, visibility verification, unique links, and
server-side idempotency. Changing only the website URL cannot supply missing APIs.

Use `http://localhost:3000` for a local website. Use its HTTPS origin in production.
The desktop backend connects directly; no public desktop API or browser session
transfer is involved.

## Installation

For an existing production schema, apply the registered
`20261104_website_studio` migration with the normal Payload migration process
(`npx payload migrate`). It adds request keys to articles, media, and share links,
and a private `studio-publications` receipt collection. This and the historical
share-link migration extend an existing schema; they cannot bootstrap an empty
production database.
Development Payload schema synchronization also includes these fields.

For the existing PM2 deployment script, run `npx payload migrate --force` on the
server after pulling the code and before building/reloading the app. The Docker
entrypoint already runs migrations. Do not run the seed command on production;
it deletes existing articles and media.

## API

Authenticated `GET /api/studio` returns adapter identification, the latest 100
articles, categories, and authors. The initial connector uses English, the site's
configured locale. `GET /api/studio?published=<id>` confirms anonymous visibility.

`POST /api/studio` accepts:

- `action: publish`: multipart `payload` JSON with `requestId` and `article`, plus
  an optional `file` cover image (JPEG/PNG/WebP/AVIF, up to 20 MB). URL-encoded
  `payload` also works when using an existing cover ID. Article fields are
  `id` (optional existing article), `title`, `excerpt`, `content` (plain text),
  `cover_id`, `alt`, `category`, `author`, `tags` (comma separated), `credit`,
  `slug`, `seo_title`, and `seo_description`. A cover is required. The local-only
  `cover_file` identifier may be included for stable request fingerprints.
  Returns article ID, slug, `status: published`, and public URL.
- `action: link`: JSON with `requestId`, `articleId`, and optional `label`.
  Requires a published article. Returns a stable unique tracking URL for that
  request. Different destination requests produce different links.

Publication always sets `status: published`. New articles default to neither
Breaking nor Featured; existing articles keep their editorial flags. Custom
SEO values survive saves. If an existing article's body text is unchanged, its
Lexical document, including embeds, is retained. Edited plain text becomes
paragraphs.

Publication receipts survive subsequent article edits, allowing lost responses
to be reconciled without overwriting a newer article. Reusing a publication ID
with changed input returns a conflict. Request keys are scoped to the authenticated
CMS user. A tracking key must belong to the requested article, and tracked pages
use the untracked article URL as canonical.

## Validation

Offline route and SEO tests:

```sh
node --test test/studio.test.cjs
```

Real Payload/PostgreSQL integration uses a disposable database and temporary media.
It does not read `.env`, create website users in the normal database, or contact
Facebook. Port 55439 must be free. Run once per fresh container:

```sh
docker run --rm -d --name website-studio-test-db --memory=512m -p 127.0.0.1:55439:5432 -e POSTGRES_USER=studio_test -e POSTGRES_PASSWORD=studio-test-only -e POSTGRES_DB=studio_test postgres:15-alpine
docker exec website-studio-test-db pg_isready -U studio_test
npx tsx test/studio.integration.ts
docker stop website-studio-test-db
```

The integration test checks migration down/up against an isolated Payload schema,
login, actual image upload, published article/SEO, distinct links, repeated requests,
and the article catalog. It also serves the real API on port 55440 and runs the
sibling Python connector using its schema example. The sibling local worker
checkout and its Python virtual environment are required for that probe. Both
test ports must be free.
No application build is required for these tests.
