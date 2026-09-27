# CLAUDE.md

Statyczna strona pixelinventor.com (HTML + CSS, bez JS i bez builda), serwowana przez Nginx w Dockerze.

## Struktura
- `website/` — cała treść strony (kopiowana do obrazu Nginx)
- `partials/` — wspólne fragmenty (źródło), wklejane do stron przez `scripts/build.py`:
  - `header.html` — nagłówek + nawigacja; aktywna zakładka z `page=start|stuff|log|about` w znaczniku
  - `footer.html` — stopka (`{{year}}` = bieżący rok w chwili budowania)
  - `stuff-cards.html` — karty projektów (używane na `/` i `/stuff.html`)
- `scripts/build.py` — wkleja partiale między znaczniki `<!-- partial:NAZWA ... -->` / `<!-- /partial:NAZWA -->`
- `website/css/style.css` — jedyny arkusz stylów (kolory jako zmienne w `:root`, tryb ciemny przez `prefers-color-scheme`)
- `website/fonts/` — fonty hostowane lokalnie (Pixelify Sans do nagłówków, Atkinson Hyperlegible do tekstu)
- `docker/nginx/default.conf` — konfiguracja Nginx dla obrazu Dockera
- `compose/` — Traefik + DEV/PROD na VPS
- `.github/workflows/deploy.yml` — push na `test` → DEV, push na `main` → PROD

## Konwencje
- Treść strony po polsku.
- Pliki w `website/` muszą być kompletnym statycznym HTML — serwer (dev/prod) NIE obsługuje SSI.
- Treści między znacznikami `partial` nie edytuj ręcznie: zmieniaj plik w `partials/` i uruchom `python3 scripts/build.py`.
- Nowa podstrona: skopiuj istniejącą, zmień `page=` w znaczniku headera i uruchom `python3 scripts/build.py`.
- Nowy projekt: dodaj kartę na początku `partials/stuff-cards.html` (pojawi się na Start i w Moich rzeczach) i przenieś do niej naklejkę `<span class="badge">Nowe!</span>`.
- Nowy wpis blogowy: plik w `website/blog/RRRR-MM-DD-slug.html` + wpis `log-entry` w `log.html`.
- Favicon to `/favicon.png` (nie `.svg`).
- Design: jasne „papierowe” tło, obrys 3px, twarde cienie bez rozmycia i bez zaokrągleń. Pixelify Sans tylko w dużych rozmiarach (≥17px); daty i drobne etykiety fontem tekstowym.
- Bez zewnętrznych zasobów: CSP w `default.conf` pozwala tylko na `'self'` dla skryptów, stylów i fontów.
- Pre-commit lint: `git config core.hooksPath .githooks`.
