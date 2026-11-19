<div align="center">

# Flappy AI Jam

The 30-Minute AI Game Jam · Flappy Bird Edition

University of Portsmouth AI Society<br>
Thursday 19 November 2026 · 18:30–20:00 GMT<br>
Future Technology Centre · Floor 2 · Jam starts at 18:45

[![Forks](https://img.shields.io/github/forks/uopaisociety/flappy-ai-jam?style=flat-square&color=073B5C)](https://github.com/uopaisociety/flappy-ai-jam/network/members)
[![Stars](https://img.shields.io/github/stars/uopaisociety/flappy-ai-jam?style=flat-square&color=073B5C)](https://github.com/uopaisociety/flappy-ai-jam/stargazers)
[![Stack](https://img.shields.io/badge/stack-HTML5_Canvas_%7C_Vanilla_JS-073B5C?style=flat-square)](https://github.com/uopaisociety/flappy-ai-jam/blob/main/index.html)
[![Sprint](https://img.shields.io/badge/sprint-30_minutes-E6B325?style=flat-square&labelColor=073B5C)](https://github.com/uopaisociety/flappy-ai-jam)

[Play the starter](https://uopaisociety.github.io/flappy-ai-jam/) · [Play and share student games](https://uopaisociety.github.io/flappy-ai-jam/games.html) · [Event hub and Hall of Fame](https://uopaisociety.github.io/flappy-ai-jam/showcase.html)

[How to hand in your game](https://uopaisociety.github.io/flappy-ai-jam/showcase.html#submit)

</div>

## Overview

One file. Thirty minutes. Turn this small Flappy Bird into a better game, or a stranger one, by talking to Gemini. You do not need to know how to code. First-years from any course and third-year computer science students start from the same file.

The whole game is [`index.html`](index.html), in the top folder of this repo. The live starter is already at <https://uopaisociety.github.io/flappy-ai-jam/>. Keep your game in that same file, in that same place, so your own link works the same way.

Nothing to install, and no local server. Gemini Canvas can run the file, and so can a double-click.

**Taking part?** Bring a laptop and charger. Before you arrive, sign in to Gemini with a personal Google account and open Canvas once. Free Gemini is enough. Start with the [participant guide](https://uopaisociety.github.io/flappy-ai-jam/showcase.html#setup). If you only have a phone or can’t sign in, ask the help desk to pair you up.

## Publish your own copy on GitHub (optional)

If you want a public game link of your own, you can publish a copy from a web browser.

1. **Sign in.** Use your [GitHub account](https://github.com/login) or [create one](https://github.com/signup).
2. **Fork.** Click **Fork** and **Create fork** to make a public copy under your account.
3. **Paste your game.** Open `index.html` in your fork, click **Edit this file**, and replace the contents with your full working HTML. Choose **Commit changes** directly to `main`.
4. **Turn on Pages.** In your fork, open **Settings → Pages**. Choose **Deploy from a branch**, then set **main** and **/ (root)** and click **Save**. Check the Pages screen for the deployment status.
5. **Check your link.** Open `https://<your-username>.github.io/flappy-ai-jam/` in a private browser window and play a round. If Pages is still building during hand-in, use your Canvas share link or bring your working game to the help desk.

## No GitHub account?

From 19:05, bring your finished HTML file or playable game link, game name, team name and the request you sent to AI to the help desk. The committee can submit it for you. If sharing fails, bring your working preview or game file for a live demo. Ask for a paper slip to vote in the room.

## Repository architecture

```text
flappy-ai-jam/
├── index.html      standalone starter game
├── showcase.html   attendee guide, reference mods, gallery and awards
├── arcade.html     projector timer, demo queue and local judging
├── vote.html       audience ballot and projector QR
├── event/          shared branding and event page assets
└── submissions/    approved entries and published ballot state
```

Leave `index.html` in the top folder. GitHub Pages serves that folder from the `main` branch. If you move the file, your link stops working.

These comments in the file mark the parts Gemini should keep. They appear in this order:

- `CONFIG` — speeds, sizes, and colours. Change these numbers first.
- `PHYSICS & INPUT` — gravity, tap and keyboard input, pause and restart.
- `PIPES / LEVEL` — gaps that narrow gradually, smooth height changes and collision checks.
- `SCORE & GAME OVER` — three lives, short recovery after a bump and the end screen.
- `GRAPHICS` — sky, pipes, ground and bird, drawn with shapes.
- `GAME LOOP` — fixed simulation steps, independent of screen refresh rate.

## Quickstart

**Gemini Canvas (recommended).** Nothing to install.

1. Open the [participant guide](https://uopaisociety.github.io/flappy-ai-jam/showcase.html#setup) and select **Copy starter prompt**.
2. Open [Gemini](https://gemini.google.com) in your browser and choose **Canvas** near the message box.
3. With **Canvas** selected, paste into the chat and send it. Open **Preview** and play a round.
4. Ask for one change in the same chat and play again.

If Gemini replies with code in the chat, start a fresh Canvas chat and paste the prompt again. You can also [download the starter HTML](https://uopaisociety.github.io/flappy-ai-jam/index.html) and copy its contents from a text editor.

**On your own computer (optional).** Gemini Canvas is still the route for the evening. This path is only if you already work on your own machine.

Nothing to install if you just want to play: click **Code**, then **Download ZIP**, unzip, and double-click `index.html`. If you already use git, clone your fork and double-click the file:

```bash
git clone https://github.com/<your-username>/flappy-ai-jam.git
```

**VS Code or Zed (advanced).** Open that folder, edit `index.html`, save, and refresh the browser. To publish, follow the [optional GitHub Pages steps](#publish-your-own-copy-on-github-optional).

**Antigravity IDE (advanced).** Google's desktop agentic IDE. Set it up before the event from the [Google Antigravity download page](https://antigravity.google/download). Open your project folder and ask the agent to edit `index.html` using one of the ideas below. Open `index.html` in a browser to preview, then commit and push to your fork.

## Prompt guide

The **Copy starter prompt** button includes the complete `index.html` and its editing rules. Paste it into Canvas once. When Preview plays and restarts, try one of the changes below. If you’re copying the file manually, send the whole file and ask Gemini to open a playable Canvas preview and follow the rules at the top.

Keep the game in one file and preserve touch and keyboard controls. Keep best-score storage optional by wrapping `localStorage` reads and writes in `try/catch`, so a sandboxed preview can still run.

### Change the theme

Swap the theme for anything you like. A lecture you are late for, your cat, a game you already love. This example is Portsmouth. Gameplay stays the same.

```text
Reskin this game into "Flappy Seagull: Portsmouth Edition". The bird becomes a cheeky seagull
(drawn with Canvas shapes) that has just stolen a chip. Pipes become the Spinnaker Tower and
stacks of Southsea deckchairs. Background: a sunset over the Solent, with the Isle of Wight
as a silhouette and a ferry scrolling past. Rename the title, the start screen and the game
over text to match ("You dropped your chip!"). Keep the gameplay the same.
```

### Add a way to play

```text
Add one shield power-up that floats through a pipe gap. Picking it up should absorb
one hit. Give the shield its own colour and short label. Keep the existing three
lives, touch controls and difficulty ramp.
```

### Polish how it feels

```text
Add a short burst of Canvas particles when the bird flaps. Use a different colour
for the particles when you score. Keep the controls and difficulty the same.
```

### If Gemini breaks the game

```text
The game is broken. Here is what happens: [describe it, for example "black screen" or "the bird does not move"].
Here is the error from the browser console: [paste the red text].
Fix only that bug, keep every feature, and return the FULL working index.html.
```

- To see the error, press **F12** (on a Mac, **Cmd + Option + I**) and open **Console**. Copy the red text into the prompt above.
- If Canvas cuts the file short or loses an earlier change, start a fresh Canvas chat with the last working HTML and ask for a smaller change.
- If you hit a usage limit, pair up, ask at the desk, or try [AI Studio Build mode](https://aistudio.google.com/learn/ai-app-builder).
- Save a playable version after each change so you have something to hand in.

## Submission and judging

Hand in at the help desk from 19:05, or use [Submit Your Build](https://github.com/uopaisociety/flappy-ai-jam/issues/new?template=submit-build.yml) with a GitHub account. Include the game title, team name and main AI request.

- **Single-file game.** Bring your finished `index.html`, or paste its full contents into the form. A checked HTML export is the version the gallery plays. You can also include the Canvas share link using **Share & export → Share → Copy link**.
- **Multi-file game.** Submit the live GitHub Pages URL, such as `https://your-username.github.io/your-game/`, or another public URL that opens the game. Test it while signed out. The link route also works for an HTML file above the form’s 50,000-character limit.

Your game, team name, AI request, and any submitted code or link are public after review. Check your issue for the gallery link or feedback. For an update, tell the help desk or file a new issue online. The newest approved online submission per GitHub account owns that account’s gallery link.

| Category | What it rewards | How we judge it |
| --- | --- | --- |
| Best Engineered | Technical execution | The game runs, the new ideas work, and the build is the strongest in the room. |
| Most Unhinged Prompt | Creative prompting | The idea is bold and the prompts are specific. No coding is required, so this category is open to everyone. |
| People's Choice | The room vote | The audience votes once on paper or with a GitHub account. Combined votes decide the award. |

## Hall of Fame

Open the [live gallery](https://uopaisociety.github.io/flappy-ai-jam/showcase.html) or run `python3 -m http.server 8000` in the repository root and open <http://localhost:8000/showcase.html>. You can double-click any example file for standalone play.

| Reference mod | Quick preview |
| --- | --- |
| [Autopilot](examples/01-neural-autopilot.html) | Choose **Play**. The autopilot starts on. Press **A** or select **Autopilot** to fly manually. |
| [Voice flight](examples/02-voice-frequency-thruster.html) | Choose **Play** and use **Space** or tap. Open in a new tab and select **Enable mic** to try short words. |
| [Boss rush](examples/03-overclock-boss-protocol.html) | Choose **Play** to meet the first boss. Press **Shift** or select **Dash** for a short shield. |

All four games have three lives with brief recovery after a hit. After an eight-second warm-up, speed increases, new gaps narrow and height changes grow over the next minute. Existing gaps keep their shape as you approach. Reference demo rounds finish after 90 seconds to keep projected turns moving. The starter continues until its three lives are lost. All four games pause when their window loses focus.

### For the committee

See the [committee runbook](COMMITTEE.md) for the projector, help desk, batch publishing and the paper ballot.

### Shared event page styles

Future event pages can import `event/brand/shell.css` for the join-page header and background. It includes `event/brand/tokens.css`. Use the `.society-header` and `.ambient` markup from `showcase.html` and link `event/brand/icon.svg` for the theme-aware favicon. Add `data-animate` to the body when the page benefits from the 32-second drift. The CSS respects reduced motion. `event/site.css` supplies the event hub and ballot layouts. The starter requires only its own HTML.

## About the society

University of Portsmouth AI Society. Free to join, for every course and every level.

[GitHub](https://github.com/uopaisociety) · [Instagram](https://instagram.com/uopaisociety) · [X](https://x.com/uopaisociety) · [Luma](https://luma.com/uopaisociety) · [LinkedIn](https://linkedin.com/company/aisocietyuop) · [aisociety@upsu.net](mailto:aisociety@upsu.net)

If you post your game, tag @uopaisociety.
