# PixelInventor – strona / portfolio

Statyczna strona portfolio trzymana w `website/` i serwowana przez Nginx w kontenerze Dockera.  
Reverse proxy + HTTPS (Let’s Encrypt) ogarnia Traefik.

## Założenia (dev/prod)

- `dev.pixelinventor.pl` – środowisko DEV (branch: `test`)
- `pixelinventor.pl` + `www.pixelinventor.pl` – środowisko PROD (branch: `main`)

Docelowo CI/CD:
- push na `test` → aktualizacja DEV
- merge/push na `main` → aktualizacja PROD

## Struktura repo

```text
.
├─ website/                 # pliki strony (HTML/CSS/JS/img/itp.)
├─ docker/
│  └─ nginx/
│     └─ default.conf       # konfiguracja nginx w kontenerze
├─ compose/
│  ├─ traefik.yml           # Traefik (odpalasz raz na VPS)
│  ├─ dev.yml               # stack DEV (dev.pixelinventor.pl)
│  └─ prod.yml              # stack PROD (pixelinventor.pl)
├─ Dockerfile               # buduje obraz strony (nginx + website)
├─ .dockerignore
├─ .env.example
└─ README.md
```

## Wymagania

- Docker + Docker Compose (plugin `docker compose`)
- VPS z otwartymi portami: 80 i 443
- DNS:
  - `pixelinventor.pl` → A na IP VPS
  - `www.pixelinventor.pl` → A lub CNAME na VPS
  - `dev.pixelinventor.pl` → A na IP VPS

## Lokalnie (szybki start bez Traefika)

Zbuduj i uruchom kontener:

```bash
docker build -t pixelinventor:local .
docker run --rm -p 8080:80 pixelinventor:local
```

Otwórz w przeglądarce:
- `http://localhost:8080`

## Produkcja na VPS (Traefik + HTTPS)

### 1) Przygotuj katalogi na VPS

```bash
sudo mkdir -p /opt/pixelinventor
cd /opt/pixelinventor
```

### 2) Skopiuj pliki `compose/` na VPS

Najprościej:
- sklonuj repo na VPS, albo
- wrzuć tylko katalog `compose/` (i ewentualnie `.env.example`).

### 3) Skonfiguruj `.env`

Na VPS utwórz `.env` na podstawie `.env.example`:

```bash
cp .env.example .env
nano .env
```

W `.env` ustaw:
- `LE_EMAIL` – email dla Let’s Encrypt
- `PROD_DOMAIN=pixelinventor.pl`
- `DEV_DOMAIN=dev.pixelinventor.pl`
- `IMAGE` – nazwa obrazu (np. GHCR): `ghcr.io/<owner>/<repo>`

> `.env` jest ignorowany przez git (sekrety i ustawienia trzymamy poza repo).

### 4) Uruchom Traefika (raz)

```bash
docker compose -f compose/traefik.yml --env-file .env up -d
```

### 5) Uruchom PROD i DEV

PROD:

```bash
docker compose -f compose/prod.yml --env-file .env up -d
```

DEV:

```bash
docker compose -f compose/dev.yml --env-file .env up -d
```

### 6) Aktualizacja (manualna)

PROD:

```bash
docker compose -f compose/prod.yml --env-file .env pull
docker compose -f compose/prod.yml --env-file .env up -d --remove-orphans
```

DEV:

```bash
docker compose -f compose/dev.yml --env-file .env pull
docker compose -f compose/dev.yml --env-file .env up -d --remove-orphans
```

## Najczęstsze problemy

- **Brak HTTPS / cert nie wydaje się:** sprawdź DNS (czy domeny wskazują na IP VPS) i czy port 80 jest dostępny z internetu.
- **Traefik nie widzi kontenerów:** upewnij się, że działa na tej samej sieci `web` co aplikacje (dev/prod).
- **Zmiany w `website/` nie widać:** jeśli używasz obrazów z rejestru – musisz zbudować i wypchnąć nowy obraz, a potem zrobić `pull && up -d`.

## Co dalej

Następny krok: CI/CD na GitHub Actions (test → dev, main → prod).
