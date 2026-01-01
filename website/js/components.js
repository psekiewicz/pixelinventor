/**
 * components.js
 * 
 * Skrypt do wczytywania komponentów wielokrotnego użytku (header, footer, nav)
 * Rozwiązuje problem powtarzalności kodu w różnych podstronach
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wczytaj wszystkie komponenty z atrybutami data-component
    loadComponents();
});

/**
 * Wczytuje komponenty HTML z atrybutem data-component
 */
async function loadComponents() {
    const componentElements = document.querySelectorAll('[data-component]');
    
    // Wczytaj każdy komponent
    for(const element of componentElements) {
        const componentName = element.getAttribute('data-component');
        try {
            // Pobierz zawartość komponentu
            // FIX: Zmiana ścieżki z bezwzględnej na względną
            let response;
            
            // Najpierw próbujemy względną ścieżkę (dla strony głównej)
            try {
                response = await fetch(`components/${componentName}.html`);
                if (!response.ok) {
                    throw new Error('Components not found in root path');
                }
            } catch (e) {
                // Jeśli nie działa, próbujemy ścieżkę dla podstron
                response = await fetch(`../components/${componentName}.html`);
                if (!response.ok) {
                    throw new Error(`Component not found in parent path`);
                }
            }
            
            const html = await response.text();
            
            // Wstaw komponent do elementu
            element.innerHTML = html;
            
            // Aktywuj skrypty w komponencie (jeśli są)
            activateScripts(element);
            
            // Specjalne zachowanie dla nawigacji - podświetl aktywną stronę
            if (componentName === 'navigation' || componentName === 'navigation2') {
                highlightActiveMenuItem();
            }
            
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            element.innerHTML = `<div class="error-message">Nie udało się załadować komponentu: ${componentName}</div>`;
        }
    }
}

/**
 * Aktywuje skrypty wewnątrz wczytanego komponentu
 */
function activateScripts(element) {
    const scripts = element.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Kopiuj wszystkie atrybuty
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        
        // Kopiuj zawartość skryptu
        newScript.textContent = oldScript.textContent;
        
        // Zastąp stary skrypt nowym (aktywnym)
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

/**
 * Podświetla aktywny element menu na podstawie bieżącego URL
 */
function highlightActiveMenuItem() {
    // Pobierz aktualny URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Znajdź wszystkie linki w menu
    const navLinks = document.querySelectorAll('nav a');
    
    // Usuń klasę active ze wszystkich linków
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Dodaj klasę active do aktualnego linku
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const currentPath = window.location.pathname;
        
        // Sprawdź, czy to strona główna
        if ((currentPath === '/' || currentPath.endsWith('index.html')) && 
            (href === 'index.html' || href === '/' || href === '../index.html')) {
            link.classList.add('active');
        } 
        // Sprawdź głębokość ścieżki i dostosuj odpowiednio
        else if (currentPath.includes('/blog/') || currentPath.includes('/projects/')) {
            // Dla stron w podfolderach
            if ((currentPath.includes('/blog/') && (href === 'blog.html' || href === '../blog.html')) || 
                (currentPath.includes('/projects/') && (href === 'projects.html' || href === '../projects.html'))) {
                link.classList.add('active');
            }
        } 
        // Dopasuj normalne strony
        else if (currentPage === href || (href.includes(currentPage) && href.indexOf('/') > -1)) {
            link.classList.add('active');
        }
    });
}