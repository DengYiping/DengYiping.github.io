export const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const paths = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  right: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  nodes: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4H5v4m7-4h7v4"/>',
  signal: '<path d="M2 12h4l3-8 6 16 3-8h4"/>',
  menu: '<path d="M4 7h16M4 17h16"/>',
  book: '<path d="M12 5v16M3 3h3a6 6 0 0 1 6 3 6 6 0 0 1 6-3h3v16h-3a6 6 0 0 0-6 2 6 6 0 0 0-6-2H3V3Z"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  code: '<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18"/>'
};
export const icon = (name, className = '') => `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
export const dateLabel = date => new Date(`${date.split(' ')[0]}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const tags = items => `<ul class="tags" aria-label="Technologies">${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
const brand = `<a class="brand" href="/" aria-label="Loudcoder home"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M3 11v6M8.5 6v16M14 2v24M19.5 8v12M25 11v6"/></svg><span>loudcoder<span class="brand-dot">.</span></span></a>`;

export function layout({ site, profile, title, description = site.description, path = '/', active = '', content, type = 'website', schema, noindex = false }) {
  const canonical = site.url + path;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f8f2">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${escape(canonical)}">`}
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Loudcoder">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(canonical)}">
  <meta property="og:image" content="${escape(site.url)}/assets/social-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Loudcoder — Yiping Deng. Making AI work. At scale.">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="Loudcoder writing" href="/feed.xml">
  <link rel="stylesheet" href="/assets/site.css">
  <script src="/assets/site.js" defer></script>
${schema ? `  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      ${brand}
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation">${icon('menu')}</button>
      <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <a href="/#work">Work</a>
        <a href="/#about">About</a>
        <a href="/blog/"${active === 'writing' ? ' aria-current="page"' : ''}>Writing</a>
        <a class="nav-cv" href="${site.cv}" download="Yiping_Deng_Resume.pdf">Download CV ${icon('download')}</a>
      </nav>
    </div>
  </header>
  <main id="main">${content}</main>
  <footer class="site-footer">
    <div class="container footer-main">
      <div>${brand}<p>Good systems. Curious mind.</p></div>
      <div class="footer-links"><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ${icon('arrow')}</a><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ${icon('arrow')}</a><a href="mailto:${profile.email}">Email ${icon('arrow')}</a></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getUTCFullYear()} ${escape(profile.name)}</span><span>Built with care. Based in Dublin.</span><a href="#main">Back to top ↑</a></div>
  </footer>
