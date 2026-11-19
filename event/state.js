export const repository = "https://github.com/uopaisociety/flappy-ai-jam";
export const awardNames = {
  technical: "Best Engineered",
  creative: "Most Unhinged Prompt",
  audience: "People’s Choice",
};

export async function loadEvent() {
  const response = await fetch("submissions/event.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("Event status unavailable");
  const event = await response.json();
  if (!["pending", "open", "closed"].includes(event.state)) throw new Error("Unknown ballot state");
  return event;
}

export function awardsFor(event, build) {
  if (build.kind !== "submission") return [];
  if (Array.isArray(event?.placements)) {
    const award = event.placements.find((item) => item.id === build.id);
    if (award) {
      const tied = event.placements.filter((item) => item.rank === award.rank).length > 1;
      const suffix = award.rank === 1 ? "st" : award.rank === 2 ? "nd" : award.rank === 3 ? "rd" : "th";
      return [(tied ? "Joint " : "") + award.rank + suffix + " place"];
    }
  }
  const byCategory = Object.entries(awardNames)
    .filter(([key]) => event?.awards?.[key]?.includes(build.id))
    .map(([, name]) => name);
  return !byCategory.length && build.winner === true ? ["Event winner"] : byCategory;
}

export async function loadManifest() {
  const response = await fetch("submissions/manifest.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("Manifest unavailable");
  const manifest = await response.json();
  if (manifest.version !== 1 || !Array.isArray(manifest.builds)) {
    throw new Error("Unsupported manifest");
  }
  return manifest.builds;
}

export function publicGameUrl(value) {
  if (typeof value !== "string" || value.length > 2048 || /[\s<>\\\x00-\x1f\x7f]/u.test(value)) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      && /^[a-z0-9.-]+\.[a-z][a-z0-9-]*$/.test(url.hostname)
      && !url.hostname.endsWith(".localhost") && !url.hostname.endsWith(".local") ? url.href : "";
  } catch {
    return "";
  }
}

export function isGeminiShare(url) {
  return url.hostname === "share.gemini.google"
    || (url.hostname === "gemini.google.com" && url.pathname.startsWith("/share/"))
    || (url.hostname === "g.co" && url.pathname.startsWith("/gemini/share/"));
}

const emailedBuildId = /^email--[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export function publishedGamePath(build) {
  if (build.html !== true) return "";
  if (Number.isSafeInteger(build.issue) && build.issue > 0) {
    return `submissions/games/${build.issue}.txt`;
  }
  return emailedBuildId.test(build.id) ? `submissions/games/${build.id}.txt` : "";
}

export async function loadPublishedGame(path) {
  const file = /^submissions\/games\/([a-z0-9-]+)\.txt$/.exec(path)?.[1];
  if (!file || !(/^[1-9][0-9]*$/.test(file) || emailedBuildId.test(file))) {
    throw new Error("Invalid game path");
  }
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error("Game file unavailable");
  return response.text();
}

export function standaloneGameDocument(html) {
  // Place the policy before any submitted markup, and keep standards mode.
  const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
    + "img-src data: blob:; media-src data: blob:; font-src data:; base-uri 'none'; form-action 'none'";
  const body = html.replace(/^\s*<!doctype html\s*>/i, "");
  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${policy}">${body}`;
}
