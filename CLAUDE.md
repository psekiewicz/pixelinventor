# CLAUDE.md

Statyczna strona pixelinventor.com (HTML + CSS, bez JS i bez builda), serwowana przez Nginx w Dockerze.

## Struktura
- `website/` — cała treść strony (kopiowana do obrazu Nginx)
- `website/_partials/` — wspólne fragmenty wstawiane przez Nginx SSI:
  - `header.html` — nagłówek + nawigacja; aktywna zakładka przez `?page=start|stuff|log|about`
  - `footer.html` — stopka (rok wstawiany automatycznie)
  - `stuff-cards.html` — karty projektów (używane na `/` i `/stuff.html`)
- `website/css/style.css` — jedyny arkusz stylów
- `docker/nginx/default.conf` — konfiguracja Nginx (`ssi on`, `/_partials/` jest `internal`)
- `compose/` — Traefik + DEV/PROD na VPS
- `.github/workflows/deploy.yml` — push na `test` → DEV, push na `main` → PROD

## Konwencje
- Treść strony po polsku.
- Nowa podstrona: skopiuj istniejącą, użyj `<!--# include virtual="/_partials/header.html?page=..." -->`
  i `<!--# include virtual="/_partials/footer.html" -->` zamiast wklejać nawigację/stopkę.
- Nowy projekt: dodaj kartę w `_partials/stuff-cards.html` (pojawi się na Start i w Moich rzeczach).
- Nowy wpis blogowy: plik w `website/blog/RRRR-MM-DD-slug.html` + wpis `log-entry` w `log.html`.
- Favicon to `/favicon.png` (nie `.svg`).
- SSI działa tylko przez Nginx — podgląd przez `docker build` / `docker run` (patrz README), nie przez otwieranie plików z dysku.
- Pre-commit lint: `git config core.hooksPath .githooks`.
