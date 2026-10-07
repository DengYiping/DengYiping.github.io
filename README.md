# Loudcoder

Yiping Deng’s portfolio and engineering notebook. Static HTML, self-hosted fonts,
and small progressive enhancements. No runtime framework, analytics, CDN, API,
or dependency installation is required. GitHub Pages can serve this repository
directly; generated pages are included.

## Work locally

Use Node.js 20.11 or newer:

```sh
npm run build
npm test
npm run dev
```

Open `http://127.0.0.1:4173`. The preview server is local-only. Rebuild after
editing content or templates, then refresh the browser. `PORT` can override the
preview port.

With the preview server running, `node scripts/check-http.mjs` checks the served
pages, assets, PDF bytes, 404 response, and directory redirects. `npm test`
includes preservation snapshots for the original archive and supplied CV; update
the expected CV digest in the tests when intentionally replacing the PDF.

## Editing

- `content/profile.json`: CV-aligned biography, impact, experience, and skills.
- `content/projects.json`: curated public GitHub projects, with descriptions and
  technology tags checked against their READMEs and source. Learning labs and
  experiments are separate from CV work. Builds use this local data and do not
  call GitHub or depend on an API token.
- `downloads/Yiping_Deng_Resume.pdf`: the original downloadable CV. Replace this
  file when updating the CV; also update the portfolio data.
- `json/blogs.json` and `json/*.json`: the seven original blog posts, unchanged.
  To add a post, add it to the index and a corresponding per-post JSON file.
- `content/posts.json`: slugs, topics, short display titles, and summaries. Full
  articles retain their original titles, dates, Markdown, and code.
- `scripts/templates.mjs`: shared page layouts and portfolio templates.
- `assets/site.css` and `assets/site.js`: design and progressive enhancements.
- `content/algorithms-source.html`: preserved original study notes. Only the
  content is included in the redesigned `algorithm.html`.

`npm run build` regenerates the homepage, archive, articles, legacy route aliases,
study notes, 404 page, RSS feed, sitemap, robots file, and retiring service workers.
Commit those generated files along with your source changes. The vendored Marked
17.0.5 parser is build-time only; its MIT license is in `assets/vendor/`.

Legacy links such as `/blog/#/post/React_With_Higher_Order_Component` still resolve
to the appropriate article. Direct `/blog/post/<original-id>/` and
`/post/<original-id>/` links are also supported. The retiring worker endpoints
remove only this site’s old Create React App caches, so returning visitors can
see the redesign.

## Publishing

`.github/workflows/pages.yml` publishes to the existing GitHub Pages site on
pushes to `master`, or through a manual workflow run. It rebuilds the static site
and runs the preservation tests with Node.js 24 before uploading and deploying.
The official GitHub actions are pinned to reviewed release commit hashes.

The Pages publishing source is GitHub Actions. This does not change repository
visibility, the public site address, or the custom-domain settings. Local builds
and feature-branch commits alone do not publish; push reviewed changes to
`master` to deploy them.

## Custom domain: loudcoder.com

The canonical origin in `site.config.json` is `https://loudcoder.com`. Builds use
it for canonical URLs, sharing metadata, RSS, and the sitemap. `SITE_URL` can
override the origin for a build.

GitHub Pages recognizes `loudcoder.com` as the custom domain. Cloudflare manages
DNS, with CNAME records for the apex (`@`) and `www` pointing to
`dengyiping.github.io`. Cloudflare can proxy both records after GitHub has issued
its HTTPS certificate. Use Full (strict) encryption for the origin connection.
When diagnosing GitHub DNS or certificate provisioning, temporarily make these
records DNS-only so GitHub's validation can see its origin records directly.

This repository uses GitHub Actions publishing; a `CNAME` file is not required
by that publishing method. The existing file is retained from the domain setup.
Keep the Pages publishing source set to GitHub Actions to avoid running a
competing branch-based deployment.

No DNS changes, deployment, or GitHub settings changes are made by local builds.

## Publication note

The portfolio’s roles and figures come from the supplied CV. The downloadable
PDF is unmodified and includes the contact details from that document.
