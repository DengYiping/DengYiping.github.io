import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { loadContent } from './build.mjs';

const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const { posts } = await loadContent();
const routes = ['/', '/blog/', '/algorithm.html', '/feed.xml', '/sitemap.xml', '/robots.txt', '/assets/site.css', '/assets/site.js', '/assets/social-card.png', '/assets/favicon.svg', '/service-worker.js', '/blog/service-worker.js', ...posts.flatMap(post => [`/blog/${post.slug}/`, `/blog/post/${post.id}/`, `/post/${post.id}/`])];
for (const route of routes) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  assert.ok((await response.arrayBuffer()).byteLength > 0, route);
}
const pdf = await fetch(origin + '/downloads/Yiping_Deng_Resume.pdf');
assert.equal(pdf.status, 200);
assert.equal(pdf.headers.get('content-type'), 'application/pdf');
assert.equal(createHash('sha256').update(Buffer.from(await pdf.arrayBuffer())).digest('hex'), 'b32759cc018f55f4a8e1e417ef14c0d5614e8577984f599b022dcfe09b0258cf');
const missing = await fetch(origin + '/missing-page');
assert.equal(missing.status, 404);
assert.ok((await missing.text()).includes('This thread'));
const privateFile = await fetch(origin + '/.git/config');
assert.equal(privateFile.status, 404);
const redirect = await fetch(origin + '/blog', { redirect: 'manual' });
assert.equal(redirect.status, 301);
assert.equal(new URL(redirect.headers.get('location'), origin).href, new URL('/blog/', origin).href);
console.log(`HTTP checks passed: ${routes.length} routes, exact CV bytes, 404, private paths, and directory redirect.`);
