# 📥 CineSync — Install kaise karein (Easy Guide)

CineSync ab ek **phone app** ki tarah install hoti hai! 🎉 Tumhare phone ki home screen
pe apna icon banega (🎬), aur full-screen khulegi — bilkul Rave / normal app jaisi.
(Technically ise **PWA** kehte hain — Play Store / App Store ke jhanjhat ke bina.)

---

## 📲 PHONE PE INSTALL (sabse pehle yeh padho!)

> ⚠️ Pehle app ka ek **online link** hona chahiye (jaise `https://cinesync-xxxx.onrender.com`).
> Agar abhi link nahi hai, to neeche **"App ko online laana"** section dekho — 5 minute ka kaam hai.
> Link mil jaaye, to dono (tum + girlfriend) apne-apne phone pe aise install karo:

### 🤖 Android phone (Chrome)
1. Chrome mein app ka link kholo
2. Upar **"📲 Install app"** button dikhega → usse dabao
   *(ya Chrome ke ⋮ menu mein "Install app" / "Add to Home screen")*
3. **"Install"** dabao — bas! Home screen pe CineSync icon aa jayega 🎬

### 🍏 iPhone (Safari)
1. Safari mein app ka link kholo *(Chrome nahi — iPhone pe Safari hi)*
2. Neeche **Share** button dabao (⬆️ wala box)
3. Scroll karke **"Add to Home Screen"** chuno
4. Upar **"Add"** dabao — ho gaya! Home screen pe app aa jayegi ❤️

> App ke andar bhi **"📲 Install app"** button hai jo tumhe yeh steps yaad dila dega.

Install hone ke baad bas icon dabao → app khulegi → **"Create a Cinema"** → link girlfriend
ko bhejo → saath movie dekho! 🍿

---

## 🌍 App ko online laana (taaki phone pe install ho sake)

Phone app banने ke liye app ka internet pe hona zaroori hai. Sabse aasaan free tarika:

### Render.com (free, ~5 min)
1. Jao 👉 https://render.com → **GitHub se Sign up** karo
2. GitHub pe is repo ka PR merge karo (ya `add-cinesync-app` branch use karo)
3. Render pe **New + → Blueprint** → apna repo `tera-naam` choose karo
4. Render khud sab set kar dega (repo mein `render.yaml` ready hai) → **Apply** dabao
5. 2-3 min baad ek link milega → wahi link phone pe khol ke upar wale steps se install karo!

> Fatafat test karne ke liye (bina hosting): laptop pe `npm start` chalao, phir
> `npx localtunnel --port 3000` se temporary public link banao.

---

## 💻 (Alternative) Computer/laptop pe chalana

Agar tum app ko apne laptop pe chalana chahte ho (developer mode):

### ✅ Pehle ek baar: Node.js install karo

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
