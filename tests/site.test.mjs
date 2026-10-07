import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { loadContent, renderMarkdown, articleWordCount, build } from '../scripts/build.mjs';
import { initialState, stepMachine } from '../assets/hilbert-machine.mjs';

const root = resolve(import.meta.dirname, '..');
const content = await loadContent();
const outputs = await build();

test('original blog archive is byte-for-byte unchanged', async () => {
  const original = await readFile(resolve(root, 'json/blogs.json'));
  assert.equal(createHash('sha256').update(original).digest('hex'), 'ab80b5fa17e63d44e8ba52cb262e228860a71e627f83667e2bbdbe384a59e80e');
});

test('all seven original posts are retained with original full titles, dates and Markdown', async () => {
  const originalArchive = JSON.parse(await readFile(resolve(root, 'json/blogs.json'), 'utf8'));
  const originals = content.posts.filter(post => post.archived);
  assert.equal(originals.length, 7);
  assert.deepEqual(originals.map(post => post.id).sort(), Object.keys(originalArchive).sort());
  for (const post of originals) {
    const original = JSON.parse(await readFile(resolve(root, `json/${post.id}.json`), 'utf8'));
    assert.equal(post.md, original.md);
    assert.equal(post.title, original.title);
    assert.equal(post.date, original.date);
    const html = outputs.get(`blog/${post.slug}/index.html`);
    assert.ok(html.includes(renderMarkdown(original.md).body));
    assert.ok(html.includes(`<h1>${post.title}</h1>`));
    assert.ok(html.includes(`datetime="${post.date.split(' ')[0]}"`));
  }
});

test('new authored article is substantial, separately sourced and correctly dated', () => {
  const authored = content.posts.filter(post => !post.archived);
  assert.equal(authored.length, 1);
  const post = authored[0];
  assert.equal(post.date, '2026-10-07 12:00');
  assert.ok(post.words >= 2800 && post.words <= 3500, `${post.words} words`);
  assert.equal(post.words, articleWordCount(post.md));
  assert.equal(post.minutes, Math.ceil(post.words / 200));
  assert.ok(post.minutes >= 14 && post.minutes <= 18);
  assert.equal(content.posts[0].id, post.id);
  const html = outputs.get(`blog/${post.slug}/index.html`);
  assert.ok(html.includes('New writing · Source and proof-status check: 7 October 2026.'));
  assert.ok(!html.includes('Originally published in 2018'));
  assert.ok(outputs.get('index.html').includes(`/blog/${post.slug}/`));
  assert.ok(html.includes('model-generated'));
  assert.ok(html.includes('does <strong>not</strong> establish many-one completeness'));
});

test('reading time excludes bibliography, code and component tokens', () => {
  assert.equal(articleWordCount('One two.\n\n:::figure register\n\n{{math:height}}\n\n```js\nignored code\n```\n\n## References\n\nMany excluded words.'), 2);
});

test('math and semantic explanations are static, scoped and explicitly opt-in', () => {
  const post = content.posts.find(post => !post.archived);
  const html = outputs.get(`blog/${post.slug}/index.html`);
  assert.equal((html.match(/<figure /g) || []).length, 4);
  assert.ok((html.match(/<math /g) || []).length >= 10);
  assert.ok(!html.includes('{{math:'));
  assert.ok(!html.includes(':::figure'));
  assert.ok(html.includes('aria-live="polite" aria-atomic="true"'));
  assert.ok(html.includes('works without JavaScript'));
  assert.ok(html.includes('not an implemented oracle'));
  assert.ok(html.includes('/assets/hilbert.css'));
  assert.ok(html.includes('/assets/hilbert.js'));
  for (const archived of content.posts.filter(post => post.archived)) {
    const old = outputs.get(`blog/${archived.slug}/index.html`);
    assert.ok(!old.includes('/assets/hilbert.'));
    assert.ok(old.includes('Originally published in 2018'));
  }
  const plain = renderMarkdown('{{math:height}}\n\n:::figure register').body;
  assert.ok(!plain.includes('<math'));
  assert.ok(!plain.includes('<figure'));
});

