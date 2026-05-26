// ============================================
// TERA NAAM KYA BOLTA HAI - AI ANALYZER ENGINE
// ============================================
// Gender-specific funny archetypes
// Cheeky, share-worthy, slightly spicy humor
// ============================================

// =================== BOY ARCHETYPES ===================
const BOY_ARCHETYPES = {
  sigma: {
    title: "Sigma Boy 🐺",
    emoji: "😎",
    color: "from-gray-700 to-gray-900",
    traits: [
      "Tu '0.005% understood' wala lone wolf banta hai but actually mom ke saamne dabbu hai 🥲",
      "Insta pe quotes post karta hai 'I am built different' — zindagi mein same as everyone",
      "Tera Spotify pe 'Believer' aur 'Centuries' top played hain 🎧",
      "Tu wo banda hai jo gym 1 din jata hai aur 6 mahine 'gym life' bio mein lagata hai 💪",
    ],
    superpower: "Status pe deep quotes lagana 🥶",
    weakness: "Crush ke saamne text typing 30 min lagti hai ⌨️",
    dating: "Tu DMs mein 'hii' bhejta hai aur fir 'busy ho?' — game zero hai 💀",
    redFlag: "Tu replies pe 8 ghante leta hai but online status 24/7 hai 🚩",
    futureGf: "Wo ladki jo teri quiet vibe ko interesting samjhe (rare hai bhai)",
    bollywoodMatch: "Imran Hashmi (without the kissing scenes)",
  },
  toxic: {
    title: "Toxic Ex Material 💀",
    emoji: "🚩",
    color: "from-red-600 to-rose-700",
    traits: [
      "Tu 6 mahine wali ladki ko 'meri zindagi' bolta hai, 1 mahine baad block kar deta hai 💔",
      "Tera 'Reels with bro' wala phase abhi tak khatam nahi hua 🍻",
      "Tu cricket dekhte time girlfriend ko ignore karta hai aur fir 'you don't understand' bolta hai",
      "Tera last reply 'ok' ya 'hmm' me end hota hai 🙄",
    ],
    superpower: "Apologizing without actually apologizing — pro level 🎭",
    weakness: "Aaj bhi pehli ex ke gaano se trigger hota hai 😞",
    dating: "Tujhe wo ladki chahiye jo tera nakhra sambhale, nakhra de toh tu ghost ho jata hai",
    redFlag: "Tera phone gallery 'gym selfies' aur 'whatsapp status saved' se bhara hai 📸",
    futureGf: "Wo jo teri toxicity ko 'passion' samjhe (abhi tak nahi mili)",
    bollywoodMatch: "Kabir Singh (lekin sirf vibes, action nahi 🙏)",
  },
  mamasBoy: {
    title: "Mama's Boy 👨‍👦",
    emoji: "🤱",
    color: "from-yellow-400 to-amber-500",
    traits: [
      "Tu apni gf ko bhi 'mom ne kya banaya hai' batata hai 🍛",
      "Mom ki permission ke bina movie nahi book karta",
      "Tera lunch box still tera most premium accessory hai 📦",
      "Tu ladki ka dosti karne se pehle 'mom approve karegi?' sochta hai",
    ],
    superpower: "Ghar ka khana sab kuch beat karta hai (true man) 💪",
    weakness: "Independent decisions panic attack laate hain 😅",
    dating: "Tu ladki ko shaadi se pehle ghar dikhata hai, ghar walon ke saamne perform karta hai",
    redFlag: "Tu ladki ka choice mom se pucht hai 🚩",
    futureGf: "Mom-approved family-friend ki beti (arranged route bhai)",
    bollywoodMatch: "Bhuvan from Lagaan (innocent vibes)",
  },
  gymBro: {
    title: "Gym Bro 💪",
    emoji: "🏋️",
    color: "from-green-600 to-emerald-700",
    traits: [
      "Tera har Insta post 'leg day' ya 'shoulder day' tag karta hai 🏋️",
      "Tu protein shake ko ghar ka pani bolta hai 🥤",
      "Mirror selfies tera primary form of communication hai 📸",
      "Tu pizza khate time bhi 'cheat day' justify karta hai 🍕",
    ],
    superpower: "T-shirt utar ke confidence boost karna 💁",
    weakness: "Cardio ki bait pe gym chod deta hai 😩",
    dating: "Tu ladki ko gym le jata hai pehli date pe (red flag bhai)",
    redFlag: "Tera bio 'fitness enthusiast' likha hai but fast food gallery bhi 🍔",
    futureGf: "Wo ladki jo teri muscle ki tareef kare (without rolling eyes)",
    bollywoodMatch: "Hrithik in War (without the talent)",
  },
  swipeKing: {
    title: "Tinder Swipe King 👑",
    emoji: "📱",
    color: "from-pink-500 to-purple-600",
    traits: [
      "Tu Bumble pe '6'1\"' likhta hai, real life mein 5'7\" 📏",
      "Tera bio 'looking for something serious' but DMs full of '?' messages",
      "Sab dating apps pe simultaneous active hai — ek bhi match nahi 😭",
      "Tu 'good morning' bhejta hai 5 ladkiyon ko ek saath 🌅",
    ],
    superpower: "Pickup lines compose karne ka master 🎯",
    weakness: "Real-life pe pehli baat 'kya kar rahi ho?' tak hi rukta hai 😬",
    dating: "Tu match milne pe khush, message karne pe scared, milne pe ghost",
    redFlag: "Tera Hinge profile 'I'm here for fun' hai but tu shaadi dhundh raha hai 🚩",
    futureGf: "Wo ladki jo tere sab dating app delete karwa de (saviour mode)",
    bollywoodMatch: "Ranveer in Befikre (without confidence)",
  },
  introvert: {
    title: "Silent Genius 🤓",
    emoji: "🧠",
    color: "from-indigo-600 to-blue-700",
    traits: [
      "Tu group chats mein 'lol' ke beyond kabhi reply nahi karta 💬",
      "Phone uthana tera worst nightmare hai — text karo bhai!",
      "Tera weekend plan = bistar, books, aur 'ghar rehna' 📚",
      "Tu shaadi mein jaata hai sirf khaane ke liye, baki sab observe karta hai 👀",
    ],
    superpower: "Bina bole sab samajh leta — sherlock vibes 🕵️",
    weakness: "Crush ke saamne brain shut down ho jata hai 🥶",
    dating: "Tu Insta pe 6 mahine se stalk kar raha hai, abhi tak DM nahi kiya 🐌",
    redFlag: "Tera 'reading book' status sirf gf ke aane pe lagta hai 📖",
    futureGf: "Wo ladki jo tera silence comfortable banaye (rare gem)",
    bollywoodMatch: "Sid from Wake Up Sid (post-awakening)",
  },
  bro: {
    title: "Pure Bro Energy 🍺",
    emoji: "🤜",
    color: "from-orange-500 to-red-500",
    traits: [
      "Tera 'bhai' word per minute count 47 hai 🗣️",
      "Friday night = 'bhai chal kahin chalte hain' aur kahin nahi jaate 😂",
      "Tera car/bike pe sabse zyada conversation karta hai bhaiyon ke saath 🚗",
      "Cricket match dekhte time tera muh chalti zubaan ek hi jagah ruk jata hai 🏏",
    ],
    superpower: "Bro code over girl code hamesha 🤝",
    weakness: "Apni girlfriend ke birthday pe bhaiyon ke saath out 🎂",
    dating: "Tu ladki ko 'bro vibes' deta hai unintentionally — friendzone champion",
    redFlag: "Tu ladki ke pet dog ka naam yaad hai but birthday nahi 🐕",
    futureGf: "Wo ladki jo bhai ki frequency match kare (myth hai bhai)",
    bollywoodMatch: "Hrithik in ZNMD (pure bro vibes)",
  },
  filmy: {
    title: "Filmy Romeo 🌹",
    emoji: "💕",
    color: "from-rose-500 to-pink-600",
    traits: [
      "Tu DDLJ 47 baar dekha hai, har baar 'mehendi laga ke rakhna' pe rota hai 😭",
      "Tera Insta bio Rumi ka quote hai (samjha bhi nahi tu) 🌹",
      "Pehli date pe roses + chocolate + monologue ready hota hai 🎤",
      "Tu Arijit Singh ke gaano se relate karta hai jo tujhe hua bhi nahi 🎵",
    ],
    superpower: "Heartbreak ke baad 6 mahine deep status lagana 😞",
    weakness: "Real life ladki movie waali nahi hoti — disappointment recurring 💔",
    dating: "Tu rishton mein over-romantic, gf ko suffocate kar deta hai",
    redFlag: "Tu sirf 1 hafte mein 'I love you' bol deta hai 🥴",
    futureGf: "Wo ladki jo teri filmy nautanki tolerate kare (jokingly)",
    bollywoodMatch: "Raj from DDLJ (lekin Simran nahi mil rahi)",
  },
  chill: {
    title: "Bro on Cruise 🌴",
    emoji: "😌",
    color: "from-teal-500 to-cyan-600",
    traits: [
      "Tu sab cheez 'no chill bro' bolke handle karta hai 🌊",
      "Tera weekend = Goa plan, kabhi execute nahi hota",
      "Stress level: 0. Ambition level: 0. Vibes level: 9000.",
      "Tera life motto: 'jo hoga dekha jayega' 🤷",
    ],
    superpower: "Tension lene ki technology install nahi hai tujhme 😎",
    weakness: "Deadlines pe panic attack but display 'chill' karta hai 😬",
    dating: "Tu ladki ko relaxing vibe deta hai, but commitment se panicb",
    redFlag: "Tera life plan: 'kuch nahi, dekhte hain' 🚩",
    futureGf: "Wo ladki jo teri carefree vibe enjoy kare (motherly type)",
    bollywoodMatch: "Bunny from YJHD (without the career)",
  },
  intellect: {
    title: "Twitter Intellectual 🧠",
    emoji: "🤔",
    color: "from-violet-600 to-purple-700",
    traits: [
      "Tu Twitter pe roz political opinion deta hai, real life mein vote bhi nahi karta 🗳️",
      "Tera bio mein 5 books listed hai jo tune sirf summary padhi hai 📚",
      "Tu group chats mein 'um actually...' bolta hai bahut 🤓",
      "Tu coffee shops mein laptop kholke 'work' karta hai — Insta scroll karta hai actually ☕",
    ],
    superpower: "Random topic pe 30 min bolne ka skill 🎤",
    weakness: "Apni opinions actually defend nahi kar pata 😅",
    dating: "Tu ladki ko 'deep' baatein karta hai pehli date pe — overwhelm karta hai",
    redFlag: "Tu mansplain karta hai and self-aware nahi hai 🚩",
    futureGf: "Wo ladki jo tere intellectual nautanki entertain kare 😌",
    bollywoodMatch: "Imran Khan in Wake Up Sid (intellectual era)",
  },
}

