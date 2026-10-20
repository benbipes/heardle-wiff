// ============================================================================
// HEARDLE WIFF — MAIN APPLICATION LOGIC
// ============================================================================

(function () {
  "use strict";

  const CONFIG = window.HEARDLE_CONFIG;
  const ROTATION = window.DAILY_ROTATION || [];
  const EXTRA_CATALOG = window.EXTRA_SEARCH_CATALOG || [];

  const STORAGE_KEYS = {
    DAILY_STATE: "heardle_wiff_daily_v1",
    STATS: "heardle_wiff_stats_v1",
    SEEN_HELP: "heardle_wiff_seen_help_v1"
  };

  // --- Date & Daily Index Helpers ---
  function getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getDayNumber() {
    const [ey, em, ed] = CONFIG.epochDate.split("-").map(Number);
    const epochLocal = new Date(ey, em - 1, ed, 0, 0, 0, 0);
    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const diffDays = Math.floor((todayLocal - epochLocal) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }

  function getTodaySong(dayNumber) {
    const idx = ((dayNumber - 1) % ROTATION.length + ROTATION.length) % ROTATION.length;
    return ROTATION[idx];
  }

  // Build deduplicated searchable song catalog (Daily Rotation + Extra Decoy Catalog)
  function buildSearchCatalog() {
    const map = new Map();
    const all = [...ROTATION, ...EXTRA_CATALOG];
    for (const item of all) {
      const fullLabel = `${item.artist} - ${item.title}`;
      const key = normalizeText(fullLabel);
      if (!map.has(key)) {
        map.set(key, {
          artist: item.artist,
          title: item.title,
          genre: item.genre || "",
          label: fullLabel
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  function normalizeText(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- State ---
  const dayNumber = getDayNumber();
  const todayKey = getTodayDateString();
  const currentSong = getTodaySong(dayNumber);
  const searchCatalog = buildSearchCatalog();

  let gameState = loadDailyState();
  let statsState = loadStatsState();

  // SoundCloud Player state
  let scWidget = null;
  let isWidgetReady = false;
  let isPlaying = false;
  let stopTimeoutId = null;
  let progressIntervalId = null;
  let playStartTimestamp = 0;
  let trackArtworkUrl = null;

  // Autocomplete UI state
  let filteredSuggestions = [];
  let highlightedIndex = -1;
  let selectedSongObj = null;

  // --- DOM Elements ---
  const elDaySubtitle = document.getElementById("day-subtitle");
  const elGuessSlots = document.getElementById("guess-slots");
  const elResultBanner = document.getElementById("result-banner");
  const elResultArtwork = document.getElementById("result-artwork");
  const elResultArtworkFallback = document.getElementById("result-artwork-fallback");
  const elResultOutcomeBadge = document.getElementById("result-outcome-badge");
  const elResultGenreBadge = document.getElementById("result-genre-badge");
  const elResultTitle = document.getElementById("result-song-title");
  const elResultArtist = document.getElementById("result-song-artist");
  const elResultScLink = document.getElementById("result-sc-link");
  const elInlineCountdown = document.getElementById("inline-countdown");
  const elModalCountdown = document.getElementById("modal-countdown");

  const elTimelineUnlocked = document.getElementById("timeline-unlocked");
  const elTimelineFill = document.getElementById("timeline-fill");
  const elTimeElapsed = document.getElementById("time-elapsed");
  const elTimeTotal = document.getElementById("time-total");
  const elPlayerStatus = document.getElementById("player-status-text");

  const elBtnPlay = document.getElementById("btn-play");
  const elIconLoading = document.getElementById("icon-loading");
  const elIconPlay = document.getElementById("icon-play");
  const elIconPause = document.getElementById("icon-pause");

  const elGameControls = document.getElementById("game-controls");
  const elSearchInput = document.getElementById("song-search-input");
  const elBtnClearInput = document.getElementById("btn-clear-input");
  const elAutocompleteList = document.getElementById("autocomplete-list");
  const elBtnSkip = document.getElementById("btn-skip");
  const elSkipBadge = document.getElementById("skip-increment-badge");
  const elBtnSubmit = document.getElementById("btn-submit");

  const elModalInfo = document.getElementById("modal-info");
  const elModalStats = document.getElementById("modal-stats");
  const elToast = document.getElementById("toast");

  // --- LocalStorage Persistence ---
  function loadDailyState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.dateKey === todayKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read daily state:", e);
    }
    return {
      dateKey: todayKey,
      dayNumber: dayNumber,
      guesses: [], // Each entry: { type: 'wrong'|'partial'|'skipped'|'correct', artist, title, label }
      status: "IN_PROGRESS" // 'IN_PROGRESS' | 'WON' | 'LOST'
    };
  }

  function saveDailyState() {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_STATE, JSON.stringify(gameState));
    } catch (e) {
      console.warn("Could not save daily state:", e);
    }
  }

  function loadStatsState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read stats:", e);
    }
    return {
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastCompletedDate: null,
      distribution: [0, 0, 0, 0, 0, 0, 0] // indices 0..5 = won on guess 1..6, index 6 = failed
    };
  }

  function recordGameCompletion(won, guessCount) {
    if (statsState.lastCompletedDate === todayKey) {
      return; // Already recorded today
    }
    statsState.played += 1;
    if (won) {
      statsState.wins += 1;
      statsState.currentStreak += 1;
      if (statsState.currentStreak > statsState.maxStreak) {
        statsState.maxStreak = statsState.currentStreak;
      }
      const distIdx = Math.min(Math.max(guessCount - 1, 0), 5);
      statsState.distribution[distIdx] = (statsState.distribution[distIdx] || 0) + 1;
    } else {
      statsState.currentStreak = 0;
      statsState.distribution[6] = (statsState.distribution[6] || 0) + 1;
    }
    statsState.lastCompletedDate = todayKey;
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsState));
    } catch (e) {
      console.warn("Could not save stats:", e);
    }
  }

  // --- Segment & Timeline Helpers ---
  function getCurrentUnlockedSeconds() {
    if (gameState.status !== "IN_PROGRESS") {
      return CONFIG.segments[CONFIG.segments.length - 1]; // Full 16s when game is over
    }
    const idx = Math.min(gameState.guesses.length, CONFIG.segments.length - 1);
    return CONFIG.segments[idx];
  }

  function formatSeconds(sec) {
    const whole = Math.floor(sec);
    return `0:${String(whole).padStart(2, "0")}`;
  }

  // --- UI Rendering ---
  function renderHeader() {
    elDaySubtitle.textContent = `Daily #${dayNumber} • 70s/80s/90s Rock & 90s Hip Hop`;
  }

  function renderGuessSlots() {
    elGuessSlots.innerHTML = "";
    const max = CONFIG.maxGuesses;

    for (let i = 0; i < max; i++) {
      const slot = document.createElement("div");
      slot.className = "guess-slot";
      const guess = gameState.guesses[i];
      const segSec = CONFIG.segments[i];

      if (guess) {
        slot.classList.add(guess.type);
        const icon = document.createElement("div");
        icon.className = "slot-status-icon";
        if (guess.type === "correct") icon.textContent = "✓";
        else if (guess.type === "skipped") icon.textContent = "⏭";
        else if (guess.type === "partial") icon.textContent = "~";
        else icon.textContent = "✕";

        const text = document.createElement("div");
        text.className = "slot-text";
        text.textContent = guess.type === "skipped" ? "SKIPPED" : guess.label;

        slot.appendChild(icon);
        slot.appendChild(text);

        if (guess.type === "partial") {
          const badge = document.createElement("span");
          badge.className = "slot-tag artist-match";
          badge.textContent = "Artist Match";
          slot.appendChild(badge);
        }
      } else {
        const isCurrentActive =
          gameState.status === "IN_PROGRESS" && i === gameState.guesses.length;
        if (isCurrentActive) {
          slot.classList.add("active");
        }
        const icon = document.createElement("div");
        icon.className = "slot-status-icon";
        icon.textContent = i + 1;

        const text = document.createElement("div");
        text.className = "slot-text";
        text.textContent = isCurrentActive ? "Listening..." : "";

        const hint = document.createElement("span");
        hint.className = "slot-sec-hint";
        hint.textContent = `${segSec}s`;

        slot.appendChild(icon);
        slot.appendChild(text);
        slot.appendChild(hint);
      }

      elGuessSlots.appendChild(slot);
    }
  }

  function renderTimelineAndControls() {
    const unlockedSec = getCurrentUnlockedSeconds();
    const totalMaxSec = CONFIG.segments[CONFIG.segments.length - 1];
    const unlockedPct = (unlockedSec / totalMaxSec) * 100;

    elTimelineUnlocked.style.width = `${unlockedPct}%`;
    elTimeTotal.textContent = formatSeconds(totalMaxSec);

    if (gameState.status === "IN_PROGRESS") {
      elGameControls.classList.remove("hidden");
      elResultBanner.classList.add("hidden");

      const currentIdx = gameState.guesses.length;
      if (currentIdx < CONFIG.segments.length - 1) {
        const delta = CONFIG.segments[currentIdx + 1] - CONFIG.segments[currentIdx];
        elSkipBadge.textContent = `(+${delta}s)`;
        elBtnSkip.firstChild.textContent = "SKIP ";
      } else {
        elSkipBadge.textContent = "";
        elBtnSkip.textContent = "GIVE UP";
      }

      if (isWidgetReady && !isPlaying) {
        elPlayerStatus.textContent = `Unlocked ${unlockedSec}s of ${totalMaxSec}s intro`;
      }
    } else {
      // Game finished (WON or LOST)
      elGameControls.classList.add("hidden");
      elResultBanner.classList.remove("hidden");

      const won = gameState.status === "WON";
      elResultOutcomeBadge.textContent = won
        ? `SOLVED IN ${gameState.guesses.length}/${CONFIG.maxGuesses}`
        : "UNSOLVED";
      elResultOutcomeBadge.className = `outcome-badge ${won ? "win" : "loss"}`;
      elResultGenreBadge.textContent = `${currentSong.genre}${currentSong.year ? " • " + currentSong.year : ""}`;
      elResultTitle.textContent = currentSong.title;
      elResultArtist.textContent = currentSong.artist;
      elResultScLink.href = currentSong.url;

      if (trackArtworkUrl) {
        elResultArtwork.src = trackArtworkUrl;
        elResultArtwork.classList.remove("hidden");
        elResultArtworkFallback.classList.add("hidden");
      }

      if (isWidgetReady && !isPlaying) {
        elPlayerStatus.textContent = "Tap Play to hear the full 16s intro";
      }
    }
  }

  function renderStatsModal() {
    document.getElementById("stat-played").textContent = statsState.played;
    const winPct = statsState.played > 0
      ? Math.round((statsState.wins / statsState.played) * 100)
      : 0;
    document.getElementById("stat-win-pct").textContent = `${winPct}%`;
    document.getElementById("stat-cur-streak").textContent = statsState.currentStreak;
    document.getElementById("stat-max-streak").textContent = statsState.maxStreak;

    const distContainer = document.getElementById("guess-distribution");
    distContainer.innerHTML = "";
    const maxVal = Math.max(1, ...statsState.distribution);

    const labels = ["1", "2", "3", "4", "5", "6", "✕"];
    labels.forEach((lbl, idx) => {
      const count = statsState.distribution[idx] || 0;
      const pct = Math.max(8, Math.round((count / maxVal) * 100));

      const row = document.createElement("div");
      row.className = "dist-row";

      const labelEl = document.createElement("span");
      labelEl.className = "dist-label";
      labelEl.textContent = lbl;

      const track = document.createElement("div");
      track.className = "dist-bar-track";

      const fill = document.createElement("div");
      fill.className = "dist-bar-fill";
      const isHighlighted =
        (gameState.status === "WON" && gameState.guesses.length === idx + 1) ||
        (gameState.status === "LOST" && idx === 6);
      if (isHighlighted) {
        fill.classList.add("highlight");
      }
      fill.style.width = `${pct}%`;
      fill.textContent = count;

      track.appendChild(fill);
      row.appendChild(labelEl);
      row.appendChild(track);
      distContainer.appendChild(row);
    });

    const shareSection = document.getElementById("modal-share-section");
    if (gameState.status !== "IN_PROGRESS") {
      shareSection.classList.remove("hidden");
    } else {
      shareSection.classList.add("hidden");
    }
  }

  // --- Dual-Engine Audio Integration (SoundCloud Widget + Native HTML5 Audio Fallback) ---
  // Why Dual-Engine?
  // 1. iOS Safari and mobile Chrome frequently block programmatic play() inside cross-origin
  //    SoundCloud iframes because the tap gesture occurred in the parent window.
  // 2. Some SoundCloud major-label tracks are geo-restricted (30-sec preview or blocked in certain regions),
  //    or blocked by browser privacy/ad-blocker extensions.
  // By preloading a native HTML5 <audio> backup stream alongside the SoundCloud Widget, we can:
  // - Unlock native iOS/Android audio synchronously inside the user's tap gesture
  // - Seamlessly play via SoundCloud when available, or auto-failover to native HTML5 audio within 900ms
  //   if the SoundCloud iframe is blocked or silent on a user's device.
  let hasPlayedOnce = false;
  let audioStartedTimestamp = 0;
  let nativeAudio = new Audio();
  nativeAudio.preload = "auto";
  nativeAudio.crossOrigin = "anonymous";
  let nativeAudioReady = false;
  let useNativeFallback = false;
  let scFailoverTimerId = null;

  function initSoundCloudPlayer() {
    // 1. Fetch native HTML5 audio backup stream & artwork in parallel
    preloadNativeAudioBackup();

    // 2. Initialize SoundCloud Widget iframe
    const iframe = document.getElementById("sc-widget-iframe");
    const encodedUrl = encodeURIComponent(currentSong.url);
    iframe.src = `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;

    if (window.SC && window.SC.Widget) {
      scWidget = window.SC.Widget(iframe);

      scWidget.bind(window.SC.Widget.Events.READY, () => {
        isWidgetReady = true;
        markPlayerReady();

        // Fetch artwork from SoundCloud metadata if available
        scWidget.getCurrentSound((sound) => {
          if (sound && sound.artwork_url) {
            trackArtworkUrl = sound.artwork_url.replace("-large", "-t300x300");
            updateResultArtwork();
          }
        });
      });

      // If SoundCloud starts late after we've already switched to the backup stream, silence it
      scWidget.bind(window.SC.Widget.Events.PLAY, () => {
        if (useNativeFallback || !isPlaying) {
          try {
            scWidget.pause();
          } catch (e) {}
        }
      });

      // Listen to real audio progress from SoundCloud
      scWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
        if (!isPlaying || useNativeFallback) return;
        const posMs = data && typeof data.currentPosition === "number" ? data.currentPosition : 0;
        if (posMs > 0) {
          if (scFailoverTimerId) {
            clearTimeout(scFailoverTimerId);
            scFailoverTimerId = null;
          }
          hasPlayedOnce = true;
          if (!audioStartedTimestamp) {
            audioStartedTimestamp = performance.now() - posMs;
          }
          handleAudioPositionUpdate(posMs);
        }
      });

      scWidget.bind(window.SC.Widget.Events.ERROR, () => {
        // SoundCloud blocked or track restricted -> switch to native HTML5 audio engine
        if (nativeAudioReady) {
          useNativeFallback = true;
          markPlayerReady();
          if (isPlaying) {
            startNativeAudioPlayback();
          }
        } else {
          elPlayerStatus.textContent = "Loading backup audio stream...";
        }
      });
    } else {
      // SoundCloud API script blocked by ad-blocker
      useNativeFallback = true;
    }

    // If neither engine loads, tell the user why rather than spinning forever
    setTimeout(() => {
      if (!isWidgetReady && !nativeAudioReady) {
        elPlayerStatus.textContent = "Audio couldn't load — disable content blockers or refresh";
      }
    }, 8000);
  }

  function preloadNativeAudioBackup() {
    const query = encodeURIComponent(`${currentSong.artist} ${currentSong.title}`);
    // Strip "(feat. ...)", "(Remaster)" etc. before comparing titles
    const coreTitle = (s) => normalizeText((s || "").replace(/\(.*?\)|\[.*?\]/g, ""));
    fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.results || data.results.length === 0) return;
        // Require BOTH artist and exact core title to match — never play a different song as the backup.
        // Prefer the original recording over acoustic/live/demo/remix/instrumental versions.
        const wantArtist = normalizeText(currentSong.artist);
        const wantTitle = coreTitle(currentSong.title);
        const altVersion = /\b(acoustic|live|demo|remix|instrumental|karaoke|unplugged|re-?recorded|cover)\b/i;
        const candidates = data.results.filter((r) => {
          const ra = normalizeText(r.artistName);
          const artistOk = ra.includes(wantArtist) || wantArtist.includes(ra);
          return r.previewUrl && artistOk && coreTitle(r.trackName) === wantTitle;
        });
        const match =
          candidates.find((r) => !altVersion.test(r.trackName) && !altVersion.test(r.collectionName || "")) ||
          candidates.find((r) => !altVersion.test(r.trackName)) ||
          candidates[0];

        if (match && match.previewUrl) {
          nativeAudio.src = match.previewUrl;
          nativeAudio.load();
          nativeAudioReady = true;

          if (!trackArtworkUrl && match.artworkUrl100) {
            trackArtworkUrl = match.artworkUrl100.replace("100x100bb", "300x300bb");
            updateResultArtwork();
          }

          // Prefer native audio automatically on iOS/iPadOS where cross-origin iframe play() is blocked
          const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
          if (isIOS) {
            useNativeFallback = true;
          }

          markPlayerReady();
        }
      })
      .catch((err) => {
        console.warn("Backup stream lookup failed:", err);
      });
  }

  function markPlayerReady() {
    if (isWidgetReady || nativeAudioReady) {
      elBtnPlay.disabled = false;
      if (!isPlaying) {
        updatePlayButtonIcon("play");
      }
      renderTimelineAndControls();
    }
  }

  function updateResultArtwork() {
    if (trackArtworkUrl && gameState.status !== "IN_PROGRESS") {
      elResultArtwork.src = trackArtworkUrl;
      elResultArtwork.classList.remove("hidden");
      elResultArtworkFallback.classList.add("hidden");
    }
  }

  function handleAudioPositionUpdate(posMs) {
    if (!isPlaying) return;
    const durationSec = getCurrentUnlockedSeconds();
    const durationMs = durationSec * 1000;
    const totalMaxSec = CONFIG.segments[CONFIG.segments.length - 1];

    const clampedSec = Math.min(posMs / 1000, durationSec);
    const fillPct = (clampedSec / totalMaxSec) * 100;
    elTimelineFill.style.width = `${fillPct}%`;
    elTimeElapsed.textContent = formatSeconds(clampedSec);
    elPlayerStatus.textContent = `Playing ${durationSec}s snippet...`;

    if (posMs >= durationMs) {
      stopSnippetPlayback(true);
    }
  }

  function updatePlayButtonIcon(state) {
    elIconLoading.classList.add("hidden");
    elIconPlay.classList.add("hidden");
    elIconPause.classList.add("hidden");

    if (state === "loading") elIconLoading.classList.remove("hidden");
    else if (state === "pause") elIconPause.classList.remove("hidden");
    else elIconPlay.classList.remove("hidden");
  }

  function togglePlayback() {
    if (!isWidgetReady && !nativeAudioReady) return;

    if (isPlaying) {
      stopSnippetPlayback();
    } else {
      startSnippetPlayback();
    }
  }

  function startSnippetPlayback() {
    clearPlaybackTimers();
    const durationSec = getCurrentUnlockedSeconds();
    const durationMs = durationSec * 1000;

    isPlaying = true;
    audioStartedTimestamp = 0;
    elTimelineFill.style.width = "0%";
    elTimeElapsed.textContent = "0:00";
    updatePlayButtonIcon("pause");
    elPlayerStatus.textContent = hasPlayedOnce
      ? `Playing ${durationSec}s snippet...`
      : `Starting ${durationSec}s snippet...`;

    // If using native HTML5 audio (iOS or fallback activated), play directly in user gesture
    if (useNativeFallback && nativeAudioReady) {
      startNativeAudioPlayback();
      return;
    }

    // Unlock nativeAudio on user tap gesture (muted briefly) in case SoundCloud fails 900ms later
    if (nativeAudioReady && !hasPlayedOnce) {
      nativeAudio.muted = true;
      nativeAudio.play().then(() => {
        if (!useNativeFallback) {
          nativeAudio.pause();
          nativeAudio.currentTime = 0;
        }
        nativeAudio.muted = false;
      }).catch(() => {
        nativeAudio.muted = false;
      });
    }

    if (scWidget && isWidgetReady) {
      if (hasPlayedOnce) {
        scWidget.seekTo(0);
      }
      scWidget.play();

      // If SoundCloud hasn't produced >0ms audio within 950ms (e.g., mobile autoplay block or geo-restriction),
      // seamlessly switch to native HTML5 audio so the user hears music immediately.
      if (nativeAudioReady) {
        scFailoverTimerId = setTimeout(() => {
          if (isPlaying && !audioStartedTimestamp) {
            useNativeFallback = true;
            try {
              scWidget.pause();
            } catch (e) {}
            startNativeAudioPlayback();
          }
        }, 950);
      }

      progressIntervalId = setInterval(() => {
        if (!isPlaying || useNativeFallback) return;

        scWidget.getPosition((posMs) => {
          if (!isPlaying || useNativeFallback) return;
          if (typeof posMs === "number" && posMs > 0) {
            if (scFailoverTimerId) {
              clearTimeout(scFailoverTimerId);
              scFailoverTimerId = null;
            }
            hasPlayedOnce = true;
            if (!audioStartedTimestamp) {
              audioStartedTimestamp = performance.now() - posMs;
            }
            handleAudioPositionUpdate(posMs);
          } else if (audioStartedTimestamp > 0) {
            const elapsedMs = performance.now() - audioStartedTimestamp;
            handleAudioPositionUpdate(elapsedMs);
          }
        });
      }, 40);
    } else if (nativeAudioReady) {
      useNativeFallback = true;
      startNativeAudioPlayback();
      return;
    }

    // Safety fallback timeout
    stopTimeoutId = setTimeout(() => {
      if (isPlaying) {
        stopSnippetPlayback(true);
      }
    }, durationMs + 4500);
  }

  function startNativeAudioPlayback() {
    clearPlaybackTimers();
    const durationSec = getCurrentUnlockedSeconds();
    const durationMs = durationSec * 1000;

    nativeAudio.muted = false;
    nativeAudio.currentTime = 0;
    const playPromise = nativeAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err) => {
        console.warn("Native audio play error:", err);
        elPlayerStatus.textContent = "Tap Play again to start audio";
        stopSnippetPlayback(false);
      });
    }

    progressIntervalId = setInterval(() => {
      if (!isPlaying) return;
      const posMs = nativeAudio.currentTime * 1000;
      if (posMs > 0) {
        hasPlayedOnce = true;
        handleAudioPositionUpdate(posMs);
      }
    }, 35);

    stopTimeoutId = setTimeout(() => {
      if (isPlaying) {
        stopSnippetPlayback(true);
      }
    }, durationMs + 2500);
  }

  function stopSnippetPlayback(completedNaturally = false) {
    clearPlaybackTimers();
    isPlaying = false;
    audioStartedTimestamp = 0;

    if (scWidget && isWidgetReady) {
      try {
        scWidget.pause();
        scWidget.seekTo(0);
      } catch (e) {}
    }

    if (nativeAudioReady) {
      try {
        nativeAudio.pause();
        nativeAudio.currentTime = 0;
      } catch (e) {}
    }

    updatePlayButtonIcon("play");

    if (!completedNaturally) {
      elTimelineFill.style.width = "0%";
      elTimeElapsed.textContent = "0:00";
    } else {
      const durationSec = getCurrentUnlockedSeconds();
      const totalMaxSec = CONFIG.segments[CONFIG.segments.length - 1];
      elTimelineFill.style.width = `${(durationSec / totalMaxSec) * 100}%`;
      elTimeElapsed.textContent = formatSeconds(durationSec);
      setTimeout(() => {
        if (!isPlaying) {
          elTimelineFill.style.width = "0%";
          elTimeElapsed.textContent = "0:00";
        }
      }, 450);
    }
    renderTimelineAndControls();
  }

  function clearPlaybackTimers() {
    if (scFailoverTimerId) {
      clearTimeout(scFailoverTimerId);
      scFailoverTimerId = null;
    }
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      progressIntervalId = null;
    }
  }

  // --- Gameplay Actions (Submit & Skip) ---
  function handleSkip() {
    if (gameState.status !== "IN_PROGRESS") return;
    stopSnippetPlayback();

    gameState.guesses.push({
      type: "skipped",
      artist: "",
      title: "",
      label: "SKIPPED"
    });

    if (gameState.guesses.length >= CONFIG.maxGuesses) {
      gameState.status = "LOST";
      recordGameCompletion(false, gameState.guesses.length);
    }

    clearSearchInput();
    saveDailyState();
    renderGuessSlots();
    renderTimelineAndControls();
  }

  function handleSubmitGuess() {
    if (gameState.status !== "IN_PROGRESS") return;

    const rawText = elSearchInput.value.trim();
    if (!rawText) return;

    stopSnippetPlayback();

    // Match against selected autocomplete object or parse input text
    let guessedArtist = "";
    let guessedTitle = "";
    let guessedLabel = rawText;

    if (selectedSongObj && normalizeText(selectedSongObj.label) === normalizeText(rawText)) {
      guessedArtist = selectedSongObj.artist;
      guessedTitle = selectedSongObj.title;
      guessedLabel = selectedSongObj.label;
    } else {
      // Check if input matches any catalog item
      const found = searchCatalog.find(
        (item) => normalizeText(item.label) === normalizeText(rawText)
      );
      if (found) {
        guessedArtist = found.artist;
        guessedTitle = found.title;
        guessedLabel = found.label;
      } else if (rawText.includes("-")) {
        const parts = rawText.split("-");
        guessedArtist = parts[0].trim();
        guessedTitle = parts.slice(1).join("-").trim();
      } else {
        guessedTitle = rawText;
      }
    }

    const isArtistCorrect =
      normalizeText(guessedArtist) === normalizeText(currentSong.artist) ||
      normalizeText(rawText).includes(normalizeText(currentSong.artist));

    const isTitleCorrect =
      normalizeText(guessedTitle) === normalizeText(currentSong.title) ||
      (normalizeText(rawText).includes(normalizeText(currentSong.title)) &&
        normalizeText(rawText).includes(normalizeText(currentSong.artist)));

    let guessType = "wrong";
    if (isArtistCorrect && isTitleCorrect) {
      guessType = "correct";
    } else if (isArtistCorrect) {
      guessType = "partial";
    }

    gameState.guesses.push({
      type: guessType,
      artist: guessedArtist,
      title: guessedTitle,
      label: guessedLabel
    });

    if (guessType === "correct") {
      gameState.status = "WON";
      recordGameCompletion(true, gameState.guesses.length);
    } else if (gameState.guesses.length >= CONFIG.maxGuesses) {
      gameState.status = "LOST";
      recordGameCompletion(false, gameState.guesses.length);
    }

    clearSearchInput();
    saveDailyState();
    renderGuessSlots();
    renderTimelineAndControls();
  }

  // --- Autocomplete Search ---
  function handleSearchInput() {
    const query = elSearchInput.value.trim();
    selectedSongObj = null;

    if (query.length > 0) {
      elBtnClearInput.classList.remove("hidden");
      elBtnSubmit.disabled = false;
    } else {
      elBtnClearInput.classList.add("hidden");
      elBtnSubmit.disabled = true;
      closeAutocomplete();
      return;
    }

    const normQuery = normalizeText(query);
    const terms = normQuery.split(" ").filter(Boolean);

    filteredSuggestions = searchCatalog
      .filter((item) => {
        const normLabel = normalizeText(item.label);
        return terms.every((t) => normLabel.includes(t));
      })
      .slice(0, 8);

    highlightedIndex = -1;
    renderAutocomplete();
  }

  function renderAutocomplete() {
    if (filteredSuggestions.length === 0) {
      closeAutocomplete();
      return;
    }

    elAutocompleteList.innerHTML = "";
    filteredSuggestions.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "autocomplete-item";
      if (idx === highlightedIndex) {
        li.classList.add("highlighted");
      }
      li.setAttribute("role", "option");

      const mainSpan = document.createElement("span");
      mainSpan.className = "ac-song-main";
      const artistSpan = document.createElement("span");
      artistSpan.className = "ac-song-artist";
      artistSpan.textContent = `${item.artist} — `;
      mainSpan.appendChild(artistSpan);
      mainSpan.appendChild(document.createTextNode(item.title));

      li.appendChild(mainSpan);

      if (item.genre) {
        const pill = document.createElement("span");
        pill.className = "ac-genre-pill";
        pill.textContent = item.genre;
        li.appendChild(pill);
      }

      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectAutocompleteItem(item);
      });
      li.addEventListener("touchstart", () => {
        // Allow smooth tap selection on mobile
      }, { passive: true });
      li.addEventListener("click", () => {
        selectAutocompleteItem(item);
      });

      elAutocompleteList.appendChild(li);
    });

    elAutocompleteList.classList.remove("hidden");
  }

  function selectAutocompleteItem(item) {
    selectedSongObj = item;
    elSearchInput.value = item.label;
    elBtnClearInput.classList.remove("hidden");
    elBtnSubmit.disabled = false;
    closeAutocomplete();
  }

  function closeAutocomplete() {
    elAutocompleteList.classList.add("hidden");
    elAutocompleteList.innerHTML = "";
    highlightedIndex = -1;
  }

  function clearSearchInput() {
    elSearchInput.value = "";
    selectedSongObj = null;
    elBtnClearInput.classList.add("hidden");
    elBtnSubmit.disabled = true;
    closeAutocomplete();
  }

  // --- Share Score Emoji Grid ---
  function shareScore() {
    const emojiRow = [];
    for (let i = 0; i < CONFIG.maxGuesses; i++) {
      const g = gameState.guesses[i];
      if (!g) {
        emojiRow.push("⬜");
      } else if (g.type === "correct") {
        emojiRow.push("🟩");
      } else if (g.type === "partial") {
        emojiRow.push("🟨");
      } else if (g.type === "skipped") {
        emojiRow.push("⬛");
      } else {
        emojiRow.push("🟥");
      }
    }

    const speakerIcon = gameState.status === "WON" ? "🔊" : "🔇";
    const scoreFraction =
      gameState.status === "WON"
        ? `${gameState.guesses.length}/${CONFIG.maxGuesses}`
        : `X/${CONFIG.maxGuesses}`;

    const shareText = [
      `#HeardleWIFF #${dayNumber} (${scoreFraction})`,
      `${speakerIcon} ${emojiRow.join("")}`,
      window.location.href
    ].join("\n");

    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      navigator.share({ text: shareText }).catch(() => {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast("Copied results to clipboard!"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied results to clipboard!");
    }
  }

  function showToast(msg) {
    elToast.textContent = msg;
    elToast.classList.remove("hidden");
    setTimeout(() => {
      elToast.classList.add("hidden");
    }, 2400);
  }

  // --- Next Daily Countdown Timer ---
  function startMidnightCountdown() {
    function updateClock() {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
      );
      const diffMs = Math.max(0, tomorrow - now);
      const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, "0");
      const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, "0");
      const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, "0");
      const formatted = `${hrs}:${mins}:${secs}`;

      if (elInlineCountdown) elInlineCountdown.textContent = formatted;
      if (elModalCountdown) elModalCountdown.textContent = formatted;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // --- Event Listeners ---
  function bindEvents() {
    elBtnPlay.addEventListener("click", togglePlayback);
    elBtnSkip.addEventListener("click", handleSkip);
    elBtnSubmit.addEventListener("click", handleSubmitGuess);
    elBtnClearInput.addEventListener("click", () => {
      clearSearchInput();
      elSearchInput.focus();
    });

    elSearchInput.addEventListener("input", handleSearchInput);

    elSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        if (filteredSuggestions.length > 0) {
          e.preventDefault();
          highlightedIndex = (highlightedIndex + 1) % filteredSuggestions.length;
          renderAutocomplete();
        }
      } else if (e.key === "ArrowUp") {
        if (filteredSuggestions.length > 0) {
          e.preventDefault();
          highlightedIndex =
            (highlightedIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length;
          renderAutocomplete();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          selectAutocompleteItem(filteredSuggestions[highlightedIndex]);
        } else if (!elBtnSubmit.disabled) {
          handleSubmitGuess();
        }
      } else if (e.key === "Escape") {
        closeAutocomplete();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box-container")) {
        closeAutocomplete();
      }
    });

    // Modals
    document.getElementById("btn-info").addEventListener("click", () => {
      elModalInfo.classList.remove("hidden");
    });

    document.getElementById("btn-stats").addEventListener("click", () => {
      renderStatsModal();
      elModalStats.classList.remove("hidden");
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-close-modal");
        document.getElementById(targetId).classList.add("hidden");
      });
    });

    [elModalInfo, elModalStats].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
        }
      });
    });

    document.getElementById("btn-share-inline").addEventListener("click", shareScore);
    document.getElementById("btn-share-modal").addEventListener("click", shareScore);
  }

  // --- Initialize App ---
  function init() {
    renderHeader();
    renderGuessSlots();
    renderTimelineAndControls();
    bindEvents();
    initSoundCloudPlayer();
    startMidnightCountdown();

    // Show How To Play modal on very first visit
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SEEN_HELP)) {
        elModalInfo.classList.remove("hidden");
        localStorage.setItem(STORAGE_KEYS.SEEN_HELP, "1");
      }
    } catch (e) {
      // Ignore storage error
    }
  }

  init();
})();