test('trusted components do not enable arbitrary HTML, unknown math or unsafe URLs', () => {
  const rendered = renderMarkdown('<script>bad()</script>\n\n[bad](javascript:alert)\n\n{{math:height}}', { features: 'hilbert' }).body;
  assert.ok(!rendered.includes('<script>'));
  assert.ok(!rendered.includes('href="javascript:'));
  assert.ok(rendered.includes('<math'));
  assert.throws(() => renderMarkdown('{{math:unknown}}', { features: 'hilbert' }), /Unknown article math/);
  assert.throws(() => renderMarkdown('{{math:constructor}}', { features: 'hilbert' }), /Unknown article math/);
  assert.throws(() => renderMarkdown(':::figure unknown\n', { features: 'hilbert' }), /Unknown article figure/);
  const code = renderMarkdown('```text\n{{math:height}}\n:::figure register\n```', { features: 'hilbert' }).body;
  assert.ok(!code.includes('<math'));
  assert.ok(!code.includes('<figure'));
});

test('article references, section links and component IDs are valid and unique', () => {
  const post = content.posts.find(post => !post.archived);
  const html = outputs.get(`blog/${post.slug}/index.html`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), target);
  for (const [, target] of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of target.split(' ')) assert.ok(ids.includes(id), id);
  }
  for (let i = 1; i <= 15; i++) {
    assert.ok(html.includes(`id="r${i}"`));
    assert.ok(html.includes(`href="#r${i}"`));
  }
  const { headings } = renderMarkdown(post.md, post);
  assert.ok(headings.every(heading => !/^R\d+$/.test(heading.text)), 'bibliography entries do not crowd the article TOC');
  const githubLinks = [...html.matchAll(/href="(https:\/\/github.com\/openai\/math\/[^\"]+)"/g)].map(match => match[1]);
  assert.equal(githubLinks.length, 5);
  assert.ok(githubLinks.every(url => url.includes('adc7f1241b42e322a6451854ab7e4b4c146bf78a')));
});

test('addition demonstration preserves natural registers and halts at the stated result', () => {
  let state = initialState();
  const expected = [[1,2,2],[0,3,2],[1,3,1],[0,4,1],[1,4,0],[0,5,0],[2,5,0],[2,5,0]];
  for (const [ip,r0,r1] of expected) {
    const previous = { ...state };
    state = stepMachine(state);
    assert.deepEqual([state.ip,state.r0,state.r1], [ip,r0,r1]);
    assert.ok(state.r0 >= 0 && state.r1 >= 0);
    assert.equal(state.steps, previous.steps + 1);
  }
  assert.equal(state.halted, true);
  assert.equal(stepMachine(state), state);
  assert.deepEqual(initialState(), { ip: 0, r0: 2, r1: 3, steps: 0, halted: false });
  assert.deepEqual(stepMachine({ ip: 0, r0: 7, r1: 0, steps: 0, halted: false }), { ip: 2, r0: 7, r1: 0, steps: 1, halted: false });
});

test('canonical and legacy direct article routes have the same complete content', () => {
  for (const post of content.posts) {
    const canonical = outputs.get(`blog/${post.slug}/index.html`);
    assert.equal(outputs.get(`blog/post/${post.id}/index.html`), canonical);
    assert.equal(outputs.get(`post/${post.id}/index.html`), canonical);
    assert.ok(outputs.get('blog/index.html').includes(`data-post-id="${post.id}"`));
    assert.ok(canonical.includes(`${content.site.url}/blog/${post.slug}/`));
  }
});

test('all blog cards show the exact original article title', () => {
  const archive = outputs.get('blog/index.html');
  for (const post of content.posts) assert.ok(archive.includes(`<h3>${post.title}</h3>`), post.title);
  assert.ok(!archive.includes('class="post-index"'));
  assert.ok(archive.includes('data-reference-card'));
});

test('the hero identifies the engineer and current CV role without an availability indicator', () => {
  const html = outputs.get('index.html');
  assert.ok(html.includes('<p class="hero-name">Yiping Deng</p>'));
  assert.ok(html.includes('Tech Lead II · AI Data · HubSpot'));
  assert.ok(!html.includes('class="status-dot"'));
  assert.ok(html.includes('Selected impact'));
});

test('responsive line breaks retain a space between the blog introduction sentences', () => {
  assert.ok(outputs.get('blog/index.html').includes('underneath. <br>A small archive'));
});