// =================== GIRL ARCHETYPES ===================
const GIRL_ARCHETYPES = {
  instaQueen: {
    title: "Insta Queen 👑",
    emoji: "📸",
    color: "from-pink-400 to-fuchsia-500",
    traits: [
      "Tu coffee 5 baar order karwati hai sirf 'aesthetic shot' ke liye ☕",
      "Tera har post pe 47 hashtags, Indian mom 'kya hai ye?' bolti hai 📱",
      "Tu 'no makeup' selfie pe 2 ghante lagati hai 💄",
      "Tera Insta bio mein 'travel | foodie | dreamer' likha hai (Goa hi gayi hai once)",
    ],
    superpower: "Boring lunch ko Insta-worthy bana deti hai 🍽️",
    weakness: "WiFi nahi hai toh personality 50% drop hoti hai 📶",
    dating: "Tu ex ke posts pe 'fire emoji' likhti hai still 🔥",
    redFlag: "Tera Insta archive me 47 ex-bf wali photos saved hain 🚩",
    futureBf: "Wo banda jo teri photos lene ki patience rakhe (rare gem)",
    bollywoodMatch: "Veronica from Cocktail (Insta era)",
  },
  drama: {
    title: "Drama Queen 🎭",
    emoji: "💃",
    color: "from-red-500 to-orange-600",
    traits: [
      "Tu '5 minute mein aati hu' bolti hai aur 2 ghante lagati hai ⏰",
      "Friends ki problems pe khud rote ho — therapist + best friend combo",
      "Tera har feeling extreme hai — 'mein PERFECT hu' ya 'mein GAYI'",
      "Tu argument win karne ke liye logic chod ke tears use karti hai 😭",
    ],
    superpower: "Bina script ke 30 min monologue dene ki ability 🎤",
    weakness: "Quiet days tujhe kisi se panga lene pe majboor karte hain 🔥",
    dating: "Tu boyfriend ko reform karne ki koshish karti hai (project mode)",
    redFlag: "Tera 'I'm fine' actually 'I'm NOT fine' hai aur banda confused 🚩",
    futureBf: "Wo banda jo tera drama tolerate kare (saint level)",
    bollywoodMatch: "Geet from Jab We Met (full chaos)",
  },
  bookish: {
    title: "Bookish Baby 📚",
    emoji: "🤓",
    color: "from-blue-400 to-indigo-500",
    traits: [
      "Tu books pe rooti hai, par WhatsApp university bhi same passion se follow karti hai 😆",
      "Tera coffee shop main 'book aesthetic' photo zaroor hota hai 📸",
      "Tu real life mein shy, but ek baar comfortable hua to overthinking start ho jaati hai",
      "'Pride and Prejudice' tera personality test hai bhai 🌹",
    ],
    superpower: "Logo ko silently dekh ke unka pura analysis kar leti hai 🕵️",
    weakness: "Crush ke saamne brain freeze + face red 🥵",
    dating: "Tu ladke ke saath baat karne se pehle 5 mahine soch ti hai 🐢",
    redFlag: "Tu commitment mein 100% hai but emotionally process nahi karti 🚩",
    futureBf: "Wo banda jo tujhe book recommendations bhej ke heart steal kare 📖",
    bollywoodMatch: "Naina from YJHD (pre-Bunny era)",
  },
  princess: {
    title: "Daddy's Princess 👑",
    emoji: "💖",
    color: "from-pink-300 to-rose-400",
    traits: [
      "Tu daddy ko 'main best beti' bolti hai, daddy maan jaate hain 🥺",
      "Tera Insta DP 6 mahine se same hai (perfectly edited) 📸",
      "Daddy ka credit card tera unofficial accessory hai 💳",
      "Tu chote bhai/behen ko boss karti hai but sab tere ko spoiled bolte hain 👸",
    ],
    superpower: "Pout face karke kuch bhi manvana 🥰",
    weakness: "Real life problems se panic attack — daddy bachao mode 📞",
    dating: "Tu future bf ko daddy se compete karwati hai (no one wins)",
    redFlag: "Tera 'I'm not high-maintenance' biggest lie hai is samay ka 🚩",
    futureBf: "Wo banda jo daddy approve kare AND daddy se zyada lutaaye 💸",
    bollywoodMatch: "Poo from K3G (princess unbothered era)",
  },
  party: {
    title: "Party Animal 🍾",
    emoji: "💃",
    color: "from-yellow-400 to-orange-500",
    traits: [
      "Tu Friday se Sunday tak 'chill mode' permanent on hai 🍷",
      "Reels mein dancing tera unofficial career hai 💃",
      "Tu kisi bhi situation mein 'we should party' bolti hai 🎉",
      "Tera weekend hangover Monday ke meeting mein bhi continue hota hai 🥴",
    ],
    superpower: "Boring parties ko zinda kar dene ki ability 🔥",
    weakness: "Mondays tujhe physically destroy karte hain 😩",
    dating: "Tu commitment se zyada 'fun' chahti hai — boys ko confuse karti hai",
    redFlag: "Tera 'I don't want anything serious' baad mein change hota hai (poor bf)",
    futureBf: "Wo banda jo teri energy match kare (gym wala common ground)",
    bollywoodMatch: "Tara from Cocktail (party girl with depth)",
  },
  cleopatra: {
    title: "Sasti Cleopatra 💅",
    emoji: "👸",
    color: "from-purple-500 to-pink-500",
    traits: [
      "Tu 5000 ka makeup ke saath '\"natural beauty\" tag karti hai 💄",
      "Tera 'main toh bahut humble hu' line dialogues sabse zyada rude hai 😏",
      "Tu group photo mein hamesha center mein khadi hoti hai (bina bole)",
      "Tu 'meri vibe match nahi hoti' aam logon se — tu hi special hai 👑",
    ],
    superpower: "Bina bole sabko intimidate karna 🥶",
    weakness: "Compliments tujhe 30 min ka monologue dete hain 🥹",
    dating: "Tu ladke ko 'auditions' deti hai date karne se pehle 🎬",
    redFlag: "Tu apne friends ki tareef bhi competition feel karti hai 🚩",
    futureBf: "Wo banda jo teri ego ko match kare (royal level chahiye)",
    bollywoodMatch: "Veronica from Cocktail (sass mode)",
  },
  caring: {
    title: "Group Mom 🤱",
    emoji: "🤗",
    color: "from-green-400 to-emerald-500",
    traits: [
      "Tu friends ke phone par bhi reply de deti hai jab unhe nahi karna hota 🤳",
      "Tera bag tissue, sanitizer, painkiller, lipstick — pharmacy hai 💼",
      "Tu sab ki secrets keeper hai but apni khud ki kisi ko nahi pata 🤐",
      "Tu group plan banane mein expert, execute karne mein desperate 📋",
    ],
    superpower: "Empathy level: God-tier — sab tujhe vent karte hain 💛",
    weakness: "Apni problems khud handle karti hai chupke se 😞",
    dating: "Tu mostly ladke ki problems sun ke 'therapist' ban jaati hai 🧘",
    redFlag: "Tu 'I'm fine' bolke 6 mahine andar andar suffer karti hai 🚩",
    futureBf: "Wo banda jo finally tujhse khud puche 'tu kaisi hai' 💕",
    bollywoodMatch: "Anushka from Sultan (silent strong)",
  },
  savage: {
    title: "Desi Savage Girl 🔥",
    emoji: "😈",
    color: "from-red-600 to-rose-700",
    traits: [
      "Tera comeback game next level hai — log block kar dete hain 🥊",
      "Tu sub-tweet karke 47 logon ki naak kaat sakti hai 🔪",
      "'Mujhe drama nahi chahiye' kehti hai aur drama create karti hai 🎭",
      "Tu apni sasti shaadi pe bhi jyada attention le legi 👰",
    ],
    superpower: "Eyes se hi roast karna 👀",
    weakness: "Cute ladke saamne 'savage' switch off ho jata hai 🥺",
    dating: "Tu boyfriend ko challenge karti rehti hai — submissive bf ho ja!",
    redFlag: "Tu apologize karne mein expert nahi hai (kabhi nahi) 🚩",
    futureBf: "Wo banda jo teri savage ko match kare (rare boss type)",
    bollywoodMatch: "Kareena in Jab We Met (Geet 2.0)",
  },
  romantic: {
    title: "Filmy Heroine 💕",
    emoji: "🌹",
    color: "from-rose-400 to-pink-500",
    traits: [
      "Tu Bollywood movies ko life manual maan ti hai 🎬",
      "Pehli date pe 'ye humara future hoga' soch leti hai 💭",
      "Tera Insta saved folder = 50 cute couple posts 💑",
      "Tu pyar mein girti hai 6 baar a year (different boys) 🎯",
    ],
    superpower: "Tiny gestures pe poetry likh dene ki ability ✍️",
    weakness: "Real life heroes movie waale nahi hote 💔",
    dating: "Tu rishton mein zyada expect karti hai — boys disappoint karte hain",
    redFlag: "Tu 'soulmate' word ka use 5 logon ke saath kar chuki hai 🚩",
    futureBf: "Wo banda jo teri filmy expectations set realistic kare (saint)",
    bollywoodMatch: "Simran from DDLJ (waiting for Raj)",
  },
  sass: {
    title: "Sassy Sundari 💃",
    emoji: "💁",
    color: "from-fuchsia-500 to-purple-500",
    traits: [
      "Tu 'I don't care' bolke 4 ghante stalk karti hai uski profile 🕵️",
      "Tera 'okay' ka tone mein 47 emotions chupe hai 🎭",
      "Tu compliments accept karne mein expert nahi — 'oh stop' lekin actually bahut khush",
      "Tera 'attitude' Insta bio mein hai, real life mein meow",
    ],
    superpower: "Mood switching ka master 🎢",
    weakness: "Crush jab notice nahi karta toh full meltdown 💔",
    dating: "Tu ladke ko hot-cold treatment deti hai (mind games queen)",
    redFlag: "Tu 'jealous nahi hu' bolti hai aur stories pe attack karti hai 🚩",
    futureBf: "Wo banda jo tera sass enjoy kare aur match bhi kare 💋",
    bollywoodMatch: "Anushka in Band Baaja Baaraat (sassy queen)",
  },
}

