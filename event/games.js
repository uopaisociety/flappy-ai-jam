import { awardsFor, isGeminiShare, loadEvent, loadManifest, loadPublishedGame, publicGameUrl, publishedGamePath, standaloneGameDocument } from "./state.js";

const $ = (id) => document.getElementById(id);
const player = $("games-player");
const frameBox = $("games-frame-box");
const frameStatus = $("games-frame-status");
let builds = [];
let eventState = null;
let selectedBuild = null;
let activeFrame = null;
let started = false;
let manifestKey = "";
let eventKey = "";

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function validBuild(build) {
  return build && build.kind === "submission"
    && typeof build.id === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/i.test(build.id)
    && typeof build.title === "string" && build.title.trim()
    && typeof build.builder === "string" && build.builder.trim()
    && Boolean(publishedGamePath(build) || publicGameUrl(build.url));
}

function shareUrl(build) {
  const url = new URL("games.html", location.href);
  url.searchParams.set("build", build.id);
  return url.href;
}

function fullGameUrl(build) {
  if (publishedGamePath(build)) {
    const url = new URL("play.html", location.href);
    url.searchParams.set("build", build.id);
    return url.href;
  }
  return publicGameUrl(build.url);
}

const preferredOrder = [
  "megarrito",
  "email--seagull-snatch",
  "email--flappy-shooter",
  "email--miaucalipsis",
  "email--flap-battle",
  "email--demigod-flight",
  "email--stationary-bird",
  "email--flappy-parry",
];
const copyTimers = new WeakMap();

function notifyCopied(status, button, message) {
  if (copyTimers.has(status)) clearTimeout(copyTimers.get(status));
  status.textContent = message;
  status.hidden = false;
  if (button) button.classList.add("is-copied");
  copyTimers.set(status, setTimeout(() => {
    status.hidden = true;
    if (button) button.classList.remove("is-copied");
  }, 3000));
}

