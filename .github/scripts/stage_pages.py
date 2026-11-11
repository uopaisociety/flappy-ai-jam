"""Assemble the public site, serving student HTML only as inert source text."""

import json
import re
import shutil
import sys
from pathlib import Path

site = Path(sys.argv[1])
site.mkdir()
for name in ("index.html", "arcade.html", "showcase.html"):
    shutil.copyfile(name, site / name)
shutil.copytree("examples", site / "examples")
destination = site / "submissions"
destination.mkdir()
shutil.copyfile("submissions/manifest.json", destination / "manifest.json")
for row in json.loads(Path("submissions/manifest.json").read_text())["builds"]:
    if row["kind"] != "submission":
        continue
    identifier = row["id"]
    if not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?", identifier):
        raise ValueError("Invalid submission ID in manifest.")
    shutil.copyfile(f"submissions/{identifier}.html", destination / f"{identifier}.txt")