// Compatibility matching by archetype
const COMPATIBILITY = {
  // boys
  sigma: ['bookish', 'caring', 'savage'],
  toxic: ['drama', 'cleopatra', 'sass'],
  mamasBoy: ['caring', 'princess', 'romantic'],
  gymBro: ['party', 'savage', 'instaQueen'],
  swipeKing: ['party', 'instaQueen', 'sass'],
  introvert: ['bookish', 'romantic', 'caring'],
  bro: ['savage', 'party', 'sass'],
  filmy: ['romantic', 'drama', 'bookish'],
  chill: ['caring', 'bookish', 'romantic'],
  intellect: ['bookish', 'cleopatra', 'sass'],
  // girls
  instaQueen: ['gymBro', 'swipeKing', 'intellect'],
  drama: ['toxic', 'filmy', 'bro'],
  bookish: ['sigma', 'introvert', 'intellect'],
  princess: ['mamasBoy', 'gymBro', 'filmy'],
  party: ['gymBro', 'bro', 'swipeKing'],
  cleopatra: ['toxic', 'intellect', 'gymBro'],
  caring: ['mamasBoy', 'introvert', 'chill'],
  savage: ['sigma', 'bro', 'gymBro'],
  romantic: ['filmy', 'introvert', 'chill'],
  sass: ['toxic', 'bro', 'intellect'],
}

