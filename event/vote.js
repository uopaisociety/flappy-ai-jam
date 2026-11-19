import { drawQr } from "./qr.js";
import {
  isGeminiShare, loadEvent, loadManifest, loadPublishedGame, publicGameUrl,
  publishedGamePath, repository, standaloneGameDocument,
} from "./state.js";

const byId = (id) => document.getElementById(id);
const form = byId("vote-form");
const choices = byId("choices");
const comment = byId("comment");
const cast = byId("cast");
const resultList = byId("results");
const status = byId("status");
const projectorStatus = byId("projector-status");
const projector = new URLSearchParams(location.search).has("projector");
byId("ballot").hidden = projector;
byId("projector").hidden = !projector;
const ballotUrl = new URL("vote.html", location.href).href;
if (projector) {
  const qr = byId("projector-qr");
  qr.hidden = !drawQr(qr, ballotUrl);
}

const full = byId("fullscreen");
if (document.fullscreenEnabled) {
  full.hidden = false;
  full.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      full.textContent = "Use browser fullscreen";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    full.textContent = document.fullscreenElement ? "Exit fullscreen" : "Fullscreen";
  });
}

function element(tag, text) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
}

function galleryLink(candidate) {
  return `showcase.html?build=${encodeURIComponent(candidate.id)}`;
}

function renderChoices(event) {
  for (const [index, candidate] of event.candidates.entries()) {
    const row = element("div");
    row.className = "choice";
    const radio = element("input");
    radio.type = "radio";
    radio.name = "build";
    radio.id = "candidate-" + candidate.id;
    radio.value = candidate.id;
    radio.required = true;
    const label = element("label", (index + 1) + ". " + candidate.title);
    label.htmlFor = radio.id;
    label.append(element("small", candidate.builder));
    const play = playButton(candidate);
    if (event.paperOnly) {
      row.append(element("span", (index + 1) + "."), element("span", candidate.title + " · " + candidate.builder), play);
    } else {
      row.append(radio, label, play);
    }
    choices.append(row);
  }
  if (!event.paperOnly) cast.href = repository + "/issues/" + event.issue + "#new_comment_field";
}

form.addEventListener("change", () => { byId("vote-code").hidden = true; });
byId("prepare").addEventListener("click", () => {
  if (!choices.querySelector(":checked")) choices.querySelector("input")?.focus();
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const build = new FormData(form).get("build");
  if (!build) return;
  comment.value = "Vote: " + build;
  byId("vote-code").hidden = false;
  try {
    await navigator.clipboard.writeText(comment.value);
    byId("copy-note").textContent = "Copied. Open GitHub, paste your ballot and press Comment.";
  } catch {
    byId("copy-note").textContent = "Copy the selected text, open GitHub, paste it and press Comment.";
    comment.select();
    return;
  }
  cast.focus();
});

function renderResults(event) {
  const ranked = [...event.candidates].sort((a, b) => event.counts[b.id] - event.counts[a.id]);
  resultList.replaceChildren(...ranked.map((candidate) => {
    const count = event.counts[candidate.id];
    const result = element("li", `${candidate.title} · ${count} ${count === 1 ? "vote" : "votes"}`);
    if (event.awards?.audience?.includes(candidate.id)) result.append(" · People’s Choice");
    return result;
  }));
}

const player = byId("vote-player");
const frameBox = byId("vote-frame-box");
const frameStatus = byId("vote-frame-status");
let activeFrame = null;
let gamesById = new Map();
let gamesKey;

function playableBuild(build) {
  return build && build.kind === "submission"
    && typeof build.id === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/i.test(build.id)
    && typeof build.title === "string" && build.title.trim()
    && typeof build.builder === "string" && build.builder.trim()
    && Boolean(publishedGamePath(build) || publicGameUrl(build.url));
}

function playButton(candidate) {
  const button = element("button", "Play here");
  button.type = "button";
  button.setAttribute("aria-label", "Play " + candidate.title + " on this page");
  button.addEventListener("click", () => void playById(candidate.id));
  return button;
}

function updateGamesStatus(message, hidden = false) {
  for (const id of ["ballot-games-status", "projector-games-status"]) {
    const node = byId(id);
    node.textContent = message;
    node.hidden = hidden;
  }
}

function renderGameList(target, builds) {
  target.replaceChildren(...builds.map((build) => {
    const row = element("article", "", "vote-game");
    const info = element("div");
    info.append(element("h3", build.title), element("p", build.builder));
    row.append(info, playButton(build));
    return row;
  }));
}

