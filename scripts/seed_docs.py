#!/usr/bin/env python3
"""
seed_docs.py — Converts CSV database exports into MkDocs-ready Markdown pages.

Run this script before `mkdocs build` or `mkdocs gh-deploy`. It will:
  1. Wipe and recreate all seeded sub-directories under docs/
  2. Copy README.md → docs/index.md, CONTRIBUTING.md → docs/contributing.md
  3. Generate one .md file per CSV row for every content type
  4. Build and inject a full nav tree into mkdocs.yml

Seeded sections (never edit manually — regenerated on every run):
  docs/azhwars/
  docs/acharyas/
  docs/divya-desham/
  docs/prabhandham/
"""

import csv
import os
import re
import shutil
import textwrap
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"
DOCS = ROOT / "docs"
MKDOCS_YML = ROOT / "mkdocs.yml"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """Convert arbitrary unicode text to a filesystem-safe slug."""
    # Normalize unicode → decompose accented chars
    text = unicodedata.normalize("NFKD", text)
    # Keep only ASCII alphanumeric + spaces (drop diacritics / special chars)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "page"


def pasuram_slug(si: str, english_scripts: str, n_words: int = 4) -> str:
    """
    Build a verse filename slug from si_no + first N words of the
    English transliteration (romanized text, ASCII-friendly).

    Example: si="1.01", english="amalanādhi pirān aḍiyārkku..." →
             "1-01-amalanh-piran-aiy-rkku"  (diacritics stripped via slugify)
    """
    # Clean the transliteration text
    text = fix_newlines(english_scripts)
    # Take only the first line (verse blocks are multi-line)
    first_line = text.split("\n")[0].strip()
    # Drop any trailing backslash artifacts from CSV encoding
    first_line = first_line.replace("\\", "").strip()
    words = first_line.split()[:n_words]
    word_part = slugify(" ".join(words))
    # Replace dots in si_no with hyphens for clean filenames (1.01 → 1-01)
    si_part = si.replace(".", "-")
    return f"{si_part}-{word_part}"


def fix_newlines(text: str) -> str:
    """
    CSV fields store literal backslash-n for line breaks inside verse blocks.
    This converts them to real newlines and normalises Windows CRLF.
    """
    text = text.replace("\\r\\n", "\n").replace("\\n", "\n")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text.strip()


def prose_paragraphs(text: str) -> str:
    """Turn double-newline chunks into proper Markdown paragraphs."""
    text = fix_newlines(text)
    # Collapse 3+ blank lines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def read_csv(filename: str) -> list[dict]:
    path = DATA / filename
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def wipe_dir(d: Path) -> None:
    if d.exists():
        shutil.rmtree(d)
    d.mkdir(parents=True)


# ---------------------------------------------------------------------------
# Page templates
# ---------------------------------------------------------------------------

def render_pasuram(row: dict) -> str:
    si = row.get("si_no", "").strip()
    tamil = fix_newlines(row.get("tamil_scripts", ""))
    english = fix_newlines(row.get("english_scripts", ""))
    meaning = row.get("meaning", "").strip()
    purport = prose_paragraphs(row.get("purport", ""))
    azhwar = row.get("azhwar", "").strip()
    prabhandham = row.get("prabhandham", "").strip()
    archavathara = row.get("archavathara", "").strip()
    avataram = row.get("avataram", "").strip()
    rasa = row.get("rasa", "").strip()

    # Build metadata table
    meta_rows = [("Prabhandham", prabhandham), ("Āḻvār", azhwar)]
    if archavathara:
        meta_rows.append(("Archāvatāra", archavathara))
    if avataram:
        meta_rows.append(("Avatāram", avataram))
    if rasa:
        meta_rows.append(("Rasa", rasa))

    meta_table = "| Attribute | Value |\n|---|---|\n"
    meta_table += "".join(f"| {k} | {v} |\n" for k, v in meta_rows)

    lines = [
        f"# Verse {si}",
        "",
        meta_table,
        "",
        "---",
        "",
        '## 📜 Tamil',
        "",
        "```",
        tamil,
        "```",
        "",
        "---",
        "",
        "## 🔤 Transliteration",
        "",
        "```",
        english,
        "```",
        "",
        "---",
        "",
        "## 💡 Meaning",
        "",
        f"> {meaning}",
        "",
        "---",
        "",
        "## 📖 Purport",
        "",
        purport,
        "",
    ]
    return "\n".join(lines)