// Funny secret meanings
const SECRET_MEANINGS_BOY = [
  "Sanskrit mein 'jo treat kabhi nahi karta' 💸",
  "Persian mein 'midnight Maggi master' 🍜",
  "Urdu mein 'jo har question Google karta hai' 📱",
  "Pali mein 'Netflix marathon emperor' 📺",
  "Greek mein 'Sunday 2pm tak sone wala' 😴",
  "Latin mein 'eternal procrastinator' ⏰",
  "Hindi mein 'WhatsApp status pe sad shayari wala' 💔",
  "Marathi mein 'group ka unofficial therapist' 🧘",
  "Punjabi mein 'jiska gym 50% punctuality 50% Insta' 💪",
  "Bengali mein 'culture ki dukan' 📚",
  "Tamil mein 'sweet but secretly khadoos' 😏",
  "Telugu mein 'ek baar attached, forever obsessed' 💀",
]

const SECRET_MEANINGS_GIRL = [
  "Sanskrit mein 'jo Insta story 47 baar dekhti hai apni' 📸",
  "Persian mein 'midnight cravings warrior' 🍫",
  "Urdu mein 'jo har boyfriend ko 'last love' bolti hai' 💕",
  "Pali mein 'Netflix marathon empress' 👑",
  "Greek mein 'Sunday brunch ki priestess' 🥂",
  "Latin mein 'professional overthinker' 🤯",
  "Hindi mein 'WhatsApp DPs roz change karne wali' 🖼️",
  "Marathi mein 'group ki self-appointed mom' 🤱",
  "Punjabi mein 'jiska makeup bag bigger than backpack' 💄",
  "Bengali mein 'culture aur drama dono khelne wali' 🎭",
  "Tamil mein 'meetha but sasta nakhra' 🍯",
  "Telugu mein 'attention seeker but elegantly' 💃",
]

