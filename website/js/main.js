/**
 * main.js
 * 
 * Główny plik JavaScript dla strony PixelInventor
 */

document.addEventListener('DOMContentLoaded', function() {
    // Podświetlanie aktywnego elementu menu
    highlightActiveMenuItem();
});

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
        if (href === currentPage || 
            (currentPage === 'index.html' && href === '/') || 
            (href !== '/' && currentPage.includes(href))) {
            link.classList.add('active');
        }
    });
}