def render_azhwar(row: dict) -> str:
    name = row.get("name", "").strip()
    incarnation = row.get("incarnation", "").strip()
    bio = prose_paragraphs(row.get("bio", ""))
    time_period = row.get("time_period", "").strip()
    birthplace = row.get("birthplace", "").strip()
    taniyan_tamil = fix_newlines(row.get("taniyan_tamil", ""))
    taniyan_english = fix_newlines(row.get("taniyan_english", ""))

    meta_rows = []
    if incarnation:
        meta_rows.append(("Incarnation", incarnation))
    if time_period:
        meta_rows.append(("Time Period", time_period))
    if birthplace:
        meta_rows.append(("Birthplace", birthplace))

    meta_table = ""
    if meta_rows:
        meta_table = "| Attribute | Value |\n|---|---|\n"
        meta_table += "".join(f"| {k} | {v} |\n" for k, v in meta_rows)

    lines = [f"# {name}", ""]
    if meta_table:
        lines += [meta_table, ""]

    if bio:
        lines += ["## Biography", "", bio, ""]

    if taniyan_tamil or taniyan_english:
        lines += ["---", "", "## Taniyan", ""]
        if taniyan_tamil:
            lines += ["### Tamil", "", "```", taniyan_tamil, "```", ""]
        if taniyan_english:
            lines += ["### English", "", f"*{taniyan_english}*", ""]

    return "\n".join(lines)


def render_acharya(row: dict) -> str:
    name = row.get("name", "").strip()
    bio = prose_paragraphs(row.get("bio", ""))
    time_period = row.get("time_period", "").strip()
    birthplace = row.get("birthplace", "").strip()

    meta_rows = []
    if time_period:
        meta_rows.append(("Time Period", time_period))
    if birthplace:
        meta_rows.append(("Birthplace", birthplace))

    meta_table = ""
    if meta_rows:
        meta_table = "| Attribute | Value |\n|---|---|\n"
        meta_table += "".join(f"| {k} | {v} |\n" for k, v in meta_rows)

    lines = [f"# {name}", ""]
    if meta_table:
        lines += [meta_table, ""]
    if bio:
        lines += ["## Biography", "", bio, ""]

    return "\n".join(lines)


def render_divya_desham(row: dict) -> str:
    name = row.get("name", "").strip()
    place = row.get("place", "").strip()
    state = row.get("state", "").strip()
    info = prose_paragraphs(row.get("info", ""))
    coords = row.get("coordinates", "").strip()

    meta_rows = []
    if place:
        meta_rows.append(("Place", place))
    if state:
        meta_rows.append(("State", state))
    if coords:
        meta_rows.append(("Coordinates", coords))

    meta_table = ""
    if meta_rows:
        meta_table = "| Attribute | Value |\n|---|---|\n"
        meta_table += "".join(f"| {k} | {v} |\n" for k, v in meta_rows)

    lines = [f"# {name}", ""]
    if meta_table:
        lines += [meta_table, ""]
    if info:
        lines += ["## About", "", info, ""]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Index page generators
# ---------------------------------------------------------------------------

def render_azhwars_index(rows: list[dict]) -> str:
    lines = [
        "# Āḻvārs",
        "",
        "The Āḻvārs are twelve Tamil poet-saints of South India who are revered in Vaishnavism.",
        "Their devotional hymns form the *Nalāyira Divya Prabandham* (Four Thousand Sacred Verses).",
        "",
        "| # | Name | Birthplace | Time Period |",
        "|---|---|---|---|",
    ]
    for r in rows:
        slug = slugify(r["name"])
        name = r["name"].strip()
        bp = r.get("birthplace", "").strip()
        tp = r.get("time_period", "").strip()
        lines.append(f"| {r['id']} | [{name}]({slug}.md) | {bp} | {tp} |")
    return "\n".join(lines)


def render_acharyas_index(rows: list[dict]) -> str:
    lines = [
        "# Ācāryas",
        "",
        "The Ācāryas are the great preceptors of the Śrīvaiṣṇava tradition who systematised "
        "and propagated the teachings of the Āḻvārs.",
        "",
        "| # | Name | Birthplace | Time Period |",
        "|---|---|---|---|",
    ]
    for r in rows:
        slug = slugify(r["name"])
        name = r["name"].strip()
        bp = r.get("birthplace", "").strip()
        tp = r.get("time_period", "").strip()
        lines.append(f"| {r['id']} | [{name}]({slug}.md) | {bp} | {tp} |")
    return "\n".join(lines)


def render_divya_desham_index(rows: list[dict]) -> str:
    lines = [
        "# Divya Deśams",
        "",
        "The 108 Divya Deśams are the sacred Vishnu temples sung about by the Āḻvārs in the Divya Prabandham.",
        "",
        "| # | Temple | Place | State |",
        "|---|---|---|---|",
    ]
    for r in rows:
        slug = slugify(r["name"])
        name = r["name"].strip()
        place = r.get("place", "").strip()
        state = r.get("state", "").strip()
        lines.append(f"| {r['id']} | [{name}]({slug}.md) | {place} | {state} |")
    return "\n".join(lines)