// Future predictions
const FUTURE_PREDICTIONS_BOY = [
  "Tu 25 mein gym chodke beer belly maintain karega 🍺",
  "Tu shaadi mein dulhe ki tarah nautanki karega 🤵",
  "Tera startup idea har mahine change hoga 💡",
  "Tu Goa cafe khol ke 6 mahine mein band kar dega ☕",
  "Tu apni gf ki dost se married hoga (filmy twist) 💍",
  "Tera bachcha tujhse zyada smart hoga (full guarantee) 🤓",
  "Tu Dubai/Canada PR ke chakkar mein 5 saal lagayega ✈️",
  "Tu apna podcast launch karega — 4 episode baad band 🎙️",
  "Tujhe ek ladki Insta DM karegi aur tera dimaag spin hoga 💫",
  "Tu cricket khelte time chot lagne pe kabhi cricketer ban gaya bolega 🏏",
  "Tera aim 'business' hai — actual mein full-time employee bana 💼",
  "Tu apni shaadi mein DJ se zyada naachega 🕺",
]

const FUTURE_PREDICTIONS_GIRL = [
  "Tu 25 saal mein 'ab serious hu life mein' bolegi par memes wahi rahenge 😂",
  "Tu shaadi pe 6 mahine planning karegi (Pinterest level) 💒",
  "Tera startup idea 'cafe' hi hoga aur Goa mein hi 🌴",
  "Tu apne future bachche ka naam already decide kar chuki hai 👶",
  "Tu Bollywood actress se zyada skincare follow karti hai already 💆",
  "Tera birthday celebrate karne mein 6 events lagenge 🎂",
  "Tu Italy ja ke pasta seekhne ka manifest karegi (5 saal mein nahi gayi) 🍝",
  "Tu apna YouTube vlog channel launch karegi — 3 videos baad band 📹",
  "Tu kisi airport pe celebrity dekhke chillaegi 🛫",
  "Tera ex saath 'closure' chahega — tu ignore karegi (proud moment) 💪",
  "Tu Bali ki photo lagaegi, actually Lonavla gayi hogi 🏝️",
  "Tu wedding mein dulhan se zyada ready hogi 👰",
]

