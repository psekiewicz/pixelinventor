#!/usr/bin/env python3
"""Wkleja wspólne fragmenty z partials/ do plików HTML w website/.

Każda strona zawiera znaczniki, np.:
    <!-- partial:header page=log -->
    ...tu skrypt wstawia treść partials/header.html...
    <!-- /partial:header -->

Użycie:
    python3 scripts/build.py          # zaktualizuj pliki
    python3 scripts/build.py --check  # tylko sprawdź (kod 1, gdy coś nieaktualne)
"""
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials"
WEBSITE = ROOT / "website"

BLOCK = re.compile(
    r"(?P<indent>[ \t]*)<!-- partial:(?P<name>[\w-]+)(?P<args>[^>]*?) -->\n"
    r".*?"
    r"[ \t]*<!-- /partial:(?P=name) -->",
    re.S,
)


def render(name, args):
    source = PARTIALS / f"{name}.html"
    if not source.exists():
        raise SystemExit(f"Brak pliku {source.relative_to(ROOT)}")
    text = source.read_text(encoding="utf-8")
    params = dict(re.findall(r"(\w+)=(\S+)", args))
    text = text.replace("{{year}}", str(datetime.date.today().year))
    page = params.get("page")
    text = re.sub(
        r"\{\{active:(\w+)\}\}",
        lambda m: ' class="active" aria-current="page"' if m.group(1) == page else "",
        text,
    )
    return text


def build(html):
    def replace(m):
        indent, name, args = m.group("indent"), m.group("name"), m.group("args")
        return (
            f"{indent}<!-- partial:{name}{args} -->\n"
            f"{render(name, args)}"
            f"{indent}<!-- /partial:{name} -->"
        )

    return BLOCK.sub(replace, html)


def main():
    check = "--check" in sys.argv
    stale = []
    for path in sorted(WEBSITE.rglob("*.html")):
        old = path.read_text(encoding="utf-8")
        new = build(old)
        if new != old:
            stale.append(path.relative_to(ROOT))
            if not check:
                path.write_text(new, encoding="utf-8")
    for path in stale:
        print(("nieaktualny: " if check else "zaktualizowano: ") + str(path))
    if check and stale:
        print("Uruchom: python3 scripts/build.py")
        sys.exit(1)


if __name__ == "__main__":
    main()
