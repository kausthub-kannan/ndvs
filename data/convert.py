import csv
import json
import re
import sys
from pathlib import Path

# Must match csv_to_md.py (order here = column order of body fields in the CSV)
BODY_FIELDS = ["tamil_scripts", "english_scripts", "meaning", "purport",
               "taniyan_tamil", "taniyan_english", "bio", "info"]

# folder name -> output CSV name
TARGETS = {
    "acharyas": "acharyas.csv",
    "azhwars": "azhwars.csv",
    "divya_desham": "divya_desham.csv",
    "prabhandham": "prabhandham.csv",
}

try:
    import yaml
except ImportError:  # fall back to a tiny parser that understands what csv_to_md.py writes
    yaml = None

SECTION_RE = re.compile(r"^## (%s)[ \t]*$" % "|".join(BODY_FIELDS), re.M)


def natural_key(s):
    """Sort 'a2' before 'a10'."""
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", str(s))]


def parse_frontmatter(text):
    """Return (properties dict of str->str, body text)."""
    text = text.lstrip("\ufeff").replace("\r\n", "\n")
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    block = text[4:end]
    body = text[end + 4:].lstrip("\n")
    return _load_props(block), body


def _load_props(block):
    if yaml is not None:
        # BaseLoader keeps every scalar as a string: no 1 -> int, no date mangling
        data = yaml.load(block, Loader=yaml.BaseLoader) or {}
        return {str(k): _to_str(v) for k, v in data.items()}
    props = {}
    for line in block.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        k, _, v = line.partition(":")
        v = v.strip()
        if v.startswith('"'):
            try:
                v = json.loads(v)
            except json.JSONDecodeError:
                v = v.strip('"')
        elif v.startswith("'") and v.endswith("'") and len(v) >= 2:
            v = v[1:-1].replace("''", "'")
        props[k.strip()] = v
    return props


def _to_str(v):
    if v is None:
        return ""
    if isinstance(v, (list, dict)):
        return json.dumps(v, ensure_ascii=False)
    return str(v)


def parse_body(body):
    """Split body into {field: text} using the known `## field` headers only."""
    sections = {}
    matches = list(SECTION_RE.finditer(body))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        sections[m.group(1)] = body[m.end():end].strip()
    return sections


def read_note(path):
    text = path.read_text(encoding="utf-8")
    props, body = parse_frontmatter(text)
    return {**props, **parse_body(body)}


def collect_files(folder):
    """Yield (path, context) for every .md under folder. context = parent dir name for prabhandham."""
    for p in sorted(folder.rglob("*.md"), key=lambda p: natural_key(p.relative_to(folder))):
        yield p


def build_rows(kind, folder):
    rows = []
    for path in collect_files(folder):
        try:
            row = read_note(path)
        except Exception as e:  # keep going; report at the end
            print(f"  ! skipped {path}: {e}", file=sys.stderr)
            continue
        if kind == "prabhandham":
            # fall back to the path if the properties are missing
            row.setdefault("prabhandham", path.parent.name)
            row.setdefault("sino", path.stem)
        rows.append(row)
    if kind == "prabhandham":
        rows.sort(key=lambda r: (natural_key(r.get("prabhandham", "")), natural_key(r.get("sino", ""))))
    return rows


def column_order(rows):
    """Properties in first-seen order, then body fields in canonical order."""
    props, seen = [], set()
    for r in rows:
        for k in r:
            if k not in seen and k not in BODY_FIELDS:
                seen.add(k)
                props.append(k)
    used_body = [f for f in BODY_FIELDS if any(f in r for r in rows)]
    return props + used_body


def write_csv(path, rows):
    cols = column_order(rows)
    # utf-8-sig: Excel needs the BOM to display Tamil correctly; csv_to_md.py reads it fine
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore", restval="")
        w.writeheader()
        w.writerows(rows)


def main():
    root, out = Path("data/markdowns/NDVS/"), Path("data")
    out.mkdir(parents=True, exist_ok=True)

    for kind, csv_name in TARGETS.items():
        folder = root / kind
        if not folder.is_dir():
            print(f"- {kind}/: not found, skipping")
            continue
        rows = build_rows(kind, folder)
        if not rows:
            print(f"- {kind}/: no .md files, skipping")
            continue
        write_csv(out / csv_name, rows)
        print(f"- {kind}/ -> {out / csv_name}  ({len(rows)} rows)")


if __name__ == "__main__":
    main()