// Lucky colors
const LUCKY_COLORS = [
  { name: "Mustard Yellow", hex: "#fbbf24" },
  { name: "Royal Maroon", hex: "#7f1d1d" },
  { name: "Royal Blue", hex: "#1e40af" },
  { name: "Forest Green", hex: "#15803d" },
  { name: "Sunset Orange", hex: "#ea580c" },
  { name: "Pure White", hex: "#fafafa" },
  { name: "Hot Pink", hex: "#ec4899" },
  { name: "Cosmic Purple", hex: "#7c3aed" },
  { name: "Cream Gold", hex: "#f59e0b" },
  { name: "Deep Black", hex: "#1f2937" },
]

// Bollywood characters
const BOLLYWOOD_BOYS = [
  "Bunny from YJHD", "Rancho from 3 Idiots", "Raj from DDLJ",
  "Sid from Wake Up Sid", "Veer from Dilwale", "Kabir Khan from Chak De",
  "Imran from Wake Up Sid", "Akash from ZNMD", "Murad from Gully Boy",
  "Bittoo from Band Baaja Baaraat",
]
const BOLLYWOOD_GIRLS = [
  "Geet from JWM", "Naina from YJHD", "Poo from K3G",
  "Veronica from Cocktail", "Tara from Cocktail", "Simran from DDLJ",
  "Anushka from Sultan", "Sweety from Hasee Toh Phasee", "Tina from KKHH",
  "Anjali from KKHH",
]

