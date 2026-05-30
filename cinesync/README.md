# 🎬 CineSync — Watch Together, Apart ❤️

Ek **premium synchronized watch-party app** long-distance couples ke liye. Ek room banao,
link share karo, aur dono ek saath — perfectly synced — movie dekho. Saath mein live chat
aur floating animated emoji reactions. (Concept: Rave / Teleparty / CozyTwo jaisa.)

> "Watch movies together, even when you're apart."

---

## ✨ Features

| Feature | Details |
|--------|---------|
| 🔗 **One-link rooms** | Room banao, partner ko link bhejo, wo open karte hi saath aa jayega |
| ⚡ **Perfect sync** | Play / pause / seek / speed — sab real-time sync, drift auto-correction ke saath |
| 🎞️ **Multi-source** | YouTube, Google Drive, direct video URL (MP4/WebM/HLS), aur local file **upload** |
| 🔍 **Zoom & Pan player** | Scroll/pinch se zoom (up to 4x), drag se pan, double-click 2x, HD playback |
| 💬 **Live chat** | Real-time messages, typing indicator, emoji-only big bubbles |
| ❤️ **Animated reactions** | Floating emoji jo video ke upar udte hain, quick-reaction bar + full emoji picker |
| 🎛️ **Full controls** | Custom seekbar, volume, mute, 0.5x–2x speed, fullscreen, keyboard shortcuts |
| 📱 **Responsive** | Mobile + desktop, premium aurora UI, glassmorphism |
| 👑 **Smart host** | Pehla member host banta hai; host nikle to auto-promote |

---

## 🚀 Kaise chalayein (How to run)

```bash
npm install      # dependencies (already installed)
npm start        # server start karega port 3000 pe
```

Phir browser mein kholo: **http://localhost:3000**

1. **"Create a Cinema"** dabao → ek room code milega + invite link
2. Link apni partner ko bhejo 💌
3. Wo link kholegi → dono ek saath room mein
4. **"Add a video"** → YouTube/Drive link paste karo ya gallery se upload karo
5. Play dabao → dono ke video ek saath chalenge, saath mein chat karo ❤️

### Keyboard shortcuts
- `Space` — play/pause
- `←` / `→` — 5s back/forward
- `+` / `-` — zoom in/out
- `0` — zoom reset
- `f` — fullscreen

---

## 🧪 Testing

```bash
npm test
```

**48 tests, sab pass ✅** (4 suites):
- `sources.test.js` — link parsing (YouTube/Drive/direct)
- `roomManager.test.js` — rooms, membership, drift-aware playback projection
- `socket.test.js` — real-time sync flow (2 clients), chat, late-joiner resync
- `api.test.js` — REST endpoints

---

## 🏗️ Architecture

```
src/
  server.js       → entry point (port listen)
  app.js          → Express app factory + REST API + Socket.IO wiring
  socket.js       → realtime event handlers (sync ka dil)
  roomManager.js  → in-memory room/playback state (pure, testable)
  sources.js      → URL parsing (YouTube/Drive/direct) → media descriptor

public/
  index.html      → landing + room SPA shell
  css/styles.css  → premium aurora UI
  js/
    player.js     → unified player (HTML5 + YouTube + Drive) + zoom/pan/fullscreen
    chat.js       → chat UI + animated emoji reactions + picker
    app.js        → orchestrator + sync engine (drift correction)

tests/            → Jest test suites
uploads/          → uploaded videos land here (room-scoped)
```

### Sync model
Server **authoritative** hai: room ka playback state (`currentTime`, `isPlaying`, `rate`,
`source`) maintain karta hai. Har action broadcast hoti hai. Clients drift `> 1.5s` ho to
hard-seek karte hain; chhota drift (`0.4s–1.5s`) ho to playback rate ko halka adjust karke
smoothly catch up karte hain. Late joiner `sync:request` bhej ke current position pe jump
karta hai.

---

## 📝 Notes
- Google Drive: agar direct stream fail ho (quota/large file), to automatically Drive ke
  `/preview` iframe pe fallback hota hai (us case mein fine playback control limited hota hai —
  yeh Google ki side ki limitation hai).
- Upload limit: 2GB per file (configurable `app.js` mein).
- State in-memory hai (room band hote hi clear) — perfect for private movie nights.

Made with ❤️ for long-distance love.
