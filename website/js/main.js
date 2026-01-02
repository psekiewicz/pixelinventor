/**
 * main.js
 *
 * Małe skrypty UI (bez logiki ładowania treści).
 * - Ustawia aktualny rok w stopce ([data-year])
 */

document.addEventListener('DOMContentLoaded', () => {
  // Aktualny rok w stopce
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  // (Opcjonalnie) łatwe rozróżnienie DEV/PROD w CSS
  if (window.location.hostname.startsWith('dev.')) {
    document.documentElement.classList.add('env-dev');
  } else {
    document.documentElement.classList.add('env-prod');
  }
});
