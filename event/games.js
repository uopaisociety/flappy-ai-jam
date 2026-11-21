import { awardsFor, isGeminiShare, loadEvent, loadManifest, loadPublishedGame, publicGameUrl, publishedGamePath, standaloneGameDocument } from "./state.js";

const $ = (id) => document.getElementById(id);
const player = $("games-player");
const frameBox = $("games-frame-box");
const frameStatus = $("games-frame-status");
const grid = $("games-grid");
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
const copyRequests = new WeakMap();

async function copyGameLink(url, status, button) {
  const request = {};
  const focus = document.activeElement;
  copyRequests.set(status, request);
  status.textContent = "";
  status.parentElement.querySelector(".games-share-fallback")?.remove();
  let copied = false;
  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch { /* Offer the link as a selectable field below. */ }
  if (!button.isConnected || copyRequests.get(status) !== request || (player.contains(button) && !player.open)) return;
  if (copied) {
    status.textContent = "Game link copied.";
    return;
  }
  const field = element("div", "", "games-share-fallback");
  const label = element("label", "Copy the game link");
  const input = element("input");
  input.id = status.id + "-link";
  input.type = "url";
  input.readOnly = true;
  input.value = url;
  label.htmlFor = input.id;
  field.append(label, input);
  status.after(field);
  status.textContent = "Clipboard unavailable. Copy the link manually.";
  if (document.activeElement === focus) {
    input.focus();
    input.select();
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
  function placeholderFor() {
    const placeholder = element("div", "", "games-card-placeholder");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.append(element("span", "Flappy AI Jam"), element("strong", build.title));
    return placeholder;
  }
  if (build.preview !== true) return placeholderFor();
  const image = element("img", "", "card-art");
  image.src = "event/previews/" + build.id + ".webp";
  image.alt = "";
  image.width = 640;
  image.height = 400;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => image.replaceWith(placeholderFor()), { once: true });
  return image;
}

function copyButton(title, url, status) {
  const copy = element("button", "", "games-copy-button");
  copy.type = "button";
  copy.title = "Copy link to " + title;
  copy.setAttribute("aria-label", copy.title);
  copy.append(linkIcon());
  copy.addEventListener("click", () => void copyGameLink(url, status, copy));
  return copy;
}

function makeCard(build) {
  const card = element("li", "", "card games-card");
  card.dataset.buildId = build.id;
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
  play.setAttribute("aria-label", "Play game: " + build.title);
  play.setAttribute("aria-haspopup", "dialog");
  play.addEventListener("click", () => {
    play.focus({ preventScroll: true });
    void openBuild(build);
  });
  const copyWrap = element("div", "", "games-copy-wrap");
  const status = element("p", "", "games-copy-feedback");
  status.id = "games-copy-" + build.id;
  status.setAttribute("role", "status");
  copyWrap.append(copyButton(build.title, shareUrl(build), status));
  actions.append(play, copyWrap);
  body.append(actions, status);
  card.append(media, body);
  return card;
}

for (const card of grid.querySelectorAll(".games-card")) {
  const link = card.querySelector(".games-copy-button");
  const status = card.querySelector(".games-copy-feedback");
  status.id = "games-copy-" + card.dataset.buildId;
  link.replaceWith(copyButton(card.querySelector("h3").textContent, link.href, status));
}

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".games-card");
  if (card && !event.target.closest("a, button, .games-share-fallback") && window.getSelection()?.isCollapsed !== false) {
    card.querySelector(".games-play-button").click();
  }
});

function render() {
  const sorted = [...builds].sort((a,b) => {
    const ai = preferredOrder.indexOf(a.id), bi = preferredOrder.indexOf(b.id);
    return (ai < 0 ? preferredOrder.length : ai) - (bi < 0 ? preferredOrder.length : bi);
  });
  grid.replaceChildren(...sorted.map(makeCard));
  $("games-count").textContent = sorted.length + (sorted.length === 1 ? " game" : " games");
  $("games-message").textContent = sorted.length ? "" : "No approved builds are available yet. Check back for new submissions.";
}

function resizeFrame() {
  const width = frameBox.clientWidth;
  if (width > 0) frameBox.style.setProperty("--frame-scale", String(width / 480));
}

async function openBuild(build) {
  activeFrame?.remove();
  activeFrame = null;
  selectedBuild = build;
  const url = new URL(location.href);
  url.searchParams.set("build", build.id);
  history.replaceState(null, "", url);
  $("games-player-title").textContent = build.title;
  $("games-player-builder").textContent = "Built by " + build.builder;
  $("games-player-description").textContent = build.description || "A student-created AI game.";
  $("games-player-full").href = fullGameUrl(build);
  $("games-player-message").textContent = "";
  const copyStatus = $("games-player-copy-status");
  copyRequests.delete(copyStatus);
  copyStatus.textContent = "";
  player.querySelector(".games-share-fallback")?.remove();
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
  frame.title = build.title + " game";
  frame.setAttribute("aria-describedby", "games-player-tip");
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
      if (!player.open || activeFrame !== frame) return;
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
    $("games-player-message").textContent = frameStatus.textContent;
  }
}

player.addEventListener("close", () => {
  if (player.open) return;
  activeFrame?.remove();
  activeFrame = null;
  selectedBuild = null;
  const url = new URL(location.href);
  url.searchParams.delete("build");
  history.replaceState(null, "", url);
});
$("games-player-share").addEventListener("click", (event) => {
  if (selectedBuild) void copyGameLink(shareUrl(selectedBuild), $("games-player-copy-status"), event.currentTarget);
});
if (typeof ResizeObserver === "function") new ResizeObserver(resizeFrame).observe(frameBox);
else window.addEventListener("resize", resizeFrame);

async function refresh() {
  if (player.open || grid.contains(document.activeElement) || typeof player.showModal !== "function") return;
  const [manifest, event] = await Promise.allSettled([loadManifest(), loadEvent()]);
  if (player.open || grid.contains(document.activeElement)) return;
  if (manifest.status === "rejected") {
    // The HTML contains the current games as a fallback. Retain them if
    // a deployment or network issue prevents the live manifest from loading.
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
    if (build) grid.querySelector(`[data-build-id="${build.id}"] .games-play-button`).click();
    else if (selected) {
      $("games-message").textContent = "That game is not in the approved gallery. Browse the available games below.";
    }
  }
}
void refresh();
setInterval(() => void refresh(), 20000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void refresh();
});