def render_prabhandham_index(prabhandham_name: str, rows: list[dict]) -> str:
    lines = [
        f"# {prabhandham_name}",
        "",
        f"*{prabhandham_name}* is part of the sacred Divya Prabandham.",
        "",
        "| Verse | Āḻvār |",
        "|---|---|",
    ]
    for r in rows:
        si = r.get("si_no", "").strip()
        azhwar = r.get("azhwar", "").strip()
        english = fix_newlines(r.get("english_scripts", ""))
        slug = pasuram_slug(si, english)
        lines.append(f"| [{si}]({slug}.md) | {azhwar} |")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

def seed_azhwars() -> list:
    """Returns nav entries: [{'Name': 'path'}, ...]"""
    rows = read_csv("azhwars.csv")
    out_dir = DOCS / "azhwars"
    wipe_dir(out_dir)

    write(out_dir / "index.md", render_azhwars_index(rows))

    nav_entries = [{"Overview": "azhwars/index.md"}]
    for r in rows:
        slug = slugify(r["name"])
        fname = f"{slug}.md"
        write(out_dir / fname, render_azhwar(r))
        nav_entries.append({r["name"].strip(): f"azhwars/{fname}"})

    print(f"  ✓ Āḻvārs: {len(rows)} pages written")
    return nav_entries


def seed_acharyas() -> list:
    rows = read_csv("acharyas.csv")
    out_dir = DOCS / "acharyas"
    wipe_dir(out_dir)

    write(out_dir / "index.md", render_acharyas_index(rows))

    nav_entries = [{"Overview": "acharyas/index.md"}]
    for r in rows:
        slug = slugify(r["name"])
        fname = f"{slug}.md"
        write(out_dir / fname, render_acharya(r))
        nav_entries.append({r["name"].strip(): f"acharyas/{fname}"})

    print(f"  ✓ Ācāryas: {len(rows)} pages written")
    return nav_entries


def seed_divya_desham() -> list:
    rows = read_csv("divya_desham.csv")
    out_dir = DOCS / "divya-desham"
    wipe_dir(out_dir)

    write(out_dir / "index.md", render_divya_desham_index(rows))

    nav_entries = [{"Overview": "divya-desham/index.md"}]
    for r in rows:
        slug = slugify(r["name"])
        fname = f"{slug}.md"
        write(out_dir / fname, render_divya_desham(r))
        nav_entries.append({r["name"].strip(): f"divya-desham/{fname}"})

    print(f"  ✓ Divya Deśams: {len(rows)} pages written")
    return nav_entries


def seed_prabhandham() -> list:
    """Groups verses by prabhandham name; returns nested nav."""
    rows = read_csv("prabhandham.csv")
    out_dir = DOCS / "prabhandham"
    wipe_dir(out_dir)

    # Group rows by prabhandham name preserving insertion order
    groups: dict[str, list[dict]] = {}
    for r in rows:
        p = r.get("prabhandham", "Unknown").strip()
        groups.setdefault(p, []).append(r)

    nav_entries = []
    for prabhandham_name, prows in groups.items():
        p_slug = slugify(prabhandham_name)
        p_dir = out_dir / p_slug
        p_dir.mkdir(parents=True, exist_ok=True)

        # Index page for the prabhandham
        write(p_dir / "index.md", render_prabhandham_index(prabhandham_name, prows))

        child_entries = [{"Overview": f"prabhandham/{p_slug}/index.md"}]
        for r in prows:
            si = r.get("si_no", "").strip()
            english = fix_newlines(r.get("english_scripts", ""))
            verse_slug = pasuram_slug(si, english)
            fname = f"{verse_slug}.md"
            write(p_dir / fname, render_pasuram(r))
            label = f"Verse {si}"
            child_entries.append({label: f"prabhandham/{p_slug}/{fname}"})

        nav_entries.append({prabhandham_name: child_entries})

    total = sum(len(v) for v in groups.values())
    print(f"  ✓ Prabhandham: {total} verses across {len(groups)} works written")
    return nav_entries


def copy_static_pages() -> None:
    """Copy README.md → docs/index.md and CONTRIBUTING.md → docs/contributing.md."""
    readme = ROOT / "README.md"
    contributing = ROOT / "CONTRIBUTING.md"

    if readme.exists():
        shutil.copy(readme, DOCS / "index.md")
        print("  ✓ README.md → docs/index.md")
    else:
        write(DOCS / "index.md", "# Welcome\n\nNalāyira Divya Prabandham — the digital book.\n")
        print("  ✓ Created default docs/index.md")

    if contributing.exists():
        shutil.copy(contributing, DOCS / "contributing.md")
        print("  ✓ CONTRIBUTING.md → docs/contributing.md")
    else:
        write(DOCS / "contributing.md", "# Contributing\n\nContributions are welcome!\n")
        print("  ✓ Created default docs/contributing.md")


