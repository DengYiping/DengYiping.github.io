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

## Later: loudcoder.com

The visual identity is already Loudcoder. The canonical URL currently remains
`https://dengyiping.github.io` until the domain is actually connected.

When you are ready:

1. Configure `loudcoder.com` as the repository’s custom domain in GitHub Pages
   and point its DNS to GitHub Pages using GitHub’s then-current instructions.
2. Retain the `CNAME` file GitHub creates (or add one containing the chosen
   domain). No `CNAME` is included yet, so this rewrite does not switch domains.
3. Change `url` in `site.config.json` to `https://loudcoder.com`, without a
   trailing slash, and run `npm run build`. This updates canonical URLs, sharing
   metadata, RSS, and the sitemap together. `SITE_URL` can also override the
   origin for a build.
4. Publish the updated files, enable HTTPS in Pages once available, and verify
   the homepage, article URLs, and PDF on the connected domain.

No DNS changes, deployment, or GitHub settings changes are made by local builds.

## Publication note

The portfolio’s roles and figures come from the supplied CV. The downloadable
PDF is unmodified and includes the contact details from that document.
