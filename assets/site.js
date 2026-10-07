document.documentElement.classList.add('has-js');

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
function closeMenu(returnFocus = false) {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
  if (returnFocus) menu.focus();
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

// Retain the old React HashRouter addresses, without loading the old bundles.
function resolveLegacyPost() {
  if (!location.hash.startsWith('#/post/')) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(7)); } catch { return; }
  const original = [...document.querySelectorAll('[data-post-id]')].find(link => link.dataset.postId === id);
  if (original) location.replace(original.href);
}
resolveLegacyPost();
window.addEventListener('hashchange', resolveLegacyPost);

const cards = [...document.querySelectorAll('[data-post-card]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#post-search');
let selected = 'all';
function filterPosts() {
  const query = (search?.value || '').trim().toLowerCase();
  let count = 0;
  for (const card of cards) {
    const visible = (selected === 'all' || card.dataset.category === selected) && card.dataset.search.includes(query);
    card.hidden = !visible;
    if (visible) count++;
  }
  const status = document.querySelector('#archive-count');
  if (status) status.textContent = `${count} ${count === 1 ? 'article' : 'articles'}`;
  const empty = document.querySelector('#empty-state');
  if (empty) empty.hidden = count !== 0;
  const reference = document.querySelector('[data-reference-card]');
  if (reference) reference.hidden = selected !== 'all' || query !== '';
}
filters.forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  filterPosts();
}));
search?.addEventListener('input', filterPosts);
document.querySelector('#reset-filters')?.addEventListener('click', () => {
  search.value = '';
  selected = 'all';
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === 'all')));
  filterPosts();
  search.focus();
});

document.querySelectorAll('.copy-code').forEach(button => {
  let reset;
  button.addEventListener('click', async () => {
    clearTimeout(reset);
    const code = button.closest('.code-block').querySelector('code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Copied!';
      button.setAttribute('aria-label', 'Code copied');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Select & copy';
      button.setAttribute('aria-label', 'Code selected; use your keyboard to copy');
    }
    reset = setTimeout(() => { button.textContent = 'Copy'; button.setAttribute('aria-label', 'Copy code'); }, 2200);
  });
});

const progress = document.querySelector('.reading-progress');
const article = document.querySelector('.article-layout');
if (progress && article) {
  let ticking = false;
  function updateProgress() {
    const start = article.offsetTop - 100;
    const end = article.offsetTop + article.offsetHeight - innerHeight;
    const value = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
    progress.style.width = `${value * 100}%`;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// Retire only this site's old Create React App service workers/caches.
// Do not touch unrelated registrations or register a new caching worker.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(async registrations => {
    const oldPaths = new Set(['/service-worker.js', '/blog/service-worker.js']);
    const oldScopes = new Set(['/', '/blog/'].map(path => new URL(path, location.origin).href));
    await Promise.all(registrations.filter(registration => {
      const worker = registration.active || registration.waiting || registration.installing;
      if (!worker) return false;
      const url = new URL(worker.scriptURL);
      return url.origin === location.origin && oldPaths.has(url.pathname) && oldScopes.has(registration.scope);
    }).map(registration => registration.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      const oldCaches = new Set([...oldScopes].map(scope => `sw-precache-v3-sw-precache-webpack-plugin-${scope}`));
      await Promise.all(keys.filter(key => oldCaches.has(key)).map(key => caches.delete(key)));
    }
  }).catch(() => { /* Static content remains usable if browser storage is unavailable. */ });
}