async function copyGameLink(build, status, button = null) {
  const url = shareUrl(build);
  $("share-fallback").hidden = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard not available");
    await navigator.clipboard.writeText(url);
    notifyCopied(status, button, "Link copied!");
  } catch {
    const input = $("share-fallback-input");
    input.value = url;
    $("share-fallback").hidden = false;
    input.focus();
    input.select();
    notifyCopied(status, button, "Select and copy the link below");
    $("share-fallback").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function linkIcon() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  for (const d of [
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
    "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  ]) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

function imageFor(build) {
  if (build.preview !== true) {
    const placeholder = element("div", "", "games-card-placeholder");
    placeholder.append(element("span", "Flappy AI Jam"), element("strong", build.title));
    return placeholder;
  }
  const image = element("img", "", "card-art");
  image.src = "event/previews/" + build.id + ".webp";
  image.alt = "";
  image.width = 640;
  image.height = 400;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    const placeholder = element("div", "", "games-card-placeholder");
    placeholder.append(element("span", "Flappy AI Jam"), element("strong", build.title));
    image.replaceWith(placeholder);
  }, { once: true });
  return image;
}

function makeCard(build) {
  const card = element("article", "", "card games-card");
  const media = element("div", "", "games-card-media");
  media.append(imageFor(build));
  const placement = eventState?.placements?.find((item) => item.id === build.id);
  if (placement && Number.isInteger(placement.rank)) {
    const badgeLabel = awardsFor(eventState, build)[0] || placement.rank + " place";
    const badge = element("span", badgeLabel, "games-place-pill");
    badge.classList.add("games-rank-" + placement.rank);
    media.append(badge);
  }
  const body = element("div", "", "card-body");
  body.append(element("h3", build.title), element("p", build.builder, "byline"));
  if (typeof build.description === "string" && build.description) body.append(element("p", build.description));
  const actions = element("div", "", "games-card-actions");
  const play = element("button", "Play game", "primary games-play-button");
  play.type = "button";
  play.addEventListener("click", () => void openBuild(build));
  const copyWrap = element("div", "", "games-copy-wrap");
  const copy = element("button", "", "games-copy-button");
  copy.type = "button";
  copy.title = "Copy link to " + build.title;
  copy.setAttribute("aria-label", "Copy link to " + build.title);
  copy.append(linkIcon());
  const status = element("span", "", "games-copy-feedback");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  copy.addEventListener("click", () => void copyGameLink(build, status, copy));
  copyWrap.append(copy, status);
  actions.append(play, copyWrap);
  body.append(actions);
  card.append(media, body);
  return card;
}

function render() {
  const sorted = [...builds].sort((a,b) => {
    const ai = preferredOrder.indexOf(a.id), bi = preferredOrder.indexOf(b.id);
    return (ai < 0 ? preferredOrder.length : ai) - (bi < 0 ? preferredOrder.length : bi);
  });
  $("games-grid").replaceChildren(...sorted.map(makeCard));
  $("games-count").textContent = sorted.length + (sorted.length === 1 ? " game" : " games");
  $("games-message").hidden = sorted.length > 0;
  $("games-message").textContent = "No approved builds are available yet. Check back for new submissions.";
}

function resizeFrame() {
  frameBox.style.setProperty("--frame-scale", String(frameBox.clientWidth / 480));
}

async function openBuild(build) {
  activeFrame?.remove();
  activeFrame = null;
  selectedBuild = build;
  const url = new URL(location.href);
  url.searchParams.set("build", build.id);
  history.replaceState(null, "", url);
  $("games-player-title").textContent = build.title;
  $("games-player-copy-status").hidden = true;
  $("games-player-builder").textContent = "Built by " + build.builder;
  $("games-player-description").textContent = build.description || "A student-created AI game.";
  $("games-player-full").href = fullGameUrl(build);
  frameStatus.hidden = false;
  frameStatus.textContent = "Loading game…";
  const source = publishedGamePath(build);
  const externalUrl = publicGameUrl(build.url);
  const geminiShare = !source && externalUrl && isGeminiShare(new URL(externalUrl));
  frameBox.classList.toggle("external-preview", Boolean(geminiShare));
  if (!player.open) player.showModal();
  if (geminiShare) {
    frameStatus.textContent = "This game needs to open in its own tab.";
    return;
  }
  resizeFrame();
  const frame = element("iframe");
  frame.title = build.title;
  frame.width = "480";
  frame.height = "640";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("allow", "camera 'none'; microphone 'none'");
  frame.referrerPolicy = "no-referrer";
  frame.addEventListener("load", () => {
    if (activeFrame === frame) frameStatus.hidden = true;
  });
  activeFrame = frame;
  try {
    if (source) {
      const html = await loadPublishedGame(source);
      if (activeFrame !== frame) return;
      frame.srcdoc = standaloneGameDocument(html);
    } else if (externalUrl) {
      frame.src = externalUrl;
    } else {
      throw new Error("Unplayable game");
    }
    frameBox.append(frame);
  } catch {
    if (activeFrame !== frame) return;
    activeFrame = null;
    frameStatus.textContent = "Unable to load this game here. Try opening it in a new tab.";
  }
}

player.addEventListener("close", () => {
  activeFrame?.remove();
  activeFrame = null;
  selectedBuild = null;
  const url = new URL(location.href);
  url.searchParams.delete("build");
  history.replaceState(null, "", url);
});
$("games-player-share").addEventListener("click", () => {
  if (selectedBuild) void copyGameLink(selectedBuild, $("games-player-copy-status"));
});
if (typeof ResizeObserver === "function") new ResizeObserver(resizeFrame).observe(frameBox);
else window.addEventListener("resize", resizeFrame);

async function refresh() {
  if (player.open) return;
  const [manifest, event] = await Promise.allSettled([loadManifest(), loadEvent()]);
  if (manifest.status === "rejected") {
    if (!started) $("games-message").textContent = "Could not load the games. This page will retry automatically.";
    return;
  }
  const next = [];
  const seen = new Set();
  for (const build of manifest.value) {
    if (validBuild(build) && !seen.has(build.id)) { next.push(build); seen.add(build.id); }
  }
  const nextManifestKey = JSON.stringify(next);
  const nextEventKey = event.status === "fulfilled" ? JSON.stringify(event.value) : "";
  const changed = nextManifestKey !== manifestKey || nextEventKey !== eventKey;
  builds = next;
  if (event.status === "fulfilled") eventState = event.value;
  if (changed || !started) {
    manifestKey = nextManifestKey;
    eventKey = nextEventKey;
    render();
  }
  if (!started) {
    started = true;
    const selected = new URLSearchParams(location.search).get("build");
    const build = builds.find((item) => item.id === selected);
    if (build) void openBuild(build);
    else if (selected) {
      $("games-message").hidden = false;
      $("games-message").textContent = "That game is not in the approved gallery. Browse the available games below.";
    }
  }
}
void refresh();
setInterval(() => void refresh(), 20000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void refresh();
});