// =================== HELPERS ===================
function hashName(name) {
  return name.toLowerCase().split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
}

function pickFromArray(arr, hash) {
  return arr[hash % arr.length]
}

// Smarter archetype assignment
function determineArchetype(name, gender) {
  const clean = name.toLowerCase().trim()
  const len = clean.length
  const firstChar = clean[0]
  const lastChar = clean[clean.length - 1]
  const vowels = (clean.match(/[aeiou]/g) || []).length
  const consonants = len - vowels
  const hash = hashName(name)
  
  const archetypes = gender === 'boy' ? Object.keys(BOY_ARCHETYPES) : Object.keys(GIRL_ARCHETYPES)
  
  // Use multiple factors for variety
  const factor = (hash + len * 7 + vowels * 13 + consonants * 5) 
  return archetypes[factor % archetypes.length]
}

// Lucky number
function getLuckyNumber(name) {
  return (hashName(name) % 9) + 1
}

function getLuckyColor(name) {
  return LUCKY_COLORS[hashName(name) % LUCKY_COLORS.length]
}

function getMatchPercent(name) {
  return 78 + (hashName(name) % 22) // 78-99
}

function getRedFlagMeter(name) {
  // 0-100, mostly mid-high for fun
  return 40 + (hashName(name) % 55)
}