# ---------------------------------------------------------------------------
# mkdocs.yml writer
# ---------------------------------------------------------------------------

MKDOCS_TEMPLATE = """\
site_name: Nalāyira Divya Prabandham
site_description: >-
  A digital book of the Nalāyira Divya Prabandham — 4000 sacred Tamil verses
  composed by the Āḻvārs, with Tamil scripts, transliteration, meaning, and purport.
site_author: NDVS
site_url: https://{gh_owner}.github.io/{gh_repo}/

repo_name: {gh_owner}/{gh_repo}
repo_url: https://github.com/{gh_owner}/{gh_repo}

docs_dir: docs
site_dir: site

theme:
  name: material
  favicon: assets/favicon.png
  palette:
    scheme: slate
    primary: custom
    accent: custom
  features:
    - navigation.tabs
    - navigation.tabs.sticky
    - navigation.sections
    - navigation.collapse
    - navigation.top
    - navigation.indexes
    - search.suggest
    - search.highlight
    - content.code.copy
    - toc.follow
  font:
    text: Noto Sans
    code: Noto Sans Mono

extra_css:
  - stylesheets/extra.css

markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.highlight:
      anchor_linenums: true
  - tables
  - attr_list
  - def_list
  - toc:
      permalink: true

plugins:
  - search:
      lang: en

extra:
  generator: false

"""


def build_nav_yaml(
    azhwar_nav: list,
    acharya_nav: list,
    desham_nav: list,
    prabhandham_nav: list,
) -> str:
    """Serialise the nav structure to YAML manually (avoids PyYAML dependency issues with unicode)."""

    def entry_to_yaml(entry, indent: int) -> str:
        pad = "  " * indent
        if isinstance(entry, str):
            return f"{pad}- {entry}\n"
        if isinstance(entry, dict):
            lines = []
            for k, v in entry.items():
                if isinstance(v, str):
                    lines.append(f"{pad}- '{k}': {v}\n")
                elif isinstance(v, list):
                    lines.append(f"{pad}- '{k}':\n")
                    for child in v:
                        lines.append(entry_to_yaml(child, indent + 2))
            return "".join(lines)
        return ""

    sections = [
        ("Home", "index.md"),
        ("Contributing", "contributing.md"),
        ("Āḻvārs", azhwar_nav),
        ("Prabhandhams", prabhandham_nav),
        ("Divya Deśams", desham_nav),
        ("Ācāryas", acharya_nav),
    ]

    lines = ["nav:\n"]
    for label, content in sections:
        if isinstance(content, str):
            lines.append(f"  - '{label}': {content}\n")
        else:
            lines.append(f"  - '{label}':\n")
            for item in content:
                lines.append(entry_to_yaml(item, indent=2))

    return "".join(lines)


def write_mkdocs_yml(
    azhwar_nav: list,
    acharya_nav: list,
    desham_nav: list,
    prabhandham_nav: list,
) -> None:
    # Detect GitHub remote for site_url
    try:
        import subprocess
        remote = subprocess.check_output(
            ["git", "remote", "get-url", "origin"], cwd=ROOT, text=True
        ).strip()
        # Parse owner/repo from https or ssh remote
        m = re.search(r"github\.com[:/]([^/]+)/([^/.]+)", remote)
        gh_owner = m.group(1) if m else "your-org"
        gh_repo = m.group(2) if m else "ndvs"
    except Exception:
        gh_owner = "your-org"
        gh_repo = "ndvs"

    body = MKDOCS_TEMPLATE.format(gh_owner=gh_owner, gh_repo=gh_repo)
    nav_yaml = build_nav_yaml(azhwar_nav, acharya_nav, desham_nav, prabhandham_nav)
    MKDOCS_YML.write_text(body + nav_yaml, encoding="utf-8")
    print(f"  ✓ mkdocs.yml written ({MKDOCS_YML})")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("🌸 NDVS — seeding docs from CSVs\n")

    DOCS.mkdir(exist_ok=True)
    (DOCS / "stylesheets").mkdir(exist_ok=True)
    (DOCS / "assets").mkdir(exist_ok=True)

    print("📄 Static pages")
    copy_static_pages()

    print("\n📚 Seeding content")
    azhwar_nav = seed_azhwars()
    acharya_nav = seed_acharyas()
    desham_nav = seed_divya_desham()
    prabhandham_nav = seed_prabhandham()

    print("\n⚙️  Writing mkdocs.yml")
    write_mkdocs_yml(azhwar_nav, acharya_nav, desham_nav, prabhandham_nav)

    total = (
        1  # index
        + 1  # contributing
        + len(azhwar_nav)
        + len(acharya_nav)
        + len(desham_nav)
        + sum(len(v) for item in prabhandham_nav for v in item.values())
    )
    print(f"\n✅ Done — {total} pages generated under docs/")
