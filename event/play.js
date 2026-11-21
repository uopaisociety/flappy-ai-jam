import { isGeminiShare, loadManifest, loadPublishedGame, publicGameUrl, publishedGamePath, standaloneGameDocument } from "./state.js";

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("build");
const validId = typeof id === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/i.test(id);

function fail(message) {
  $("game-loading").textContent = message;
  $("game-return").hidden = false;
}

async function start() {
  if (!validId) {
    fail("No game selected.");
    return;
  }
  $("game-loading").textContent = "Loading the game…";
  try {
    const builds = await loadManifest();
    const build = builds.find((item) => item.id === id && item.kind === "submission");
    if (!build) {
      fail("This game is not in the approved gallery.");
      return;
    }
    const source = publishedGamePath(build);
    const externalUrl = publicGameUrl(build.url);
    if (!source && !externalUrl) {
      fail("This game is not available to play.");
      return;
    }
    document.title = build.title + " · Flappy AI Jam";
    if (!source && isGeminiShare(new URL(externalUrl))) {
      $("game-status").hidden = true;
      $("game-external").hidden = false;
      $("game-external-link").href = externalUrl;
      return;
    }
    // Set the source before inserting the frame so it starts with the full viewport.
    const placeholder = $("game-frame");
    const frame = placeholder.cloneNode();
    frame.hidden = false;
    frame.title = build.title;
    frame.addEventListener("load", () => { $("game-status").hidden = true; }, { once: true });
    if (source) {
      frame.srcdoc = standaloneGameDocument(await loadPublishedGame(source));
    } else {
      frame.src = externalUrl;
    }
    placeholder.replaceWith(frame);
  } catch {
    fail("Could not load the game. Please try again.");
  }
}

void start();
