# Heardle WIFF 🎸🎤

A mobile-first daily audio quiz web app inspired by Heardle, powered by the **SoundCloud Widget API**.

Each day features one classic song intro broken into 6 progressive time segments (**1s → 2s → 4s → 7s → 11s → 16s**). Every wrong guess or skip unlocks the next segment of the intro.

### Genre Mix
- **70s, 80s & 90s Rock** (Nirvana, Fleetwood Mac, Guns N' Roses, Led Zeppelin, Foo Fighters, The Clash, Red Hot Chili Peppers, Creedence Clearwater Revival, Black Sabbath, and more)
- **90s Hip Hop** mixed in every few days (Dr. Dre, 2Pac, Snoop Dogg, Nas, Beastie Boys, OutKast, TLC, Eminem, JAY-Z, Missy Elliott, Salt-N-Pepa)

---

## Features
- **Mobile-First Ergonomics**: Fits cleanly inside a `100dvh` mobile viewport with upward-opening search suggestions so the mobile keyboard never obscures results.
- **SoundCloud Streaming**: Streams audio directly from verified SoundCloud URLs via the official SoundCloud HTML5 Widget API (`https://w.soundcloud.com/player/api.js`).
- **Progressive Segments**: Classic Heardle 6-stage progress bar (`1s`, `2s`, `4s`, `7s`, `11s`, `16s`) with visual segment dividers.
- **Artist Match Feedback**: Highlights guesses in amber (`Artist Match`) when you guess the right artist with a different song title.
- **Daily Persistence & Stats**: Tracks games played, win percentage, current/max streak, guess distribution, and a live countdown to midnight in `localStorage`.
- **One-Tap Score Sharing**: Copies or shares spoiler-free Heardle emoji grids (`🔊 🟥🟨🟩⬜⬜⬜`).

---

## Customizing Songs (`songs.js`)

All daily tracks and configuration live in [`songs.js`](./songs.js):

1. **`window.HEARDLE_CONFIG.epochDate`**: Sets Day #1 (`YYYY-MM-DD`). All players on the same calendar day get the exact same song index.
2. **`window.DAILY_ROTATION`**: Add, reorder, or replace tracks in the daily rotation:
   ```js
   {
     artist: "Nirvana",
     title: "Smells Like Teen Spirit",
     url: "https://soundcloud.com/nirvana/smells-like-teen-spirit-1",
     genre: "90s Rock",
     year: 1991
   }
   ```
3. **`window.EXTRA_SEARCH_CATALOG`**: Additional classic songs that populate the autocomplete search bar as decoys.

---

## Deploying to GitHub Pages (`benbipes/heardle-wiff`)

Because Heardle WIFF uses pure HTML, CSS, and vanilla JavaScript with zero build step, it deploys directly to **GitHub Pages**:

```bash
git init
git add .
git commit -m "Initial commit: Heardle WIFF daily audio quiz"
git branch -M main
git remote add origin https://github.com/benbipes/heardle-wiff.git
git push -u origin main
```

Then in your GitHub repository:
1. Go to **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the **`main`** branch and **`/ (root)`** folder, then click **Save**.
4. Your app will be live at `https://benbipes.github.io/heardle-wiff/`!
