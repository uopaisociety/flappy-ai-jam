# 🐦 Flappy AI Jam: The 30-Minute AI Game Jam

**UoP AI Society · Thursday 19 November 2026 · 18:30–20:00**

One file. Thirty minutes. Turn this basic Flappy Bird into the best (or most unhinged) game in the room using **Gemini**. You don't need to know how to code.

▶️ **Play the original:** https://uopaisociety.github.io/flappy-ai-jam/

---

## ⚡ TL;DR

1. ⭐ **Star** and 🍴 **Fork** this repo
2. Copy `index.html` into **Gemini Canvas**
3. Paste a **Mega-Prompt** from below
4. Ship it to your fork and submit your link

---

## Step 1: ⭐ Star and 🍴 Fork (required for judging)

1. Click **⭐ Star** (top right). *No star, no entry.* It takes one click and it helps the society a lot.
2. Click **🍴 Fork**, then **Create fork**. You now have your own copy at `github.com/<your-username>/flappy-ai-jam`.

> No GitHub account? Sign up at [github.com/signup](https://github.com/signup). It takes about a minute. Use your personal email so you keep it after uni.

---

## Step 2: Open it in 30 seconds (pick one)

### 🅰️ Gemini Canvas (recommended, nothing to install)
1. Open [`index.html`](index.html) in your fork, click the **Copy raw file** button (📋 icon, top right of the code).
2. Go to [gemini.google.com](https://gemini.google.com) and click **Canvas** in the prompt bar (it may be under **Tools**).
3. Paste the **whole file** with a short note like *"Here's my game, show me a preview"*.
4. Click **Preview** to play it. Keep asking for changes in the chat.

### 🅱️ Local (also nothing to install)
1. In your fork, click **Code → Download ZIP** and unzip it.
2. **Double-click `index.html`**. It opens in your browser and you can play straight away.
3. After Gemini changes it, paste the new code into `index.html`, save, and refresh the browser.

### 🅲 VS Code / Zed (for people who like editors)
1. `git clone https://github.com/<your-username>/flappy-ai-jam.git`
2. Open the folder, edit `index.html`, and open it in your browser (or use the VS Code **Live Server** extension for auto-reload).

### 🌐 Get a live link (do this now, it takes 20 seconds)
In **your fork**, go to **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
After a minute or two, your game is live at:

```
https://<your-username>.github.io/flappy-ai-jam/
```

That's the link you'll submit. It works on phones too.

---

## Step 3: 🧠 The Mega-Prompt Starter Pack

Don't stare at a blank box. **Paste Prompt A first**, then paste the `index.html` code, then use B, C and D (or write your own chaos).

### Prompt A: Ground Rules (paste this first, every time)

```text
You are my game developer for a 30-minute game jam. I will give you a complete single-file
HTML5 Canvas game (index.html). Rules for EVERY reply:
1. Always return the FULL, complete, working index.html in one code block, from <!DOCTYPE html>
   to </html>. Never truncate. Never write "rest of code unchanged", "...", or "same as before".
2. Keep everything in ONE file: HTML, CSS and JavaScript together. No external files, images,
   libraries, CDNs, fonts or npm packages. Draw everything with code (Canvas shapes, emoji are OK).
3. Keep the "// === AI PROMPT ZONE: ... ===" comments so the code stays easy to edit.
4. Keep the controls working: Space, mouse click and touch (phones).
5. Check that your code has no errors before replying. Then add a 2-line summary of what changed.
Reply "Ready" and wait for my code.
```

### Prompt B: Make It Insane (theme reskin)

```text
Reskin this game into "Flappy Seagull: Portsmouth Edition". The bird becomes a cheeky seagull
(drawn with Canvas shapes) that has just stolen a chip. Pipes become the Spinnaker Tower and
stacks of Southsea deckchairs. Background: a sunset over the Solent with the Isle of Wight
silhouette and a ferry scrolling past. Rename the title, the start screen and the game over text
to match ("You dropped your chip!"). Keep the gameplay the same. Return the FULL index.html.
```
*Swap in your own theme: Mario Kart, a lecture you're late for, your cat in space, anything.*

### Prompt C: New Gameplay Mechanics

```text
Add new gameplay to this game:
- 3 lives shown as hearts. Hitting a pipe loses a life and gives 1.5 seconds of flashing invincibility.
- Power-ups that float through the gaps: a shield (one free hit), slow-motion (5 seconds) and
  a tiny-bird shrink (5 seconds). Each power-up has a different colour and a label.
- A combo multiplier: passing pipes without flapping too much builds x2, x3 and x4 score.
- Every 10 points, a boss appears on the right and shoots slow projectiles for 10 seconds.
Keep the difficulty fair for a beginner. Return the FULL index.html.
```

### Prompt D: Juice and Polish

```text
Make this game feel amazing to play (this is called "game juice"):
- Particle bursts when flapping, scoring and crashing.
- Screen shake and a quick white flash on crash.
- Sound effects made with the Web Audio API only (no audio files): flap, score "ding",
  crash, and a simple looping chiptune that starts on the first click/tap.
- Parallax background with 3 layers scrolling at different speeds.
- Smooth bird squash-and-stretch when flapping, a bouncy animated start screen
  and a score pop animation. Add a mute button (M key or tap the speaker icon).
Return the FULL index.html.
```

### 🚑 Rescue Prompt: if Gemini breaks it

```text
The game is broken. Here's what happens: [describe it, e.g. "black screen" or "bird doesn't move"].
Here's the error from the browser console: [paste error]. Fix ONLY the bug, keep every feature,
and return the FULL working index.html.
```

**Rescue tips**
- See the error: press **F12** (or **Cmd + Option + I** on Mac) and open **Console**. Copy the red text into the Rescue Prompt.
- Gemini cut the code short? Say *"You truncated it. Send the FULL file again."*
- Still stuck after 2 tries? **Go back to your last working version** (scroll up in Gemini or open your last commit) and try a smaller change.
- **Save every working version.** Commit it to your fork as you go (see Step 4) so you always have something to submit.

---

## Step 4: 🚀 Submit (before the timer ends!)

1. In **your fork**, click `index.html` → ✏️ **Edit** (pencil icon).
2. Select all, delete, and **paste your full new code**.
3. Click **Commit changes** (e.g. *"Seagull edition with boss fight"*).
4. Wait a minute, then open `https://<your-username>.github.io/flappy-ai-jam/` to check it's live.
5. **Submit your link** using the QR code on the screen. Include your name, your game's name and the one prompt you're proudest of.

> Pages not live yet? Submit the link to your fork's `index.html` too. We can still play it.

---

## 🤔 Why is it all in one file?

- **No `npm install`, no build step, no errors before you start.** Double-click it and it runs.
- **Gemini sees everything.** Paste the whole game in one go, so Gemini never has to guess what's in "the other file".
- **Instant preview.** Gemini Canvas can run it right in the chat, and any browser can open it, phones included.
- **Easy to share.** One file means one link on GitHub Pages.

---

## 🏆 Prizes and Judging

Three categories so **everyone has a shot**, from first-timers to 3rd-year CS:
- 🛠️ **Best Engineered:** the most impressive technical build
- 🤪 **Most Unhinged Prompt:** the wildest idea and best prompting. No coding needed!
- 📣 **People's Choice:** voted by everyone in the room

---

## 💙 UoP AI Society

Free to join, for every course and every level.

[Instagram @uopaisociety](https://instagram.com/uopaisociety) · [X @uopaisociety](https://x.com/uopaisociety) · [Luma](https://luma.com/uopaisociety) · [LinkedIn](https://linkedin.com/company/aisocietyuop) · [GitHub](https://github.com/uopaisociety)

**Posted your game?** Tag **@uopaisociety** and use **#FlappyAIJam**. ⭐ Don't forget to star the repo!
