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

async function share(build) {
  const url = shareUrl(build);
  const message = $("share-status");
  message.hidden = true;
  $("share-fallback").hidden = true;
  if (navigator.share) {
    try {
      await navigator.share({ title: build.title + " — Flappy AI Jam", text: "Play " + build.title + " by " + build.builder, url });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    message.textContent = "Link copied for " + build.title + ".";
    message.hidden = false;
  } catch {
    const input = $("share-fallback-input");
    input.value = url;
    $("share-fallback").hidden = false;
    input.select();
    message.textContent = "Copy this link to share " + build.title + ".";
    message.hidden = false;
  }
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
  const card = element("article", "", "card");
  const body = element("div", "", "card-body");
  for (const award of awardsFor(eventState, build)) {
    body.append(element("span", award, "badge winner"));
  }
  body.append(element("h3", build.title), element("p", build.builder, "byline"));
  if (build.description) body.append(element("p", build.description));
  const actions = element("div", "", "games-card-actions");
  const play = element("button", "Play here", "primary");
  play.type = "button";
  play.setAttribute("aria-label", "Play " + build.title + " on this page");
  play.addEventListener("click", () => void openBuild(build));
  const full = element("a", "Open full game ↗", "action");
  full.href = fullGameUrl(build);
  full.target = "_blank";
  full.rel = "noopener noreferrer";
  full.setAttribute("aria-label", "Open " + build.title + " in a new tab");
  const shareButton = element("button", "Share this game", "games-share-button");
  shareButton.type = "button";
  shareButton.addEventListener("click", () => void share(build));
  actions.append(play, full, shareButton);
  body.append(actions);
  card.append(imageFor(build), body);
  return card;
}

function makeWinner(build, label) {
  const card = element("article", "", "panel games-result-card");
  const badge = element("p", label, "meta");
  const title = element("h3", build.title);
  const builder = element("p", "By " + build.builder, "byline");
  const actions = element("div", "", "actions");
  const play = element("button", "Play here", "primary");
  play.type = "button";
  play.addEventListener("click", () => void openBuild(build));
  const full = element("a", "Open full game ↗", "action");
  full.href = fullGameUrl(build);
  full.target = "_blank";
  full.rel = "noopener noreferrer";
  const shareButton = element("button", "Share game");
  shareButton.type = "button";
  shareButton.addEventListener("click", () => void share(build));
  actions.append(play, full, shareButton);
  card.append(badge, title, builder, actions);
  return card;
}

function render() {
  const placements = Array.isArray(eventState?.placements) ? eventState.placements : [];
  const winnerCards = placements.map((placement) => {
    const build = builds.find((item) => item.id === placement.id);
    if (!build) return null;
    const label = awardsFor(eventState, build)[0] ?? "Winner";
    return makeWinner(build, label);
  }).filter(Boolean);
  $("results").hidden = winnerCards.length === 0;
  $("results-grid").replaceChildren(...winnerCards);
  $("games-grid").replaceChildren(...builds.map(makeCard));
  $("games-count").textContent = builds.length + (builds.length === 1 ? " game" : " games");
  $("games-message").hidden = builds.length > 0;
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
  if (selectedBuild) void share(selectedBuild);
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