async function refreshGames() {
  try {
    const manifest = await loadManifest();
    const builds = manifest.filter(playableBuild);
    const key = JSON.stringify(builds);
    if (key === gamesKey) return;
    gamesById = new Map(builds.map((build) => [build.id, build]));
    renderGameList(byId("ballot-games-list"), builds);
    renderGameList(byId("projector-games-list"), builds);
    updateGamesStatus(builds.length ? "" : "No approved games are available yet.", Boolean(builds.length));
    gamesKey = key;
  } catch {
    if (gamesKey === undefined) updateGamesStatus("Couldn’t load the games. Try again shortly.");
  }
}

async function playById(id) {
  if (!gamesById.has(id)) await refreshGames();
  const build = gamesById.get(id);
  if (!build) {
    updateGamesStatus("That game is not available to play here yet. Check the Hall of Fame.");
    return;
  }
  await launchGame(build);
}

function resizeFrame() {
  frameBox.style.setProperty("--frame-scale", String(frameBox.clientWidth / 480));
}

async function launchGame(build) {
  activeFrame?.remove();
  activeFrame = null;
  frameStatus.hidden = false;
  frameStatus.textContent = "Loading game…";
  byId("vote-player-title").textContent = build.title;
  byId("vote-player-builder").textContent = build.builder;
  const source = publishedGamePath(build);
  const url = publicGameUrl(build.url);
  const external = url && isGeminiShare(new URL(url));
  const fallback = byId("vote-player-external");
  fallback.href = url || galleryLink(build);
  fallback.textContent = url ? "Open game in new tab" : "Open in Hall of Fame";
  byId("vote-player-help").textContent = external
    ? "This game requires an external page. Open the link above to try it."
    : "Play with the game’s keyboard or touch controls. If the embedded preview is blocked, open it in a new tab.";
  frameBox.classList.toggle("external-preview", Boolean(external));
  if (!player.open) player.showModal();
  if (external) {
    frameStatus.textContent = "This game opens on an external page.";
    fallback.focus();
    return;
  }
  resizeFrame();
  const frame = element("iframe");
  frame.title = build.title;
  frame.width = "480";
  frame.height = "640";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("allow", "microphone 'none'; camera 'none'");
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
    } else if (url) {
      frame.src = url;
    } else {
      throw new Error("No playable game URL");
    }
    frameBox.append(frame);
  } catch {
    if (activeFrame !== frame) return;
    activeFrame = null;
    frameStatus.textContent = "The game could not load here. Use the link above to open the gallery.";
  }
}

player.addEventListener("close", () => {
  activeFrame?.remove();
  activeFrame = null;
  frameStatus.hidden = false;
});
if (typeof ResizeObserver === "function") new ResizeObserver(resizeFrame).observe(frameBox);
else window.addEventListener("resize", resizeFrame);

let rendered;
async function refresh() {
  try {
    const event = await loadEvent();
    const key = JSON.stringify(event);
    if (rendered === key) return;
    const open = event.state === "open";
    const closed = event.state === "closed";
    const paperOnly = event.paperOnly === true;
    status.textContent = open ? paperOnly ? "Voting is open on paper." : "Voting is open."
      : closed ? "Voting is closed."
      : "Voting opens after the demos. You can try the approved games below while you wait.";
    projectorStatus.textContent = open ? paperOnly ? "Pick one game. Write its number on your paper slip." : "Pick one game. Use a paper slip or scan to vote online."
      : closed ? "Voting has closed. Scan to see the results."
      : "Scan to open the ballot. Voting starts after the demos.";
    choices.replaceChildren();
    form.hidden = !open;
    byId("online-vote").hidden = paperOnly;
    byId("online-help").hidden = paperOnly;
    byId("vote-code").hidden = true;
    resultList.hidden = !closed;
    byId("projector-choices").hidden = !open;
    if (open) {
      renderChoices(event);
      byId("projector-list").replaceChildren(...event.candidates.map((candidate, index) => {
        const item = element("li");
        item.append(element("span", (index + 1) + ". " + candidate.title + " · " + candidate.builder), playButton(candidate));
        return item;
      }));
    }
    if (closed) renderResults(event);
    rendered = key;
  } catch {
    status.textContent = "Couldn’t load the ballot. If you’re in the room, ask the help desk for a paper slip.";
    projectorStatus.textContent = status.textContent;
    form.hidden = true;
    resultList.hidden = true;
    rendered = undefined;
  }
}

void refresh();
void refreshGames();
setInterval(refresh, 12000);
setInterval(refreshGames, 15000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void refresh();
});
