# PixelInventor (pixelinventor.com)

Statyczna strona z plików w `website/`, serwowana przez Nginx w Dockerze.  
Traefik robi routing po domenach i HTTPS (Let’s Encrypt). Deploy jest automatyczny przez GitHub Actions.

## Adresy
- DEV: `https://dev.pixelinventor.com` (branch `test`)
- PROD: `https://pixelinventor.com` + `https://www.pixelinventor.com` (branch `main`)

## Lokalnie
```bash
docker build -t pixelinventor:local .
docker run --rm -p 8080:80 pixelinventor:local
```
Otwórz: `http://localhost:8080`

## Jak działa deploy
- push na `test` → buduje obraz `:dev` i aktualizuje DEV na VPS
- push/merge na `main` → buduje obraz `:prod` i aktualizuje PROD na VPS

## VPS (info)
Na serwerze projekt jest w `/opt/pixelinventor` i działa przez Docker Compose:
- Traefik: `compose/traefik.yml`
- DEV: `compose/dev.yml`
- PROD: `compose/prod.yml`

Konfiguracja domen/email jest w `.env` (nie commitujemy).

## Awaryjna aktualizacja na VPS
DEV:
```bash
cd /opt/pixelinventor
docker compose -p pixelinventor-dev -f compose/dev.yml --env-file .env pull
docker compose -p pixelinventor-dev -f compose/dev.yml --env-file .env up -d --remove-orphans
```

PROD:
```bash
cd /opt/pixelinventor
docker compose -p pixelinventor-prod -f compose/prod.yml --env-file .env pull
docker compose -p pixelinventor-prod -f compose/prod.yml --env-file .env up -d --remove-orphans
```
