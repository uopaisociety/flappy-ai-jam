"""Add the approved issue snapshot and its game link to the gallery manifest."""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

MANIFEST = Path("submissions/manifest.json")
HANDLE = re.compile(r"[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?", re.I | re.ASCII)
LABELS = (
    "Build Title",
    "Builder Name",
    "LinkedIn URL (optional)",
    "Track",
    "Key Prompt Used",
    "Game URL",
)
TRACKS = {
    "Technical Execution": "technical-execution",
    "Game Feel": "game-feel",
    "Creative Mutation": "creative-mutation",
}
REQUIRED_LABELS = {"submission", "approved"}


def gh_json(endpoint):
    return json.loads(subprocess.check_output(["gh", "api", endpoint], text=True))


def public_url(value):
    try:
        if len(value) > 2048 or re.search(r"[\s<>\\\x00-\x1f\x7f]", value):
            raise ValueError
        url = urlsplit(value)
        host = (url.hostname or "").encode("idna").decode("ascii")
        if (url.scheme != "https" or url.username is not None or url.password is not None
                or url.port not in {None, 443} or not re.fullmatch(r"[a-z0-9.-]+\.[a-z][a-z0-9-]*", host)
                or host.endswith((".localhost", ".local"))):
            raise ValueError
    except ValueError:
        raise ValueError("Use a public HTTPS URL without embedded credentials.") from None
    return value


def extract_fields(body):
    remaining = body.replace("\r\n", "\n").lstrip()
    values = []
    for index, label in enumerate(LABELS):
        heading = "### " + label + "\n"
        if not remaining.startswith(heading):
            raise ValueError("Use the repository's Submit Your Build issue form.")
        remaining = remaining[len(heading):]
        if index == len(LABELS) - 1:
            values.append(remaining.strip())
        else:
            next_heading = "\n### " + LABELS[index + 1] + "\n"
            value, marker, remainder = remaining.partition(next_heading)
            if not marker:
                raise ValueError("The issue form is missing a field.")
            values.append(value.strip())
            remaining = marker[1:] + remainder
    return values


def parse_submission(issue):
    github = issue["user"]["login"]
    if issue["user"]["type"] != "User" or not HANDLE.fullmatch(github):
        raise ValueError("Submissions must come from a GitHub user account.")
    identifier = github.lower()
    title, builder, linkedin, track, prompt, game_url = extract_fields(issue["body"] or "")
    if not (0 < len(title) <= 100 and 0 < len(builder) <= 100 and 0 < len(prompt) <= 1500
            and all(value != "_No response_" for value in (title, builder, prompt))
            and all("\n" not in value for value in (title, builder)) and track in TRACKS):
        raise ValueError("Check the title, builder, track and key prompt fields.")
    row = {
        "id": identifier, "kind": "submission", "title": title, "builder": builder,
        "github": github, "track": TRACKS[track], "prompt": prompt, "issue": issue["number"],
        "url": public_url(game_url),
    }
    if linkedin not in {"", "_No response_"}:
        linkedin_url = public_url(linkedin)
        if urlsplit(linkedin_url).hostname not in {"linkedin.com", "www.linkedin.com"}:
            raise ValueError("The optional LinkedIn URL must use linkedin.com.")
        row["linkedin"] = linkedin_url
    return row


def record_submission(row):
    manifest = json.loads(MANIFEST.read_text())
    if manifest.get("version") != 1 or not isinstance(manifest.get("builds"), list):
        raise ValueError("The existing manifest must use schema version 1.")
    rows = manifest["builds"]
    identifier = row["id"]
    for index, current in enumerate(rows):
        if current["id"] != identifier:
            continue
        if current["kind"] != "submission":
            raise ValueError("This GitHub handle is reserved by a curated build.")
        if current["issue"] > row["issue"]:
            raise ValueError("A newer submission from this GitHub account is already in the gallery.")
        if current.get("winner") is True:
            row["winner"] = True
        rows[index] = row
        break
    else:
        rows.append(row)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    repository = os.environ["GITHUB_REPOSITORY"]
    event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    issue = event["issue"]
    sender = event["sender"]
    if event["action"] != "labeled" or event["label"]["name"] != "approved":
        raise ValueError("Publishing requires an approved label event.")
    if sender["type"] != "User" or not HANDLE.fullmatch(sender["login"]):
        raise ValueError("A repository maintainer must apply the approved label.")
    permissions = gh_json(f"repos/{repository}/collaborators/{sender['login']}/permission")
    if permissions.get("permission") not in {"write", "admin"}:
        raise ValueError("Applying approval requires write access to the repository.")
    current = gh_json(f"repos/{repository}/issues/{int(issue['number'])}")
    if (current["state"] != "open" or not REQUIRED_LABELS.issubset(label["name"] for label in current["labels"])
            or not REQUIRED_LABELS.issubset(label["name"] for label in issue["labels"])
            or issue["body"] != current["body"]):
        raise ValueError("The submission changed, closed or lost approval. Review it and apply approved again.")
    row = parse_submission(issue)
    record_submission(row)
    with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
        print(f"build={row['id']}", file=output)
        print(f"issue={row['issue']}", file=output)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
