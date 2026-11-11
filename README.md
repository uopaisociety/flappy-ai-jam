<div align="center">

# Flappy AI Jam

The 30-Minute AI Game Jam · Flappy Bird Edition

University of Portsmouth AI Society<br>
Thursday 19 November 2026 · 18:30–20:00

[![Forks](https://img.shields.io/github/forks/uopaisociety/flappy-ai-jam?style=flat-square&color=073B5C)](https://github.com/uopaisociety/flappy-ai-jam/network/members)
[![Stars](https://img.shields.io/github/stars/uopaisociety/flappy-ai-jam?style=flat-square&color=073B5C)](https://github.com/uopaisociety/flappy-ai-jam/stargazers)
[![Stack](https://img.shields.io/badge/stack-HTML5_Canvas_%7C_Vanilla_JS-073B5C?style=flat-square)](https://github.com/uopaisociety/flappy-ai-jam/blob/main/index.html)
[![Sprint](https://img.shields.io/badge/sprint-30_minutes-E6B325?style=flat-square&labelColor=073B5C)](https://github.com/uopaisociety/flappy-ai-jam)

[Play the starter](https://uopaisociety.github.io/flappy-ai-jam/)

</div>

## Overview

One file. Thirty minutes. Turn this small Flappy Bird into a better game, or a stranger one, by talking to Gemini. You do not need to know how to code. First-years from any course and third-year computer science students start from the same file.

The whole game is [`index.html`](index.html), in the top folder of this repo. The live starter is already at <https://uopaisociety.github.io/flappy-ai-jam/>. Keep your game in that same file, in that same place, so your own link works the same way.

Nothing to install, and no local server. Gemini Canvas can run the file, and so can a double-click.

**Before Thursday:** UK students can claim [Google AI Plus free for 12 months](https://gemini.google/gb/students/). You need a payment card and a SheerID student check, and that check can take a few days, so claim it before the event. If it is not ready in time, free Gemini still works.

## Never used GitHub? Do this

This is the way to enter if you have never used git. Everything happens in the browser. No terminal.

Star and Fork is the standard way to enter. You get a public project on your own GitHub profile, and a link you can hand in. Do steps 1 to 3 before you start building. Steps 4 to 7 are how you hand the game in, after Gemini has given you a new file.

1. **Sign up or sign in.** Open [github.com/signup](https://github.com/signup) or [github.com/login](https://github.com/login). The buttons say **Sign up** and **Sign in**.
2. **Star.** On this page, click **Star** at the top right.
3. **Fork.** Click **Fork**, leave the boxes as they are, and click **Create fork**. GitHub copies the project to `github.com/<your-username>/flappy-ai-jam`. Click **Fork**, not **Use this template**, even if you see that button.
4. **Paste your game.** In **your** copy, open `index.html` and click the pencil icon (**Edit this file**). Select all (Ctrl+A, or Cmd+A on a Mac), delete, and paste the full file Gemini gave you. The prompt guide is [further down](#prompt-guide) if you have not made a version yet.
5. **Commit changes.** Click **Commit changes**. In the box that opens, leave **Commit directly to the `main` branch** selected, then click **Commit changes** again. A message like "Seagull edition" is enough.
6. **Turn on Pages.** In your copy, open **Settings**, then **Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Set the branch to **main** and the folder to **/ (root)**. Click **Save**. Wait about a minute. The repo needs to stay public.
7. **Submit the link.** Your game is live at `https://<your-username>.github.io/flappy-ai-jam/`. Open it once. The address must contain your username, not `uopaisociety`. Submit that link on the form shown on the screen at the event (there is a QR code in the room).

## No GitHub account?

Create a free account at [github.com/signup](https://github.com/signup) before the event. It takes about two minutes. The 18:30 help desk can help.

You can still play and compete with no GitHub account. Build the game in Gemini Canvas, use Canvas's **Share** button to get a public link, and submit that link. A Gemini Canvas share link is accepted for judging.

Star and Fork is still the standard way to enter, and it puts a public project on your own GitHub profile.

## Repository architecture

```text
flappy-ai-jam/
├── index.html    the whole game
└── README.md     this guide
```

Leave `index.html` in the top folder. GitHub Pages serves that folder from the `main` branch. If you move the file, your link stops working.

These comments in the file mark the parts Gemini should keep. They appear in this order:

- `CONFIG` — speeds, sizes, and colours. Change these numbers first.
- `PHYSICS` — gravity, the flap, and the short pause so a restart is not an accident.
- `PIPES / LEVEL` — where the gaps appear, and what counts as a hit.
- `GRAPHICS` — sky, pipes, ground, and the bird, drawn with shapes.
- `SCORE & GAME OVER` — the score, your best score, and the end screen.

## Quickstart

### Star and Fork

Do this on the society page before you edit anything. The clicks are in [Never used GitHub? Do this](#never-used-github-do-this).

### Choose where you build

**Gemini Canvas (recommended).** Nothing to install.

1. Open [`index.html`](index.html) and click **Copy raw file** (the copy icon above the code).
2. Go to [gemini.google.com](https://gemini.google.com) and choose **Canvas**. It may be under **Tools**.
3. Paste the whole file, and add a line such as "Here is my game. Show me a preview."
4. Open **Preview** and play. Keep asking for changes in the chat.

Free Gemini is enough for the evening. The [Google AI Plus student offer](https://gemini.google/gb/students/) is worth claiming beforehand if you can.

**On your own computer (optional).** Still nothing to install.

- Click **Code**, then **Download ZIP**. Unzip it and double-click `index.html`.
- If you already use git, clone your own copy, then double-click the file:

```bash
git clone https://github.com/<your-username>/flappy-ai-jam.git
```

Open the folder in any editor you like, change `index.html`, save, and refresh the browser. When the game is ready, publish it with steps 5 to 7 above. If you use git, commit `index.html` and push to `main` instead of using the pencil.

## Prompt guide

Paste **Prompt A** first and wait until Gemini replies that it is ready. Then paste the whole `index.html`. After that, use B, C, or D, or write your own. Every reply should be the full file.

### Prompt A: Ground rules

```text
You are my game developer for a 30-minute game jam. I will give you a complete single-file
HTML5 Canvas game (index.html). Rules for EVERY reply:
1. Always return the FULL, complete, working index.html in one code block, from <!DOCTYPE html>
   to </html>. Never truncate. Never write "rest of code unchanged", "...", or "same as before".
2. Keep everything in ONE file: HTML, CSS and JavaScript together. No external files, images,
   libraries, CDNs, fonts or npm packages. Draw everything with Canvas shapes. Emoji are fine.
3. Keep the "// === AI PROMPT ZONE: ... ===" comments so the code stays easy to edit.
4. Keep the controls working: Space, arrow up, mouse click and touch (phones). The page must
   fit the window, remember the best score, and wait a short moment before a restart counts.
5. Check that your code has no errors before replying. Then add a 2-line summary of what changed.
Reply "Ready" and wait for my code.
```

### Prompt B: Make it look like a different game

Swap the theme for anything you like. A lecture you are late for, your cat, a game you already love. This example is Portsmouth. Gameplay stays the same.

```text
Reskin this game into "Flappy Seagull: Portsmouth Edition". The bird becomes a cheeky seagull
(drawn with Canvas shapes) that has just stolen a chip. Pipes become the Spinnaker Tower and
stacks of Southsea deckchairs. Background: a sunset over the Solent, with the Isle of Wight
as a silhouette and a ferry scrolling past. Rename the title, the start screen and the game
over text to match ("You dropped your chip!"). Keep the gameplay the same. Return the FULL index.html.
```

### Prompt C: New ways to play

```text
Add new gameplay. Keep it fair for someone playing for the first time.
- 3 lives, shown as hearts. Hitting a pipe loses a life, then the bird flashes and cannot be hit for 1.5 seconds.
- Power-ups that float through the gaps: a shield (one free hit), slow motion for 5 seconds,
  and a tiny-bird shrink for 5 seconds. Give each one its own colour and a short label.
- A combo: pass pipes without flapping too often and the score builds to x2, x3 and x4.
- Every 10 points, a large obstacle appears on the right and shoots slow projectiles for 10 seconds.
Return the FULL index.html.
```

### Prompt D: Make it feel good

```text
Make the game feel satisfying to play:
- Bursts of particles when the bird flaps, when you score, and when you crash.
- A short screen shake and a quick white flash on a crash.
- Sounds made only with the Web Audio API (no audio files): a flap, a score ding, a crash,
  and a simple tune that loops and starts on the first click or tap.
- Three background layers that scroll at different speeds.
- The bird squashes and stretches when it flaps. The start screen has a small bounce, and the score pops.
- A mute control on the M key, and a speaker mark you can tap.
Return the FULL index.html.
```

### If Gemini breaks the game

```text
The game is broken. Here is what happens: [describe it, for example "black screen" or "the bird does not move"].
Here is the error from the browser console: [paste the red text].
Fix only that bug, keep every feature, and return the FULL working index.html.
```

- To see the error, press **F12** (on a Mac, **Cmd + Option + I**) and open **Console**. Copy the red text into the prompt above.
- If the reply stops halfway, say: "You cut the file short. Send the FULL file again."
- After two failed fixes, go back to the last version that worked. Scroll up in Gemini, or open your last commit, and ask for a smaller change.
- Save every version that runs. Commit it as you go, so you always have something to hand in.

## Submission and judging

Hand the game in with steps 4 to 7 in [Never used GitHub? Do this](#never-used-github-do-this). The link looks like this:

```text
https://<your-username>.github.io/flappy-ai-jam/
```

Submit it on the form shown on the screen (QR code). Have your name, your game's name, and the prompt you are most proud of ready.

If the Pages link is not live after a minute, refresh once. If it is still down, also submit the link to `index.html` on your fork, or your Gemini Canvas share link, so we can still open the game.

| Category | What it rewards | How we judge it |
| --- | --- | --- |
| Best Engineered | Technical execution | The game runs, the new ideas work, and the build is the strongest in the room. |
| Most Unhinged Prompt | Creative prompting | The idea is bold and the prompts are specific. No coding is required, so this category is open to everyone. |
| People's Choice | The room vote | Everyone in the room votes. The game people most want to play again wins. |

## About the society

University of Portsmouth AI Society. Free to join, for every course and every level.

[GitHub](https://github.com/uopaisociety) · [Instagram](https://instagram.com/uopaisociety) · [X](https://x.com/uopaisociety) · [Luma](https://luma.com/uopaisociety) · [LinkedIn](https://linkedin.com/company/aisocietyuop) · [aisociety@upsu.net](mailto:aisociety@upsu.net)

If you post your game, tag @uopaisociety and use #FlappyAIJam.
