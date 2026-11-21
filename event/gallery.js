import {
  awardsFor, isGeminiShare, loadEvent, loadManifest, loadPublishedGame,
  publicGameUrl, publishedGamePath, repository, standaloneGameDocument,
} from "./state.js";
const curated = new Map([
  ["baseline", { path: "index.html", controls: "Press Space, the up arrow or tap to flap. You have three lives. Press P to pause." }],
  ["01-neural-autopilot", { path: "examples/01-neural-autopilot.html", controls: "Choose Play to watch the autopilot. Press A or choose Autopilot to fly manually." }],
  ["02-voice-frequency-thruster", { path: "examples/02-voice-frequency-thruster.html", controls: "Space and tap work immediately. Open the game in a new tab to enable the microphone." }],
  ["03-overclock-boss-protocol", { path: "examples/03-overclock-boss-protocol.html", controls: "The boss appears as soon as you play. Press Shift or choose Dash for a short shield. Three lives. Each wave gets tougher." }],
]);
const handlePattern = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i;
const byId = (id) => document.getElementById(id);
const dialog = byId("player");
const frameBox = byId("frame-box");
const frameMessage = byId("frame-message");
const css = getComputedStyle(document.documentElement);
const palette = Object.fromEntries(["deep","ink","line","navy","sea","sage","gold","cream"].map(
  (name) => [name, css.getPropertyValue("--" + name).trim()]));
let builds = [];
let event = null;
let frame;
let active;
let loaded = false;

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function buildPreview(build) {
  if (build.preview !== true) return renderArtwork(build);
  const preview = element("img", "", "card-art");
  preview.alt = "";
  preview.width = 640;
  preview.height = 400;
  preview.loading = "lazy";
  preview.decoding = "async";
  preview.addEventListener("error", () => preview.replaceWith(renderArtwork(build)), { once: true });
  preview.src = "event/previews/" + build.id + ".webp";
  return preview;
}

function renderArtwork(build) {
  const canvas = element("canvas", "", "card-art");
  canvas.width = 620;
  canvas.height = 235;
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const colors = palette;
  ctx.fillStyle = colors.deep;
  ctx.fillRect(0, 0, 620, 235);
  ctx.strokeStyle = colors.line;
  ctx.beginPath();
  for (let x = 0; x < 620; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, 235); }
  for (let y = 0; y < 235; y += 30) { ctx.moveTo(0, y); ctx.lineTo(620, y); }
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = colors.sage;
  ctx.fillStyle = colors.gold;
  if (build.id === "01-neural-autopilot") {
    ctx.fillStyle = colors.navy;
    for (const [x, top, bottom] of [[242,61,148],[455,88,181]]) {
      ctx.fillRect(x, 0, 45, top);
      ctx.fillRect(x, bottom, 45, 235 - bottom);
      ctx.strokeRect(x, 0, 45, top);
      ctx.strokeRect(x, bottom, 45, 235 - bottom);
    }
    ctx.strokeStyle = colors.gold;
    ctx.beginPath();
    ctx.moveTo(25, 159);
    ctx.bezierCurveTo(130, 212, 154, 51, 254, 105);
    ctx.bezierCurveTo(350, 153, 371, 189, 475, 126);
    ctx.bezierCurveTo(530, 89, 557, 122, 600, 166);
    ctx.stroke();
  } else if (build.id === "02-voice-frequency-thruster") {
    for (let i = 0; i < 64; i++) {
      const rise = (5 + (Math.sin(i * .63) + 1) * 44 + (Math.cos(i * 1.6) + 1) * 21) * (1 - i / 93);
      ctx.fillStyle = i % 8 === 0 ? colors.gold : colors.sea;
      ctx.fillRect(8 + i * 9.5, 184 - rise, 6, rise);
    }
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) ctx.lineTo(8 + i * 6, 104 + Math.sin(i * .42) * Math.sin(i * .09) * 28);
    ctx.stroke();
  } else if (build.id === "03-overclock-boss-protocol") {
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) ctx.lineTo(468 + Math.cos(i * Math.PI / 3) * 58, 117 + Math.sin(i * Math.PI / 3) * 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(468, 117, 22, 0, Math.PI * 2);
    ctx.fill();
    for (const [x, y] of [[65,158],[136,88],[205,134],[274,104],[348,156],[353,61]]) {
      ctx.fillRect(x, y - 1, 34, 2);
      ctx.beginPath(); ctx.arc(x, y, 6, 0, 2 * Math.PI); ctx.fill();
    }
  } else {
    ctx.fillStyle = colors.sea;
    ctx.fillRect(240, 0, 36, 77);
    ctx.fillRect(240, 154, 36, 81);
    ctx.fillRect(424, 0, 36, 113);
    ctx.fillRect(424, 186, 36, 49);
    ctx.strokeStyle = colors.gold;
    ctx.beginPath();
    ctx.moveTo(60, 139); ctx.lineTo(144, 111); ctx.lineTo(172, 124); ctx.lineTo(142, 142); ctx.closePath(); ctx.stroke();
  }
  return canvas;
}

