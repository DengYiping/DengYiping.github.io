import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Marked } from '../assets/vendor/marked.mjs';
import { layout, home, archive, article, notes, escape } from './templates.mjs';

const root = resolve(import.meta.dirname, '..');
const readJSON = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
export async function loadContent() {
  const [site, profile, original, metadata] = await Promise.all(['site.config.json', 'content/profile.json', 'json/blogs.json', 'content/posts.json'].map(readJSON));
  if (process.env.SITE_URL) site.url = process.env.SITE_URL;
  const origin = new URL(site.url);
  if (origin.protocol !== 'https:' || origin.origin !== site.url) throw new Error('Site URL must be an HTTPS origin without a trailing slash or path.');
  const posts = Object.entries(original).map(([id, post]) => {
    const extra = metadata[id];
    if (!extra || !/^[a-z0-9-]+$/.test(extra.slug)) throw new Error(`Missing or invalid metadata for ${id}`);
    return { ...post, ...extra, id, minutes: Math.max(1, Math.ceil(post.md.split(/\s+/).length / 200)) };
  }).sort((a, b) => b.date.localeCompare(a.date));
  if (new Set(posts.map(post => post.slug)).size !== posts.length) throw new Error('Post slugs must be unique.');
  return { site, profile, posts };
}

// Only repository-owned Markdown is rendered at build time, never visitor input.
// Raw HTML is escaped, and image/link protocols are constrained.
export function renderMarkdown(markdown) {
  const headings = [];
  const usedIds = new Set();
  const parser = new Marked({ gfm: true, breaks: false });
  const safeURL = value => /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(value) ? value : '#';
  parser.use({ renderer: {
    html({ text }) { return escape(text); },
    heading({ tokens, depth }) {
      const text = tokens.map(token => token.text || token.raw).join('');
      const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      let id = base;
      let suffix = 2;
      while (usedIds.has(id)) id = `${base}-${suffix++}`;
      usedIds.add(id);
      if (depth <= 3) headings.push({ id, text });
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    link({ href, title, tokens }) {
      const url = safeURL(href);
      return `<a href="${escape(url)}"${title ? ` title="${escape(title)}"` : ''}${/^https?:\/\//.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, title, text }) {
      const url = safeURL(href);
      return `<img src="${escape(url)}" alt="${escape(text || 'Diagram from the original article')}"${title ? ` title="${escape(title)}"` : ''} loading="lazy">`;
    },
    code({ text, lang }) {
      return `<div class="code-block"><div class="code-toolbar"><span>${escape(lang || 'code')}</span><button type="button" class="copy-code" aria-label="Copy code">Copy</button></div><pre><code${lang ? ` class="language-${escape(lang.split(/\s/)[0])}"` : ''}>${escape(text)}</code></pre></div>\n`;
    }
  } });
  return { body: parser.parse(markdown), headings };
}

export async function build() {
  const content = await loadContent();
  const { site, profile, posts } = content;
  const outputs = new Map();
  const page = options => layout({ site, profile, ...options });
  outputs.set('index.html', page({ title: 'Yiping Deng — AI & Data Infrastructure · Loudcoder', content: home(content), schema: { '@context': 'https://schema.org', '@type': 'Person', name: profile.name, jobTitle: profile.role, url: site.url, sameAs: [profile.github, profile.linkedin], worksFor: { '@type': 'Organization', name: profile.company } } }));
  outputs.set('blog/index.html', page({ title: 'Writing — Loudcoder', description: 'Yiping Deng’s engineering notebook: algorithms, functional programming, React, and mathematical research.', path: '/blog/', active: 'writing', content: archive(content) }));
  for (const post of posts) {
    const rendered = renderMarkdown(post.md);
    const related = posts.filter(other => other.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
    const path = `/blog/${post.slug}/`;
    const html = page({ title: `${post.title} — Loudcoder`, description: post.summary, path, active: 'writing', type: 'article', content: article({ post, ...rendered, related }), schema: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, datePublished: post.date.replace(' ', 'T'), author: { '@type': 'Person', name: profile.name, url: site.url }, mainEntityOfPage: site.url + path } });
    outputs.set(`blog/${post.slug}/index.html`, html);
    // Old direct routes remain usable on static hosting. Hash routes are handled
    // progressively in site.js using the archive's original post identifiers.
    outputs.set(`blog/post/${post.id}/index.html`, html);
    outputs.set(`post/${post.id}/index.html`, html);
  }
  const source = await readFile(resolve(root, 'content/algorithms-source.html'), 'utf8');
  const notesBody = source.match(/<div id="content">([\s\S]*?)<div id="postamble"/)[1].replace(/<\/div>\s*$/, '').replace('\\(O(n \\log n) \\)', '<span class="math">O(n log n)</span>');
  outputs.set('algorithm.html', page({ title: 'Algorithms & Data Structures — Loudcoder', description: 'Yiping Deng’s archived algorithms and data structures study notes, with code examples.', path: '/algorithm.html', active: 'writing', content: notes(notesBody) }));
  outputs.set('404.html', page({ title: 'Page not found — Loudcoder', path: '/404.html', noindex: true, content: `<section class="not-found container"><p class="eyebrow">404 / A missing connection</p><h1>This thread<br>ends here.</h1><p>The page may have moved. There’s plenty more to explore.</p><div class="hero-actions"><a class="button button-dark" href="/">Back home →</a><a class="text-link" href="/blog/">Browse the notebook →</a></div></section>` }));
  outputs.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/blog/', '/algorithm.html', ...posts.map(post => `/blog/${post.slug}/`)].map(path => `<url><loc>${escape(site.url + path)}</loc></url>`).join('')}</urlset>\n`);
  outputs.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  const retirementWorker = await readFile(resolve(root, 'scripts/retire-worker.js'), 'utf8');
  outputs.set('service-worker.js', retirementWorker);
  outputs.set('blog/service-worker.js', retirementWorker);
  outputs.set('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Loudcoder — Yiping Deng</title><link>${site.url}/blog/</link><description>Notes on code, computer science, and the ideas underneath.</description><language>en</language><atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>${posts.map(post => `<item><title>${escape(post.title)}</title><link>${site.url}/blog/${post.slug}/</link><guid isPermaLink="true">${site.url}/blog/${post.slug}/</guid><pubDate>${new Date(post.date.replace(' ', 'T') + ':00Z').toUTCString()}</pubDate><description>${escape(post.summary)}</description></item>`).join('')}</channel></rss>\n`);
  for (const [path, html] of outputs) {
    const target = resolve(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  console.log(`Built ${outputs.size} files. Preserved ${posts.length} original articles. Site: ${site.url}`);
  return outputs;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await build();
