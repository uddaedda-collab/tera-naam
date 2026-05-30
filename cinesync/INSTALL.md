# 📥 CineSync — Install kaise karein (Easy Guide)

CineSync ek web app hai jo tumhare computer pe ek chhota server chalati hai. Bas
3 step mein chalu ho jayegi. ❤️

---

## ✅ Pehle ek baar: Node.js install karo

Agar tumhare computer pe Node.js nahi hai:
1. Jao 👉 https://nodejs.org
2. **LTS version** download karke install karo (Next-Next-Finish)
3. Check karne ke liye terminal/command-prompt mein likho: `node -v`

---

## 🚀 App chalane ke 3 steps

### Step 1 — Files nikaalo
`cinesync-app.zip` ko extract (unzip) karo kisi bhi folder mein.

### Step 2 — Dependencies install karo
Us folder ke andar terminal kholo aur likho:
```bash
npm install
```
(Sirf pehli baar — thoda time lega.)

### Step 3 — App start karo
```bash
npm start
```
Bas! Terminal mein dikhega:
```
  🎬  CineSync is live!
  ➜  Local:  http://localhost:3000
```

Ab browser mein kholo 👉 **http://localhost:3000**

---

## 💕 Dono saath kaise dekhein?

`localhost` sirf tumhare apne computer pe chalta hai. Girlfriend ko door se jodne ke
liye 2 aasaan tarike:

### Tarika A — Free tunnel (sabse aasaan, abhi try karne ke liye)
App chalu rakho, phir **nayi terminal** mein likho:
```bash
npx localtunnel --port 3000
```
Ye ek public link dega (jaise `https://xyz.loca.lt`). Wahi link girlfriend ko bhejo —
wo kahin se bhi join kar sakti hai! 🌍

> (Alternative: `ngrok http 3000` — agar ngrok install hai.)

### Tarika B — Free hosting pe daalo (permanent link)
App ko **Render.com** ya **Railway.app** pe deploy karo (free tier). Ek baar deploy hone
ke baad ek permanent link milega jo hamesha chalega. Bata dena, main step-by-step
deploy karwa dunga. 🚀

---

## 🎬 Use kaise karein

1. **"Create a Cinema"** dabao → room code + invite link milega
2. Invite link copy karke girlfriend ko bhejo 💌
3. Wo link kholegi → dono ek hi room mein
4. **"Add a video"** → YouTube / Google Drive link paste karo, ya gallery se upload
5. Play dabao → **dono ke video ek saath chalenge** + saath mein chat ❤️

---

## ❓ Koi dikkat?
- Port 3000 busy ho to: `PORT=4000 npm start` (phir http://localhost:4000)
- Tests chalane ke liye: `npm test`

Enjoy your movie nights! 🍿❤️
