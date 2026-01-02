/**
 * content-loader.js
 *
 * Ładuje projekty i wpisy bloga z JSON:
 * - /data/projects.json
 * - /data/blog-posts.json
 *
 * Wspiera (jeśli elementy istnieją na stronie):
 * - filtrowanie po kategoriach (tab-button[data-category])
 * - wyszukiwanie (input#project-search, input#blog-search)
 * - filtrowanie po tagach (div#project-tag-filters, div#blog-tag-filters)
 */

document.addEventListener('DOMContentLoaded', () => {
  const isHomePage = document.querySelector('#featured-projects-container') !== null;
  const isProjectsPage = document.querySelector('#all-projects-container') !== null;
  const isBlogPage = document.querySelector('#all-blog-posts-container') !== null;

  if (isHomePage) {
    loadFeaturedProjects();
    loadFeaturedBlogPosts();
  }

  if (isProjectsPage) loadAllProjects();
  if (isBlogPage) loadAllBlogPosts();
});

// ---------- helpers ----------
function normalizePath(path) {
  if (!path) return '';
  const cleaned = String(path).replace(/^([.\/])+/, '').replace(/^(\.\.\/)+/, '');
  return cleaned.startsWith('/') ? cleaned : '/' + cleaned;
}

function asArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v === null || v === undefined || v === '') return [];
  return [v];
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function formatDatePL(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || '';
  return d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
}

function safeText(s) {
  return String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------- HOME ----------
async function loadFeaturedProjects() {
  const container = document.getElementById('featured-projects-container');
  if (!container) return;

  try {
    const projects = await fetchJson('/data/projects.json');

    // Sort: newest first
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Prefer featured if available
    const featured = projects.filter(p => p.featured === true);
    const picked = (featured.length >= 3 ? featured : projects).slice(0, 3);

    container.innerHTML = picked.map(renderProjectCard).join('');
  } catch (err) {
    console.error('loadFeaturedProjects error', err);
    container.innerHTML = renderDataError('projektów', err);
  }
}

async function loadFeaturedBlogPosts() {
  const container = document.getElementById('featured-posts-container');
  if (!container) return;

  try {
    const posts = await fetchJson('/data/blog-posts.json');
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const picked = posts.slice(0, 3);

    container.innerHTML = picked.map(renderBlogCard).join('');
  } catch (err) {
    console.error('loadFeaturedBlogPosts error', err);
    container.innerHTML = renderDataError('wpisów bloga', err);
  }
}

// ---------- PROJECTS PAGE ----------
async function loadAllProjects() {
  const container = document.getElementById('all-projects-container');
  if (!container) return;

  try {
    const projects = await fetchJson('/data/projects.json');
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = projects.map(renderProjectCard).join('');

    initializeProjectFilters(projects);
  } catch (err) {
    console.error('loadAllProjects error', err);
    container.innerHTML = renderDataError('projektów', err);
  }
}

function initializeProjectFilters(projects) {
  const tabButtons = document.querySelectorAll('.tab-button');
  const searchInput = document.getElementById('project-search');
  const tagWrap = document.getElementById('project-tag-filters');

  let selectedCategory = 'all';
  let selectedTag = 'all';
  let query = '';

  // tag chips (optional)
  if (tagWrap) {
    const tags = new Set();
    projects.forEach(p => asArray(p.tags).forEach(t => tags.add(String(t).toLowerCase())));
    const sorted = Array.from(tags).sort((a, b) => a.localeCompare(b, 'pl'));

    const makeChip = (label, value) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.value = value;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        selectedTag = value;
        tagWrap.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.value === value));
        apply();
      });
      return btn;
    };

    tagWrap.innerHTML = '';
    tagWrap.appendChild(makeChip('Wszystkie', 'all'));
    sorted.forEach(t => tagWrap.appendChild(makeChip('#' + t, t)));

    // default active
    tagWrap.querySelector('.chip')?.classList.add('active');
  }

  // category tabs
  if (tabButtons.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.getAttribute('data-category') || 'all';
        apply();
      });
    });
  }

  // search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      query = (searchInput.value || '').trim().toLowerCase();
      apply();
    });
  }

  function apply() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      const catOk = selectedCategory === 'all' || card.dataset.category === selectedCategory;

      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const tagOk = selectedTag === 'all' || tags.includes(selectedTag);

      const hay = (card.dataset.haystack || '');
      const qOk = !query || hay.includes(query);

      card.style.display = (catOk && tagOk && qOk) ? 'block' : 'none';
    });
  }

  // initial apply (in case HTML has default active tab)
  apply();
}

// ---------- BLOG PAGE ----------
async function loadAllBlogPosts() {
  const container = document.getElementById('all-blog-posts-container');
  if (!container) return;

  try {
    const posts = await fetchJson('/data/blog-posts.json');
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = posts.map(renderBlogCard).join('');

    initializeBlogFilters(posts);
  } catch (err) {
    console.error('loadAllBlogPosts error', err);
    container.innerHTML = renderDataError('wpisów bloga', err);
  }
}

