/**
 * components.js
 *
 * Ładuje komponenty HTML (header, navigation, footer) do elementów z atrybutem:
 *   data-component="nazwa"
 *
 * Wersja uproszczona:
 * - zawsze pobiera komponenty spod /components/<name>.html (ścieżki absolutne)
 * - działa zarówno na /, jak i na /blog/... oraz /projects/...
 */

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
});

async function loadComponents() {
  const componentElements = document.querySelectorAll('[data-component]');
  if (!componentElements.length) return;

  for (const element of componentElements) {
    const componentName = element.getAttribute('data-component');
    if (!componentName) continue;

    const url = `/components/${componentName}.html`;

    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

      element.innerHTML = await response.text();
      activateScripts(element);
    } catch (error) {
      console.error(`Error loading component "${componentName}" from ${url}:`, error);
      element.innerHTML = `
        <div class="error-message" style="padding:12px;border:2px solid #ff3e3e;">
          Nie udało się załadować komponentu: <strong>${componentName}</strong>
        </div>
      `;
    }
  }

  highlightActiveMenuItem();
}

function activateScripts(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');

    for (const attr of oldScript.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    if (oldScript.textContent) newScript.textContent = oldScript.textContent;

    oldScript.replaceWith(newScript);
  });
}

function highlightActiveMenuItem() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const links = nav.querySelectorAll('a[href]');
  if (!links.length) return;

  const currentPath = (window.location.pathname.replace(/\/index\.html$/, '/') || '/');

  links.forEach(link => link.classList.remove('active'));

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) return;

    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/index\.html$/, '/');

    if (linkPath === '/' && currentPath === '/') {
      link.classList.add('active');
      return;
    }

    if (linkPath === '/blog.html' && (currentPath === '/blog.html' || currentPath.startsWith('/blog/'))) {
      link.classList.add('active');
      return;
    }

    if (linkPath === '/projects.html' && (currentPath === '/projects.html' || currentPath.startsWith('/projects/'))) {
      link.classList.add('active');
      return;
    }

    if (currentPath === linkPath) {
      link.classList.add('active');
      return;
    }
  });
}