test('article sidebar only shows a table of contents when the post has real headings', () => {
  const withoutHeadings = outputs.get('blog/react-with-higher-order-component/index.html');
  assert.ok(!withoutHeadings.includes('On this page'));
  assert.ok(!withoutHeadings.includes('A short read, start to finish.'));
  assert.ok(withoutHeadings.includes('About the author'));
  const withHeadings = outputs.get('blog/complexity-and-correctness/index.html');
  assert.ok(withHeadings.includes('On this page'));
  assert.ok(withHeadings.includes('href="#complexity"'));
  assert.ok(withHeadings.includes('href="#correctness"'));
});

test('CV download is the exact supplied PDF and is linked from every page', async () => {
  const pdf = await readFile(resolve(root, 'downloads/Yiping_Deng_Resume.pdf'));
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), 'b32759cc018f55f4a8e1e417ef14c0d5614e8577984f599b022dcfe09b0258cf');
  for (const [path, html] of outputs) {
    if (path.endsWith('.html')) assert.ok(html.includes('href="/downloads/Yiping_Deng_Resume.pdf" download="Yiping_Deng_Resume.pdf"'), path);
  }
});

test('the portfolio contains every CV role, skill and the supplied publication', () => {
  const html = outputs.get('index.html');
  for (const job of content.profile.experience) assert.ok(html.includes(job.role), job.role);
  for (const group of content.profile.skills) for (const skill of group.items) assert.ok(html.includes(skill), skill);
  assert.ok(html.includes(content.profile.publication.title));
  for (const outdated of ['undergraduate student', 'Ubimax GmbH', 'y.deng@jacobs-university.de', '95%']) assert.ok(!html.includes(outdated), outdated);
});

test('Say hello opens LinkedIn while the separate email link remains available', () => {
  const html = outputs.get('index.html');
  assert.ok(html.includes(`href="${content.profile.linkedin}" target="_blank" rel="noopener noreferrer">Say hello`));
  assert.ok(!html.includes(`href="mailto:${content.profile.email}">Say hello`));
  assert.ok(html.includes(`<div class="contact-email"><a href="mailto:${content.profile.email}">`));
});

