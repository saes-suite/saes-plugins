#!/usr/bin/env python3
"""Validate Claude Code marketplace, plugin manifests, version sync, and SKILL.md files."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(msg: str) -> None:
    print(f"❌ {msg}", file=sys.stderr)
    sys.exit(1)


def parse_frontmatter(text: str, path: Path) -> tuple[dict[str, str], str]:
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", text, flags=re.DOTALL)
    if not match:
        fail(f"{path}: missing or malformed YAML frontmatter (--- ... ---).")
    raw_yaml, body = match.group(1), match.group(2).strip()
    meta: dict[str, str] = {}
    for line in raw_yaml.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if ":" not in line:
            fail(f"{path}: invalid frontmatter line: {line!r}")
        key, val = line.split(":", 1)
        meta[key.strip()] = val.strip().strip('"').strip("'")
    if not body:
        fail(f"{path}: skill body is empty.")
    return meta, body


def main() -> None:
    version_file = ROOT / "version.txt"
    if not version_file.exists():
        fail("version.txt not found.")
    expected_version = version_file.read_text(encoding="utf-8").strip()
    if not re.match(r"^\d+\.\d+\.\d+$", expected_version):
        fail(f"version.txt must be valid semver X.Y.Z, got: {expected_version!r}")

    marketplace_path = ROOT / ".claude-plugin" / "marketplace.json"
    if not marketplace_path.exists():
        fail(".claude-plugin/marketplace.json not found.")
    marketplace = json.loads(marketplace_path.read_text(encoding="utf-8"))

    for key in ("name", "owner", "plugins"):
        if key not in marketplace:
            fail(f"marketplace.json missing required key: {key!r}")

    plugins = marketplace["plugins"]
    if not isinstance(plugins, list) or not plugins:
        fail("marketplace.json 'plugins' must be a non-empty list.")

    for entry in plugins:
        name = entry.get("name")
        source = entry.get("source")
        version = entry.get("version")
        if not name or not source or not version:
            fail(f"marketplace.json plugin entry missing name/source/version: {entry}")
        if version != expected_version:
            fail(f"marketplace.json plugin '{name}' version ({version}) != version.txt ({expected_version})")

        plugin_dir = (ROOT / source).resolve()
        if not plugin_dir.is_dir():
            fail(f"Plugin source directory does not exist: {plugin_dir}")

        manifest_path = plugin_dir / ".claude-plugin" / "plugin.json"
        if not manifest_path.exists():
            fail(f"Missing plugin manifest: {manifest_path}")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for key in ("name", "version", "description", "author"):
            if key not in manifest:
                fail(f"{manifest_path} missing required key: {key!r}")
        if manifest["name"] != name:
            fail(f"{manifest_path} name ({manifest['name']}) != marketplace name ({name})")
        if manifest["version"] != expected_version:
            fail(f"{manifest_path} version ({manifest['version']}) != version.txt ({expected_version})")

        skills_dir = plugin_dir / "skills"
        if not skills_dir.is_dir():
            fail(f"Plugin '{name}' is missing skills/ directory.")
        skill_files = sorted(skills_dir.glob("*/SKILL.md"))
        if not skill_files:
            fail(f"Plugin '{name}' has no skills/*/SKILL.md files.")
        for skill_file in skill_files:
            meta, _ = parse_frontmatter(skill_file.read_text(encoding="utf-8"), skill_file)
            for key in ("name", "description"):
                if not meta.get(key):
                    fail(f"{skill_file}: frontmatter missing '{key}'.")
            if meta["name"] != skill_file.parent.name:
                fail(f"{skill_file}: frontmatter name ({meta['name']!r}) != directory ({skill_file.parent.name!r})")

    print(f"✅ Validated saes-plugins v{expected_version} ({len(plugins)} plugin(s)).")


if __name__ == "__main__":
    main()