function validBuild(build) {
  if (!build || typeof build.id !== "string" || !handlePattern.test(build.id)
    || typeof build.title !== "string" || !build.title
    || typeof build.builder !== "string" || !build.builder
    || (build.github !== undefined && (typeof build.github !== "string" || !handlePattern.test(build.github)))) return false;
  const expectedKind = build.id === "baseline" ? "baseline" : curated.has(build.id) ? "reference" : "submission";
  if (build.kind !== expectedKind) return false;
  if (expectedKind !== "submission") return Boolean(build.github);
  if (build.issue === undefined) return Boolean(publishedGamePath(build));
  const expectedId = build.assisted === true ? "entry--" + build.issue : build.github?.toLowerCase();
  return build.id === expectedId && Boolean(publishedGamePath(build) || publicGameUrl(build.url))
    && Number.isSafeInteger(build.issue) && build.issue > 0;
}

function card(build) {
  const result = element("article", "", "card");
  const body = element("div", "", "card-body");
  const badges = element("div", "", "badges");
  for (const award of awardsFor(event, build)) {
    badges.append(element("span", award, "badge winner"));
  }
  const byline = element("p", build.builder, "byline");
  if (build.github && build.assisted !== true) {
    const github = element("a", "@" + build.github);
    github.href = "https://github.com/" + build.github;
    byline.append(github);
  }
  if (typeof build.linkedin === "string") {
    try {
      const url = new URL(build.linkedin);
      if (url.protocol === "https:" && ["www.linkedin.com", "linkedin.com"].includes(url.hostname)
        && !url.username && !url.password) {
        const profile = element("a", "LinkedIn");
        profile.href = url.href;
        byline.append(profile);
      }
    } catch { /* Optional profile links may be omitted. */ }
  }
  if (badges.childElementCount) body.append(badges);
  body.append(element("h3", build.title), byline);
  if (typeof build.description === "string" && build.description) body.append(element("p", build.description));
  if (typeof build.prompt === "string" && build.prompt) {
    const details = element("details");
    const pre = element("pre");
    pre.append(element("code", build.prompt));
    details.append(element("summary", "What they asked the AI"), pre);
    body.append(details);
  }
  const launch = element("button", "Play build", "action primary launch");
  launch.type = "button";
  launch.setAttribute("aria-label", "Launch " + build.title);
  launch.addEventListener("click", () => launchBuild(build));
  body.append(launch);
  result.append(buildPreview(build), body);
  return result;
}

function render() {
  if (!loaded) return;
  const visible = builds.filter((build) => build.kind === "submission");
  byId("grid").replaceChildren(...visible.map(card));
  byId("count").textContent = visible.length + (visible.length === 1 ? " build" : " builds");
  const message = byId("message");
  message.hidden = Boolean(visible.length);
  message.textContent = "Games will appear here as they’re checked. Try an example while you wait.";
}

function renderEvent() {
  const status = event?.state;
  const entriesClosed = status === "open" || status === "closed";
  byId("submit-instructions").hidden = entriesClosed;
  byId("submit-status").hidden = !entriesClosed;
  const voteLink = byId("vote-link");
  voteLink.hidden = !entriesClosed;
  voteLink.textContent = status === "closed" ? "See the vote results" : "Choose your favourite";
  byId("vote-status").textContent = {
    open: event?.paperOnly ? "Voting is open in the room. Ask for a paper slip." : "Voting is open. You can vote in the room or online.",
    closed: "Voting has closed.",
    pending: "Voting opens after the demos."
  }[status] ?? "Check the ballot for the latest status.";

  const awards = [];
  for (const build of builds) {
    for (const name of awardsFor(event, build)) {
      const launch = element("button", "Play build", "action");
      launch.type = "button";
      launch.addEventListener("click", () => launchBuild(build));
      const panel = element("article", "", "panel");
      panel.append(element("p", name, "meta"), element("h3", build.title), element("p", build.builder), launch);
      awards.push(panel);
    }
  }
  byId("award-list").replaceChildren(...awards);
  byId("award-status").hidden = awards.length > 0;
}

function directLink(id) {
  const url = new URL(location.href);
  if (id) url.searchParams.set("build", id);
  else url.searchParams.delete("build");
  url.hash = "";
  return url.href;
}

function resizeFrame() {
  const width = frameBox.clientWidth;
  if (width > 0) frameBox.style.setProperty("--frame-scale", String(width / 480));
}

