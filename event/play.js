import { isGeminiShare, loadManifest, loadPublishedGame, publicGameUrl, publishedGamePath, standaloneGameDocument } from "./state.js";

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("build");
const validId = typeof id === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/i.test(id);
let currentBuild = null;

function fail(message) {
  $("game-loading").hidden = false;
  $("game-loading").textContent = message;
}

function shareLink() {
  const url = new URL("games.html", location.href);
  url.searchParams.set("build", id);
  return url.href;
}

$("game-share").addEventListener("click", async () => {
  if (!currentBuild) return;
  const link = shareLink();
  $("game-share-status").hidden = true;
  $("game-share-fallback").hidden = true;
  if (navigator.share) {
    try {
      await navigator.share({ title: currentBuild.title + " — Flappy AI Jam", url: link });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(link);
    $("game-share-status").textContent = "Game link copied.";
    $("game-share-status").hidden = false;
  } catch {
    $("game-share-fallback").value = link;
    $("game-share-fallback").hidden = false;
    $("game-share-fallback").select();
    $("game-share-status").textContent = "Copy the selected link.";
    $("game-share-status").hidden = false;
  }
});

async function start() {
  if (!validId) {
    fail("No game selected. Return to All games to choose one.");
    return;
  }
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
    currentBuild = build;
    document.title = build.title + " · Flappy AI Jam";
    $("game-title").textContent = build.title;
    $("game-builder").textContent = "By " + build.builder;
    if (!source && isGeminiShare(new URL(externalUrl))) {
      $("game-loading").hidden = true;
      $("game-external").hidden = false;
      $("game-external-link").href = externalUrl;
      return;
    }
    // Keep the empty placeholder compatible with previously cached player scripts.
    const placeholder = $("game-frame") ?? $("game-frame-template");
    const emptyFrame = placeholder.content?.querySelector("iframe") ?? placeholder;
    const frame = emptyFrame.cloneNode();
    frame.hidden = false;
    frame.title = build.title;
    frame.addEventListener("load", () => { $("game-loading").hidden = true; }, { once: true });
    if (source) {
      frame.srcdoc = standaloneGameDocument(await loadPublishedGame(source));
    } else {
      frame.src = externalUrl;
    }
    placeholder.replaceWith(frame);
  } catch {
    fail("Could not load the game. Return to the gallery and try again.");
  }
}

void start();