function getDatingScore(name) {
  return 60 + (hashName(name) % 40) // 60-99
}

// Main function
export function analyzeName(rawName, gender = 'boy') {
  const name = rawName.trim()
  if (!name) return null
  
  const archetypeKey = determineArchetype(name, gender)
  const arch = (gender === 'boy' ? BOY_ARCHETYPES : GIRL_ARCHETYPES)[archetypeKey]
  const hash = hashName(name)
  
  const secretMeanings = gender === 'boy' ? SECRET_MEANINGS_BOY : SECRET_MEANINGS_GIRL
  const futurePredictions = gender === 'boy' ? FUTURE_PREDICTIONS_BOY : FUTURE_PREDICTIONS_GIRL
  const bollywoodChars = gender === 'boy' ? BOLLYWOOD_BOYS : BOLLYWOOD_GIRLS
  
  // Compatibility (mix of opposite gender archetypes)
  const compatibilityKeys = COMPATIBILITY[archetypeKey] || []
  const compatibility = compatibilityKeys.map(key => {
    const archData = BOY_ARCHETYPES[key] || GIRL_ARCHETYPES[key]
    return {
      type: key,
      title: archData.title,
      emoji: archData.emoji,
    }
  })
  
  return {
    name,
    gender,
    archetype: archetypeKey,
    title: arch.title,
    emoji: arch.emoji,
    color: arch.color,
    traits: arch.traits,
    superpower: arch.superpower,
    weakness: arch.weakness,
    dating: arch.dating,
    redFlag: arch.redFlag,
    futureMatch: gender === 'boy' ? arch.futureGf : arch.futureBf,
    bollywoodMatch: arch.bollywoodMatch,
    
    luckyNumber: getLuckyNumber(name),
    luckyColor: getLuckyColor(name),
    bollywoodVibe: pickFromArray(bollywoodChars, hash),
    secretMeaning: pickFromArray(secretMeanings, hash),
    futurePrediction: pickFromArray(futurePredictions, hash * 3),
    matchPercent: getMatchPercent(name),
    redFlagMeter: getRedFlagMeter(name),
    datingScore: getDatingScore(name),
    
    compatibility,
  }
}