test('six curated public projects render as accessible static repository links', () => {
  const html = outputs.get('index.html');
  assert.equal(content.projects.length, 6);
  assert.equal(new Set(content.projects.map(project => project.repository)).size, 6);
  assert.equal((html.match(/class="project-card"/g) || []).length, 6);
  assert.ok(html.includes('id="projects" aria-labelledby="projects-title"'));
  for (const project of content.projects) {
    assert.equal(project.url, `https://github.com/DengYiping/${project.repository}`);
    assert.ok(html.includes(`data-project="${project.repository}"`));
    assert.ok(html.includes(`<h3>${project.title}</h3>`));
    assert.ok(html.includes(`href="${project.url}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(html.includes(project.description));
    for (const tag of project.tags) assert.ok(html.includes(`<li>${tag}</li>`));
  }
});

test('project experiments are distinct from CV work and builds do not query GitHub', async () => {
  const html = outputs.get('index.html');
  assert.ok(html.includes('GPU learning lab'));
  assert.ok(html.includes('Hardware experiment'));
  assert.ok(html.includes('outside the day job'));
  assert.ok(html.indexOf('id="projects"') < html.indexOf('id="experience-title"'));
  const source = await readFile(resolve(root, 'scripts/build.mjs'), 'utf8');
  assert.ok(source.includes("'content/projects.json'"));
  assert.ok(!source.includes('fetch('));
});

test('all static local links and asset references resolve, including article illustrations', async () => {
  for (const [path, html] of outputs) {
    if (!path.endsWith('.html')) continue;
    for (const [, value] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      if (!value.startsWith('/') || value.startsWith('//')) continue;
      const local = value.split(/[?#]/)[0];
      const file = resolve(root, '.' + local, local.endsWith('/') ? 'index.html' : '');
      assert.ok((await stat(file)).isFile(), `${path} → ${local}`);
    }
  }
});

test('Markdown code is text, raw HTML cannot execute, and unsafe protocols are rejected', () => {
  const { body } = renderMarkdown('```js\n<script>alert(1)</script>\n```\n\n<script>alert(2)</script>\n\n[bad](javascript:alert)\n\n![bad](data:text/html,bad)');
  assert.ok(body.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!body.includes('<script>'));
  assert.ok(!body.includes('href="javascript:'));
  assert.ok(!body.includes('src="data:'));
});

test('article heading anchors remain unique', () => {
  const { headings, body } = renderMarkdown('## A heading\n\nFirst.\n\n## A heading\n\nSecond.');
  assert.deepEqual(headings.map(heading => heading.id), ['a-heading', 'a-heading-2']);
  assert.ok(body.includes('id="a-heading-2"'));
});

test('the feed and sitemap enumerate every article and use the configured domain', () => {
  for (const post of content.posts) {
    const url = `${content.site.url}/blog/${post.slug}/`;
    assert.ok(outputs.get('feed.xml').includes(url));
    assert.ok(outputs.get('sitemap.xml').includes(url));
  }
  assert.ok(!outputs.get('sitemap.xml').includes('/post/'));
  assert.ok(!outputs.get('sitemap.xml').includes('dengyiping.github.io'));
  for (const [path, html] of outputs) {
    if (!path.endsWith('.html')) continue;
    if (path !== '404.html') assert.ok(html.includes(`<link rel="canonical" href="${content.site.url}/`), path);
    assert.ok(!html.includes('https://dengyiping.github.io'), path);
  }
  assert.ok(outputs.get('robots.txt').includes(`${content.site.url}/sitemap.xml`));
});

test('pages render their content without JavaScript or old React/CDN assets', () => {
  for (const [path, html] of outputs) {
    if (!path.endsWith('.html')) continue;
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    assert.ok(html.includes('<main id="main">'), path);
    assert.ok(!html.includes('<div id="root">'), path);
    assert.ok(!html.includes('ajax.googleapis.com'), path);
    assert.ok(!html.includes('/static/js/main.'), path);
    assert.ok(!html.includes('google-analytics'), path);
  }
});

test('old caching workers are retired, not re-registered', async () => {
  const js = await readFile(resolve(root, 'assets/site.js'), 'utf8');
  assert.ok(!js.includes('serviceWorker.register('));
  assert.equal(outputs.get('service-worker.js'), outputs.get('blog/service-worker.js'));
  assert.ok(outputs.get('service-worker.js').includes('self.registration.unregister()'));
  assert.ok(!outputs.get('service-worker.js').includes("addEventListener('fetch'"));
});

test('worker migration removes only its own cache and refreshes only portfolio pages', async () => {
  const worker = outputs.get('service-worker.js');
  for (const path of ['/', '/blog/']) {
    const scope = 'https://example.test' + path;
    const ownCache = 'sw-precache-v3-sw-precache-webpack-plugin-' + scope;
    const unrelatedCache = 'sw-precache-v3-sw-precache-webpack-plugin-https://example.test/another-app/';
    const deleted = [];
    const navigated = [];
    const callbacks = {};
    let unregistered = false;
    runInNewContext(worker, { URL, caches: { keys: async () => [ownCache, unrelatedCache, 'another-cache'], delete: async key => { deleted.push(key); } }, self: {
      addEventListener: (event, callback) => { callbacks[event] = callback; },
      skipWaiting: async () => {},
      registration: { scope, unregister: async () => { unregistered = true; } },
      clients: { claim: async () => {}, matchAll: async () => ['/', '/blog/', '/another-app/', '/algorithm.html'].map(path => ({ url: 'https://example.test' + path, navigate: async url => { navigated.push(url); } })) }
    } });
    let completed;
    callbacks.activate({ waitUntil: promise => { completed = promise; } });
    await completed;
    assert.deepEqual(deleted, [ownCache]);
    assert.ok(unregistered);
    assert.ok(!navigated.some(url => url.includes('/another-app/')));
    assert.equal(navigated.length, path === '/' ? 3 : 1);
  }
});

test('algorithm study notes retain every original code block', async () => {
  const source = await readFile(resolve(root, 'content/algorithms-source.html'), 'utf8');
  const html = outputs.get('algorithm.html');
  const blocks = [...source.matchAll(/<pre\b[\s\S]*?<\/pre>/g)].map(match => match[0]);
  assert.ok(blocks.length > 0);
  for (const block of blocks) assert.ok(html.includes(block));
  assert.ok(!html.includes('MathJax.js'));
});