function initializeBlogFilters(posts) {
  const searchInput = document.getElementById('blog-search');
  const tagWrap = document.getElementById('blog-tag-filters');

  let selectedTag = 'all';
  let query = '';

  if (tagWrap) {
    const tags = new Set();
    posts.forEach(p => asArray(p.tags).forEach(t => tags.add(String(t).toLowerCase())));
    const sorted = Array.from(tags).sort((a, b) => a.localeCompare(b, 'pl'));

    const makeChip = (label, value) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.value = value;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        selectedTag = value;
        tagWrap.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.value === value));
        apply();
      });
      return btn;
    };

    tagWrap.innerHTML = '';
    tagWrap.appendChild(makeChip('Wszystkie', 'all'));
    sorted.forEach(t => tagWrap.appendChild(makeChip('#' + t, t)));
    tagWrap.querySelector('.chip')?.classList.add('active');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      query = (searchInput.value || '').trim().toLowerCase();
      apply();
    });
  }

  function apply() {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const tagOk = selectedTag === 'all' || tags.includes(selectedTag);

      const hay = (card.dataset.haystack || '');
      const qOk = !query || hay.includes(query);

      card.style.display = (tagOk && qOk) ? 'block' : 'none';
    });
  }

  apply();
}

// ---------- renderers ----------
function renderProjectCard(project) {
  const title = safeText(project.title);
  const desc = safeText(project.description || '');
  const date = formatDatePL(project.date);
  const thumbnail = normalizePath(project.thumbnail || '/img/project-placeholder.png');

  const tags = asArray(project.tags).map(t => String(t).toLowerCase());
  const tagsHtml = tags.map(tag => `<span class="tag">#${safeText(tag)}</span>`).join('');

  const category = safeText(project.category || 'other');
  const url = normalizePath(project.url || project.link || project.page || '');

  const links = asArray(project.links).slice(0, 3).map(l => {
    if (!l || !l.url) return '';
    return `<a class="mini-link" href="${safeText(l.url)}" target="_blank" rel="noopener noreferrer">${safeText(l.label || 'Link')}</a>`;
  }).join(' ');

  const haystack = (title + ' ' + desc + ' ' + tags.join(' ')).toLowerCase();

  return `
    <div class="project-card pixel-border" data-category="${category}" data-tags="${tags.join(',')}" data-haystack="${safeText(haystack)}">
      <a class="card-link" href="${url || '#'}">
        <div class="project-image" style="background-image:url('${thumbnail}');"></div>
        <div class="project-content">
          <div class="project-date">${date}</div>
          <h3>${title}</h3>
          <p>${desc}</p>
          <div class="project-tags">${tagsHtml}</div>
          ${links ? `<div class="card-links">${links}</div>` : ''}
        </div>
      </a>
    </div>
  `;
}

function renderBlogCard(post) {
  const title = safeText(post.title);
  const excerpt = safeText(post.excerpt || '');
  const date = formatDatePL(post.date);
  const thumbnail = normalizePath(post.thumbnail || '/img/blog-placeholder.png');
  const url = normalizePath(post.url || post.link || post.page || '');

  const tags = asArray(post.tags).map(t => String(t).toLowerCase());
  const tagsHtml = tags.map(tag => `<span class="tag">#${safeText(tag)}</span>`).join('');

  const haystack = (title + ' ' + excerpt + ' ' + tags.join(' ')).toLowerCase();

  return `
    <div class="blog-card pixel-border" data-tags="${tags.join(',')}" data-haystack="${safeText(haystack)}">
      <a class="card-link" href="${url || '#'}">
        <div class="blog-image" style="background-image:url('${thumbnail}');"></div>
        <div class="blog-content">
          <div class="blog-date">${date}</div>
          <h3>${title}</h3>
          <p>${excerpt}</p>
          <div class="blog-tags">${tagsHtml}</div>
        </div>
      </a>
    </div>
  `;
}

function renderDataError(what, err) {
  const status = err?.status ? ` (HTTP ${err.status})` : '';
  // hint if 404
  const hint = err?.status === 404
    ? `<p style="margin-top:10px;opacity:.9">Sprawdź czy plik istnieje: <code>/data/projects.json</code> / <code>/data/blog-posts.json</code> (oraz czy nie jest ignorowany przez .gitignore/.dockerignore).</p>`
    : '';
  return `
    <div class="pixel-border" style="padding:18px;">
      <h3 style="margin:0 0 8px 0;">Nie udało się załadować ${what}${status}.</h3>
      <p style="margin:0;">Odśwież stronę lub spróbuj ponownie za chwilę.</p>
      ${hint}
    </div>
  `;
}
