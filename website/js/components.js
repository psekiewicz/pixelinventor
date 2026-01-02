/**
 * components.js
 *
 * Ładuje komponenty HTML do elementów z atrybutem:
 *   data-component="nazwa"
 *
 * Zasady:
 * - komponenty są w /components/<name>.html (ścieżki absolutne)
 * - "navigation2" jest aliasem do "navigation" (żeby docelowo mieć tylko 1 nawigację)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
});

async function loadComponents() {
  const componentElements = document.querySelectorAll('[data-component]');
  if (!componentElements.length) return;

  for (const element of componentElements) {
    let name = element.getAttribute('data-component');
    if (!name) continue;

    // kompatybilność: navigation2 -> navigation
    if (name === 'navigation2') name = 'navigation';

    const url = `/components/${name}.html`;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

      element.innerHTML = await response.text();

      // jeśli w komponencie są <script>, uruchom je ponownie
      activateScripts(element);

      // podświetl aktywny element menu po wstrzyknięciu nawigacji
      if (name === 'navigation') highlightActiveMenuItem();
    } catch (err) {
      console.error(`Error loading component: ${name}`, err);
      element.innerHTML = `
        <div class="pixel-border" style="padding:16px;">
          <strong>Nie udało się załadować komponentu:</strong> ${name}
        </div>
      `;
    }
  }
}

function activateScripts(root) {
  const scripts = root.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
    newScript.textContent = oldScript.textContent || '';
    oldScript.replaceWith(newScript);
  });
}

function normalizePathname(pathname) {
  // /index.html -> /
  let p = pathname.replace(/\/index\.html$/i, '/');
  // usuń podwójne slashe i trailing slash (poza rootem)
  p = p.replace(/\/+/g, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function highlightActiveMenuItem() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const links = nav.querySelectorAll('a[href]');
  if (!links.length) return;

  const currentPath = normalizePathname(window.location.pathname);

  links.forEach(link => link.classList.remove('active'));

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // zewnętrzne linki pomijamy
    if (/^(https?:\/\/|mailto:)/i.test(href)) return;

    const linkPath = normalizePathname(new URL(href, window.location.origin).pathname);

    // root
    if (linkPath === '/' && currentPath === '/') {
      link.classList.add('active');
      return;
    }

    // dokładne dopasowanie, albo jesteśmy "pod" tą sekcją (np. /blog/... dla /blog.html)
    if (linkPath !== '/' && (currentPath === linkPath || currentPath.startsWith(linkPath + '/'))) {
      link.classList.add('active');
    }
  });
}