async function launchBuild(build) {
  frame?.remove();
  frame = null;
  active = build;
  history.replaceState(null, "", directLink(build.id));
  byId("player-title").textContent = build.title;
  byId("player-builder").textContent = build.github && build.assisted !== true ? build.builder + " · @" + build.github : build.builder;
  byId("copy-status").textContent = "";
  byId("share-url").hidden = true;
  const known = curated.get(build.id);
  const source = known ? "" : publishedGamePath(build);
  const download = byId("download-source");
  download.hidden = !source;
  if (source) {
    download.href = source;
    download.download = build.id.replace(/^email--/, "") + ".html";
  } else {
    download.removeAttribute("href");
  }
  const issue = byId("submission-issue");
  issue.hidden = !Number.isSafeInteger(build.issue) || build.issue < 1;
  if (!issue.hidden) {
    issue.href = repository + "/issues/" + build.issue;
    issue.textContent = "Submission issue #" + build.issue;
  } else {
    issue.removeAttribute("href");
  }
  const gameUrl = known?.path ?? publicGameUrl(build.url);
  const gemini = gameUrl && isGeminiShare(new URL(gameUrl, location.href));
  const external = !source && gemini;
  const openGame = byId("open-game");
  openGame.hidden = !gameUrl;
  if (gameUrl) openGame.href = gameUrl;
  else openGame.removeAttribute("href");
  openGame.textContent = source ? "Open original link ↗︎" : "Open game in new tab";
  const controls = byId("player-controls");
  controls.textContent = known?.controls ?? (source
    ? build.description ?? "Play the submitted game below."
    : "If the preview is blocked or the controls do not respond, open the game in a new tab.");
  frameMessage.hidden = false;
  frameMessage.textContent = external ? "This game opens in Gemini. Use the button above to play it." : "Loading game…";
  frameBox.classList.toggle("external-preview", Boolean(external));
  if (!dialog.open) dialog.showModal();
  if (external) {
    controls.textContent = "Open the link in your browser. If Gemini asks you to sign in or the preview is unavailable, try a different game.";
    openGame.focus();
    return;
  }
  resizeFrame();

  const preview = element("iframe");
  preview.title = build.title;
  preview.width = "480";
  preview.height = "640";
  preview.setAttribute("sandbox", "allow-scripts");
  preview.setAttribute("allow", "microphone 'none'; camera 'none'");
  preview.referrerPolicy = "no-referrer";
  preview.addEventListener("load", () => { if (frame === preview) frameMessage.hidden = true; });
  frame = preview;
  try {
    if (source) {
      const html = await loadPublishedGame(source);
      if (!dialog.open || frame !== preview) return;
      preview.srcdoc = standaloneGameDocument(html);
    } else {
      preview.src = gameUrl;
    }
    frameBox.append(preview);
  } catch {
    if (frame !== preview) return;
    frameMessage.textContent = gameUrl
      ? "The game file couldn’t load. Try the original link above."
      : "The game file couldn’t load. Close and reopen the game to try again.";
  }
}

dialog.addEventListener("close", () => {
  if (dialog.open) return;
  frame?.remove();
  frame = active = null;
  history.replaceState(null, "", directLink(null));
});
byId("copy").addEventListener("click", async () => {
  if (!active) return;
  const url = directLink(active.id);
  const status = byId("copy-status");
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = "Link copied.";
  } catch {
    const input = byId("share-url");
    input.value = url;
    input.hidden = false;
    input.select();
    status.textContent = "Copy the selected link.";
  }
});
if (typeof ResizeObserver === "function") new ResizeObserver(resizeFrame).observe(frameBox);
else window.addEventListener("resize", resizeFrame);

let manifestKey;
let eventKey;
let refreshing = false;
async function refresh() {
  if (refreshing || dialog.open) return;
  refreshing = true;
  try {
    const [manifestResult, eventResult] = await Promise.allSettled([loadManifest(), loadEvent()]);
    if (manifestResult.status === "rejected" && !loaded) {
      byId("message").textContent = "Could not load the gallery. This page will retry automatically.";
      return;
    }
    let changed = false;
    if (manifestResult.status === "fulfilled") {
      const key = JSON.stringify(manifestResult.value);
      if (key !== manifestKey) {
        const seen = new Set();
        builds = manifestResult.value.filter((build) => {
          if (!validBuild(build) || seen.has(build.id)) return false;
          seen.add(build.id);
          return true;
        });
        if (!loaded) {
          byId("reference-grid").replaceChildren(...builds.filter((build) => build.kind === "reference").map(card));
        }
        manifestKey = key;
        changed = true;
      }
    }
    if (eventResult.status === "fulfilled") {
      const key = JSON.stringify(eventResult.value);
      if (key !== eventKey) {
        event = eventResult.value;
        eventKey = key;
        changed = true;
      }
    }
    const firstLoad = !loaded;
    loaded = true;
    if (changed) {
      render();
      renderEvent();
    }
    if (firstLoad) {
      const selected = new URLSearchParams(location.search).get("build");
      const build = builds.find((entry) => entry.id === selected);
      if (build) launchBuild(build);
      else if (selected) {
        const message = byId("message");
        message.textContent = "That build is not in the gallery.";
        message.hidden = false;
      }
    }
  } finally {
    refreshing = false;
  }
}

void refresh();
setInterval(refresh, 15000);