</body>
</html>
`;
}

export function postCard(post) {
  return `<article class="post-card" data-post-card data-category="${escape(post.category)}" data-search="${escape((post.title + ' ' + post.shortTitle + ' ' + post.summary + ' ' + post.category).toLowerCase())}">
    <a class="post-card-link" href="/blog/${post.slug}/" data-post-id="${escape(post.id)}">
      <div class="post-card-top"><span class="eyebrow">${escape(post.category)}</span></div>
      <h3>${escape(post.title)}</h3><p>${escape(post.summary)}</p>
      <div class="post-card-bottom"><span><time datetime="${post.date.split(' ')[0]}">${dateLabel(post.date)}</time><span class="meta-dot">·</span>${post.minutes} min read</span>${icon('arrow')}</div>
    </a>
  </article>`;
}

function systemMap() {
  return `<div class="system-card">
    <div class="system-card-header"><span class="eyebrow">A builder’s perspective</span><span class="system-card-index">Fig. 01</span></div>
    <div class="system-card-title">Behind every intelligent app,<br>there’s a <em>good system.</em></div>
    <svg class="system-map" viewBox="0 0 420 310" role="img" aria-labelledby="system-title system-desc">
      <title id="system-title">The building blocks of AI infrastructure</title><desc id="system-desc">AI applications connect to vector search, compute, and observability, built on a shared data platform.</desc>
      <defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#739482" opacity=".35"/></pattern></defs>
      <rect width="420" height="310" fill="url(#dots)"/>
      <g fill="none" stroke="#61806e" stroke-width="1.2"><path d="M210 91v41M70 157v-25h280v25M210 132v25M70 209v34h280v-34M210 209v52"/></g>
      <g class="map-packets" fill="#d5f29b"><circle cx="210" cy="116" r="3"/><circle cx="112" cy="132" r="3"/><circle cx="310" cy="243" r="3"/></g>
      <rect x="107" y="36" width="206" height="55" rx="6" fill="#d5f29b"/><text x="210" y="69" text-anchor="middle" fill="#173629" font-family="monospace" font-size="15">AI applications</text>
      <g fill="#224936" stroke="#61806e"><rect x="12" y="157" width="116" height="52" rx="5"/><rect x="152" y="157" width="116" height="52" rx="5"/><rect x="292" y="157" width="116" height="52" rx="5"/></g>
      <g text-anchor="middle" fill="#eef3e6" font-family="monospace" font-size="12"><text x="70" y="188">Vector search</text><text x="210" y="188">Compute</text><text x="350" y="188">Observability</text></g>
      <rect x="107" y="261" width="206" height="38" rx="5" fill="#143323" stroke="#61806e"/><text x="210" y="285" text-anchor="middle" fill="#b7c8b6" font-family="monospace" font-size="12">Data platform</text>
    </svg>
    <div class="system-card-footer"><span class="system-dot"></span><span>Data. Infrastructure. Intelligence.</span>${icon('code')}</div>
  </div>`;
}

const experienceItem = job => `<article class="experience-item${job.current ? ' is-current' : ''}">
  <div class="experience-period"><span>${escape(job.start)} — ${escape(job.end)}</span>${job.current ? '<span class="current-badge">Current</span>' : ''}</div>
  <div class="experience-content"><p class="company">${escape(job.company)} <span> / ${escape(job.location)}</span></p><h3>${escape(job.role)}</h3><ul>${job.bullets.map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul></div>
</article>`;

const projectCard = project => `<article class="project-card" data-project="${escape(project.repository)}">
  <a class="project-card-link" href="${escape(project.url)}" target="_blank" rel="noopener noreferrer">
    <div class="project-card-top"><span class="eyebrow">${escape(project.category)}</span>${icon('code')}</div>
    <h3>${escape(project.title)}</h3><p>${escape(project.description)}</p>${tags(project.tags)}
    <span class="project-card-footer">View on GitHub ${icon('arrow')}</span>
  </a>
</article>`;

export function home({ site, profile: p, posts, projects }) {
  const education = p.education;
  return `<section class="hero container" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="hero-name">${escape(p.name)}</p>
      <p class="eyebrow hero-eyebrow"><span class="identity-mark" aria-hidden="true"></span>${escape(p.role)} · ${escape(p.company)}</p>
      <h1 id="hero-title">Making AI work.<br><span>At scale.</span></h1>
      <p class="hero-intro">${escape(p.intro)}</p>
      <div class="hero-actions"><a class="button button-dark" href="#work">Explore my work ${icon('down')}</a><a class="text-link" href="${site.cv}" download="Yiping_Deng_Resume.pdf">Download CV ${icon('download')}</a></div>
      <div class="hero-caption"><span class="location-mark">✳</span><span>Based in Dublin, Ireland.<br><span>Building for the bigger picture.</span></span></div>
    </div>
    ${systemMap()}
  </section>
  <section class="metrics container" aria-label="Selected career impact"><div class="metrics-label eyebrow">Selected impact</div><div class="metrics-grid">${p.metrics.map(metric => `<div class="metric"><strong>${escape(metric.value)}</strong><span>${escape(metric.label)}</span><small>${escape(metric.detail)}</small></div>`).join('')}</div></section>
  <section class="section container" id="work" aria-labelledby="work-title">
    <div class="section-heading"><div><p class="eyebrow section-number">01 / What I build</p><h2 id="work-title">The foundations<br>behind the possibilities.</h2></div><p>Reliable platforms. Thoughtful abstractions.<br>Room for the next big idea.</p></div>
    <div class="focus-grid">${p.focus.map(item => `<article class="focus-card"><div class="focus-card-top"><span>${item.number}</span>${icon(item.icon)}</div><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p>${tags(item.tags)}</article>`).join('')}</div>
  </section>
  <section class="section container projects-section" id="projects" aria-labelledby="projects-title">
    <div class="section-heading"><div><p class="eyebrow section-number">Selected projects / GitHub</p><h2 id="projects-title">Built out of curiosity.</h2></div><a class="text-link" href="${escape(p.github)}?tab=repositories" target="_blank" rel="noopener noreferrer">All repositories ${icon('arrow')}</a></div>
    <p class="section-intro projects-intro">A few things I’ve built outside the day job — from GPU experiments and developer tools to useful little systems for everyday life.</p>
    <div class="project-grid">${projects.map(projectCard).join('')}</div>
  </section>
  <section class="section experience-section" aria-labelledby="experience-title"><div class="container">
    <div class="section-heading"><div><p class="eyebrow section-number">02 / The journey</p><h2 id="experience-title">Built over time.</h2></div><a class="text-link" href="${site.cv}" download="Yiping_Deng_Resume.pdf">The full CV ${icon('download')}</a></div>
    <div class="experience-list">${p.experience.slice(0, 4).map(experienceItem).join('')}<details class="earlier-experience"><summary>Earlier experience <span class="summary-meta">2018–2020</span><span class="summary-plus" aria-hidden="true">+</span></summary><div>${p.experience.slice(4).map(experienceItem).join('')}</div></details></div>
  </div></section>
  <section class="section container about-section" id="about" aria-labelledby="about-title">
    <div class="about-copy"><p class="eyebrow section-number">03 / A little about me</p><h2 id="about-title">Curiosity is<br>the common thread.</h2><p>${escape(p.about)}</p><p>I’m also a contributor to open-source infrastructure and a co-author of research in formal theorem proving. From mathematical foundations to production systems, I like understanding how things work — and making them work better.</p><a class="text-link" href="${p.github}" target="_blank" rel="noopener noreferrer">Find me on GitHub ${icon('arrow')}</a></div>
    <div class="about-details"><article class="education-card"><span class="eyebrow">Education / ${education.years}</span><h3>${education.degree}</h3><p class="education-minor">${education.minor}</p><p class="education-school">${education.school}</p><p>${escape(education.description)}</p></article><div class="skill-groups">${p.skills.map(group => `<div class="skill-group"><h3>${escape(group.label)}</h3>${tags(group.items)}</div>`).join('')}</div></div>
  </section>
  <section class="section container contributions" aria-labelledby="contributions-title"><div class="section-heading"><div><p class="eyebrow section-number">04 / Beyond the day job</p><h2 id="contributions-title">Shared with the community.</h2></div></div><div class="contribution-grid">
    <a class="contribution-card" href="${p.openSource.url}" target="_blank" rel="noopener noreferrer"><div class="contribution-top"><span class="eyebrow">Open source</span>${icon('arrow')}</div><h3>${p.openSource.title}</h3><p>${escape(p.openSource.description)}</p><span class="card-link-label">Explore the contributions</span></a>
    <a class="contribution-card" href="${p.publication.url}" target="_blank" rel="noopener noreferrer"><div class="contribution-top"><span class="eyebrow">Research / ${p.publication.date}</span>${icon('arrow')}</div><h3>${escape(p.publication.title)}</h3><p>${escape(p.publication.description)}</p><span class="card-link-label">Read the publication</span></a>
  </div></section>
  <section class="section writing-section" aria-labelledby="writing-title"><div class="container"><div class="section-heading"><div><p class="eyebrow section-number">05 / The notebook</p><h2 id="writing-title">Thinking out loud.</h2></div><a class="text-link" href="/blog/">All writing ${icon('right')}</a></div><p class="section-intro">Notes on code, computer science, and the ideas underneath. From the archive.</p><div class="post-grid">${posts.slice(0, 3).map(postCard).join('')}</div></div></section>
  <section class="contact-section container" id="contact" aria-labelledby="contact-title"><div><p class="eyebrow">Good things start with a conversation.</p><h2 id="contact-title">Let’s connect<span>.</span></h2><p>Talk systems, trade ideas, or just say hello.</p></div><a class="button button-dark" href="${escape(p.linkedin)}" target="_blank" rel="noopener noreferrer">Say hello ${icon('arrow')}</a><div class="contact-email"><a href="mailto:${p.email}">${p.email}</a><span>Dublin, Ireland</span></div></section>`;
}

export function archive({ posts }) {
  const categories = [...new Set(posts.map(post => post.category))];
  return `<section class="page-hero container"><p class="eyebrow section-number">The notebook</p><h1>Thinking<br><span>out loud.</span></h1><p>Notes on code, computer science, and the ideas underneath. <br>A small archive of things I’ve learned along the way.</p><div class="page-hero-foot"><span>${posts.length} articles · Since 2018</span><a class="text-link" href="/feed.xml">RSS feed ${icon('arrow')}</a></div></section>
  <section class="archive-section container" aria-labelledby="archive-title"><div class="archive-tools"><h2 class="sr-only" id="archive-title">All articles</h2><div class="filters" role="group" aria-label="Filter articles by topic"><button class="filter-button" type="button" data-filter="all" aria-pressed="true">All writing</button>${categories.map(category => `<button class="filter-button" type="button" data-filter="${escape(category)}" aria-pressed="false">${escape(category)}</button>`).join('')}</div><label class="search-field">${icon('search')}<span class="sr-only">Search articles</span><input id="post-search" type="search" placeholder="Find an idea…" autocomplete="off"></label></div>
  <p class="archive-count" id="archive-count" role="status">${posts.length} articles</p><div class="post-grid archive-grid">${posts.map(postCard).join('')}<a class="notes-link" href="/algorithm.html" data-reference-card><span class="notes-icon">${icon('book')}</span><div><span class="eyebrow">Reference notebook</span><h3>Algorithms & data structures</h3><p>A longer reference notebook of algorithms, examples, and study notes.</p></div>${icon('arrow')}</a></div><div class="empty-state" id="empty-state" hidden><h3>No articles found.</h3><p>Try another search or explore all the writing.</p><button class="button button-dark" type="button" id="reset-filters">Show all articles ${icon('right')}</button></div></section>`;
}

export function article({ post, body, related, headings }) {
  return `<div class="reading-progress" aria-hidden="true"></div><div class="container article-shell"><div class="article-breadcrumb"><a class="text-link" href="/blog/">← All writing</a><span class="eyebrow">${escape(post.category)}</span></div><header class="article-header"><h1>${escape(post.title)}</h1><div class="article-meta"><span class="author-monogram" aria-hidden="true">YD</span><span>Yiping Deng</span><span class="meta-dot">·</span><time datetime="${post.date.split(' ')[0]}">${dateLabel(post.date)}</time><span class="meta-dot">·</span><span>${post.minutes} min read</span></div><p class="archive-note">From the archive. Originally published in 2018; the article content is preserved.</p></header>
  <div class="article-layout"><article class="prose" aria-label="Article content">${body}</article><aside class="article-aside${headings.length ? ' has-contents' : ''}">${headings.length ? `<span class="eyebrow">On this page</span><nav aria-label="Article sections"><ul>${headings.map(heading => `<li><a href="#${escape(heading.id)}">${escape(heading.text)}</a></li>`).join('')}</ul></nav>` : ''}<div class="aside-author"><span class="eyebrow">About the author</span><p>Yiping Deng</p><span>Tech lead building AI & data infrastructure at HubSpot.</span><a class="text-link" href="/#about">More about me ${icon('arrow')}</a></div></aside></div>
  <div class="article-end"><span class="end-mark" aria-hidden="true">✳</span><p>Thanks for reading.</p><a class="text-link" href="/blog/">Back to the notebook ${icon('right')}</a></div></div>
  <section class="section related-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">Keep exploring</p><h2>Another thread to follow.</h2></div></div><div class="post-grid">${related.map(postCard).join('')}</div></div></section>`;
}

export function notes(body) {
  return `<div class="container article-shell notes-shell"><div class="article-breadcrumb"><a class="text-link" href="/blog/">← The notebook</a><span class="eyebrow">Study notes</span></div><header class="article-header"><h1>Algorithms &<br>data structures.</h1><div class="article-meta"><span>Yiping Deng</span><span class="meta-dot">·</span><time datetime="2018-09-08">8 Sep 2018</time></div><p class="archive-note">Original study notes, preserved from the archive.</p></header><article class="prose notes-prose">${body}</article></div>`;
}
