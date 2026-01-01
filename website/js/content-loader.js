/**
 * content-loader.js
 * 
 * Skrypt do dynamicznego ładowania treści z plików JSON.
 * Automatycznie wypełnia sekcje z projektami i wpisami na blogu.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sprawdź, na jakiej stronie jesteśmy
    const isHomePage = document.querySelector('#featured-projects-container') !== null;
    const isProjectsPage = document.querySelector('#all-projects-container') !== null;
    const isBlogPage = document.querySelector('#all-blog-posts-container') !== null;
    
    // Ładuj odpowiednie treści dla każdej strony
    if (isHomePage) {
        loadFeaturedProjects();
        loadFeaturedBlogPosts();
    }
    
    if (isProjectsPage) {
        loadAllProjects();
    }
    
    if (isBlogPage) {
        loadAllBlogPosts();
    }
});

/**
 * Ładuje wybrane projekty na stronę główną
 */
function loadFeaturedProjects() {
    fetch('data/projects.json')
        .then(response => response.json())
        .then(projects => {
            // Sortowanie projektów od najnowszych
            projects.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Wybierz 3 najnowsze projekty
            const featuredProjects = projects.slice(0, 3);
            
            // Generuj HTML
            const container = document.getElementById('featured-projects-container');
            let html = '';
            
            featuredProjects.forEach(project => {
                const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                
                html += `
                <div class="project-card pixel-border">
                    <div class="project-image" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${project.thumbnail}'); background-size: cover;"></div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                        <a href="${project.url}" class="pixel-button small">Zobacz więcej</a>
                    </div>
                </div>
                `;
            });
            
            // Aktualizuj zawartość kontenera
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Błąd podczas ładowania projektów:', error);
            document.getElementById('featured-projects-container').innerHTML = `
                <div class="error-message">
                    <p>Nie udało się załadować projektów. Spróbuj odświeżyć stronę.</p>
                </div>
            `;
        });
}

/**
 * Ładuje wszystkie projekty na stronę projektów
 */
function loadAllProjects() {
    fetch('data/projects.json')
        .then(response => response.json())
        .then(projects => {
            // Sortowanie projektów od najnowszych
            projects.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Generuj HTML
            const container = document.getElementById('all-projects-container');
            let html = '';
            
            projects.forEach(project => {
                const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                
                html += `
                <div class="project-card pixel-border" data-category="${project.category}">
                    <div class="project-image" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${project.thumbnail}'); background-size: cover;"></div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                        <a href="${project.url}" class="pixel-button small">Zobacz więcej</a>
                    </div>
                </div>
                `;
            });
            
            // Aktualizuj zawartość kontenera
            container.innerHTML = html;
            
            // Inicjalizuj filtrowanie projektów
            initializeProjectFilters();
        })
        .catch(error => {
            console.error('Błąd podczas ładowania projektów:', error);
            document.getElementById('all-projects-container').innerHTML = `
                <div class="error-message">
                    <p>Nie udało się załadować projektów. Spróbuj odświeżyć stronę.</p>
                </div>
            `;
        });
}

/**
 * Ładuje wybrane wpisy bloga na stronę główną
 */
function loadFeaturedBlogPosts() {
    fetch('data/blog-posts.json')
        .then(response => response.json())
        .then(posts => {
            // Sortowanie wpisów od najnowszych
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Wybierz 2 najnowsze wpisy
            const featuredPosts = posts.slice(0, 2);
            
            // Generuj HTML
            const container = document.getElementById('featured-posts-container');
            let html = '';
            
            featuredPosts.forEach(post => {
                // Formatowanie daty
                const postDate = new Date(post.date);
                const formattedDate = postDate.toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                html += `
                <div class="blog-card pixel-border">
                    <div class="blog-image" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${post.thumbnail}'); background-size: cover;"></div>
                    <div class="blog-content">
                        <div class="blog-date">${formattedDate}</div>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt}</p>
                        <a href="${post.url}" class="pixel-button small">Czytaj więcej</a>
                    </div>
                </div>
                `;
            });
            
            // Aktualizuj zawartość kontenera
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Błąd podczas ładowania wpisów bloga:', error);
            document.getElementById('featured-posts-container').innerHTML = `
                <div class="error-message">
                    <p>Nie udało się załadować wpisów bloga. Spróbuj odświeżyć stronę.</p>
                </div>
            `;
        });
}

/**
 * Ładuje wszystkie wpisy bloga na stronę bloga
 */
function loadAllBlogPosts() {
    fetch('data/blog-posts.json')
        .then(response => response.json())
        .then(posts => {
            // Sortowanie wpisów od najnowszych
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Generuj HTML
            const container = document.getElementById('all-blog-posts-container');
            let html = '';
            
            posts.forEach(post => {
                // Formatowanie daty
                const postDate = new Date(post.date);
                const formattedDate = postDate.toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                const tagsHtml = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                
                html += `
                <div class="blog-card pixel-border">
                    <div class="blog-image" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${post.thumbnail}'); background-size: cover;"></div>
                    <div class="blog-content">
                        <div class="blog-date">${formattedDate}</div>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt}</p>
                        <div class="blog-tags">
                            ${tagsHtml}
                        </div>
                        <a href="${post.url}" class="pixel-button small">Czytaj więcej</a>
                    </div>
                </div>
                `;
            });
            
            // Aktualizuj zawartość kontenera
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Błąd podczas ładowania wpisów bloga:', error);
            document.getElementById('all-blog-posts-container').innerHTML = `
                <div class="error-message">
                    <p>Nie udało się załadować wpisów bloga. Spróbuj odświeżyć stronę.</p>
                </div>
            `;
        });
}

/**
 * Inicjalizuje funkcjonalność filtrowania projektów
 */
function initializeProjectFilters() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (!tabButtons.length || !projectCards.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktywacja przycisku
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrowanie projektów
            const category = button.getAttribute('data-category');
            
            projectCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
