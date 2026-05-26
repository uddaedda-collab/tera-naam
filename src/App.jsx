import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import { analyzeName } from './nameAnalyzer'

function App() {
  const [stage, setStage] = useState('input') // input | gender | loading | result
  const [name, setName] = useState('')
  const [gender, setGender] = useState(null)
  const [result, setResult] = useState(null)
  const [shareCount, setShareCount] = useState(
    parseInt(localStorage.getItem('tn_shares') || '0')
  )
  const resultRef = useRef(null)

  const handleNameSubmit = () => {
    if (name.trim().length < 2) return
    setStage('gender')
  }

  const handleGenderSelect = (g) => {
    setGender(g)
    setStage('loading')
    setTimeout(() => {
      setResult(analyzeName(name.trim(), g))
      setStage('result')
      const total = parseInt(localStorage.getItem('tn_total') || '0')
      localStorage.setItem('tn_total', total + 1)
    }, 2400)
  }

  const handleReset = () => {
    setStage('input')
    setName('')
    setGender(null)
    setResult(null)
  }

  const handleShare = async () => {
    const shareText = `🔥 Mera naam ka analysis aaya — full sach!\n\n"${result.name}" — ${result.title}\n\n${result.traits[0]}\n\n💯 Match: ${result.matchPercent}%\n🚩 Red Flag: ${result.redFlagMeter}/100\n\nApna naam check kar 👉 ${window.location.href}\n\nFunny aur sahi 😂`
    
    const newCount = shareCount + 1
    setShareCount(newCount)
    localStorage.setItem('tn_shares', newCount)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tera Naam Kya Bolta Hai? 🔥',
          text: shareText,
          url: window.location.href,
        })
      } catch (e) {}
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(url, '_blank')
    }
  }

  const handleDownload = async () => {
    if (!resultRef.current) return
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#0a0118',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `${result.name}-naam-result.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      alert('Screenshot le le 📸')
    }
  }

  return (
    <div className="min-h-screen bg-magic relative overflow-hidden">
      <FloatingEmojis />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-8">
        <AnimatePresence mode="wait">
          {stage === 'input' && (
            <InputScreen 
              key="input"
              name={name} 
              setName={setName} 
              onSubmit={handleNameSubmit}
            />
          )}
          
          {stage === 'gender' && (
            <GenderScreen 
              key="gender"
              name={name}
              onSelect={handleGenderSelect}
            />
          )}
          
          {stage === 'loading' && (
            <LoadingScreen key="loading" name={name} gender={gender} />
          )}
          
          {stage === 'result' && result && (
            <ResultScreen 
              key="result"
              result={result}
              resultRef={resultRef}
              onShare={handleShare}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
        
        <Footer shareCount={shareCount} />
      </div>
    </div>
  )
}

// ==================== INPUT SCREEN ====================
function InputScreen({ name, setName, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md text-center"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mb-3 text-7xl"
      >
        🔮
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-4xl md:text-5xl font-extrabold mb-3 leading-tight"
      >
        <span className="text-shimmer">तेरा नाम</span>
        <br />
        <span className="text-white">क्या बोलता है? 🔥</span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/70 mb-8 text-base md:text-lg"
      >
        AI bata dega tu kaisa insaan hai 😂
        <br />
        <span className="text-yellow-400/80 text-sm">99% sach, 1% jhooth — tu hi judge kar</span>
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Apna naam likho..."
          maxLength={30}
          className="w-full px-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-xl text-center placeholder-white/40 focus:border-yellow-400 focus:outline-none focus:bg-white/15 transition-all"
          autoFocus
        />
        
        <motion.button
          onClick={onSubmit}
          disabled={name.trim().length < 2}
          className="w-full glow-button py-5 rounded-2xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
        >
          Aage Badh 🚀
        </motion.button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-white/60"
      >
        <span className="px-3 py-1 bg-white/5 rounded-full">⚡ 100% Free</span>
        <span className="px-3 py-1 bg-white/5 rounded-full">🚫 No login</span>
        <span className="px-3 py-1 bg-white/5 rounded-full">📱 Share with friends</span>
        <span className="px-3 py-1 bg-white/5 rounded-full">🔥 Brutal honest</span>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 text-white/50 text-xs"
      >
        🔥 <span className="text-yellow-400 font-bold">{(parseInt(localStorage.getItem('tn_total') || '4287') + 4287).toLocaleString('en-IN')}</span> log apna naam check kar chuke hain
      </motion.p>
    </motion.div>
  )
}

// ==================== GENDER SCREEN ====================
function GenderScreen({ name, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2"
      >
        Hello <span className="text-shimmer capitalize">{name}</span>! 👋
      </motion.h2>
      
      <p className="text-white/70 mb-8">
        Tu ladka hai ya ladki? <br />
        <span className="text-sm text-yellow-400/70">(roast specific banega 😏)</span>
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          onClick={() => onSelect('boy')}
          className="glass-card rounded-3xl p-8 hover:bg-blue-500/20 transition-all border-2 border-blue-400/30 hover:border-blue-400"
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-6xl mb-3">👨</div>
          <p className="font-bold text-white text-lg">Ladka</p>
          <p className="text-xs text-white/50 mt-1">Boy</p>
        </motion.button>
        
        <motion.button
          onClick={() => onSelect('girl')}
          className="glass-card rounded-3xl p-8 hover:bg-pink-500/20 transition-all border-2 border-pink-400/30 hover:border-pink-400"
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-6xl mb-3">👩</div>
          <p className="font-bold text-white text-lg">Ladki</p>
          <p className="text-xs text-white/50 mt-1">Girl</p>
        </motion.button>
      </div>
      
      <p className="mt-8 text-white/40 text-xs">
        ⚠️ Roast hard hoga, dil pe mat le 😜
      </p>
    </motion.div>
  )
}

// ==================== LOADING SCREEN ====================
function LoadingScreen({ name, gender }) {
  const messages = [
    "AI tera naam analyze kar raha hai... 🤔",
    "Stars ko consult kar raha hai... ⭐",
    gender === 'boy' ? "Banda kitna sigma hai check kar raha hai... 🐺" : "Ladki kitni queen hai check kar raha hai... 👑",
    "Bollywood database scan ho raha hai... 🎬",
    "Red flag meter calibrate ho raha hai... 🚩",
    "Final roast ready ho raha hai... 🔥",
  ]
  const [msgIdx, setMsgIdx] = React.useState(0)
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length)
    }, 380)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="text-7xl mb-6"
      >
        🔮
      </motion.div>
      <motion.h2 className="text-2xl font-bold text-white mb-2 capitalize">
        {name}
      </motion.h2>
      <motion.p
        key={msgIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/70"
      >
        {messages[msgIdx]}
      </motion.p>
    </motion.div>
  )
}

// ==================== RESULT SCREEN ====================
function ResultScreen({ result, resultRef, onShare, onDownload, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md space-y-4"
    >
      {/* Result card */}
      <div ref={resultRef} className="result-bg rounded-3xl p-6 border border-white/10 space-y-5">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-3"
          >
            {result.emoji}
          </motion.div>
          <h2 className="font-display text-3xl font-extrabold text-white capitalize mb-2">
            {result.name}
          </h2>
          <p className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${result.color} text-white`}>
            {result.title}
          </p>
          
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1.5 mt-4">
            <div className="bg-white/5 rounded-xl p-2 border border-yellow-400/20">
              <p className="text-xl font-extrabold text-yellow-400">{result.matchPercent}%</p>
              <p className="text-[9px] text-white/60 uppercase">Accurate</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-red-400/20">
              <p className="text-xl font-extrabold text-red-400">{result.redFlagMeter}</p>
              <p className="text-[9px] text-white/60 uppercase">Red Flag 🚩</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-green-400/20">
              <p className="text-xl font-extrabold text-green-400">{result.datingScore}</p>
              <p className="text-[9px] text-white/60 uppercase">Dating</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-purple-400/20">
              <p className="text-xl font-extrabold text-purple-400">{result.rizzScore}</p>
              <p className="text-[9px] text-white/60 uppercase">Rizz 💅</p>
            </div>
          </div>
        </div>
        
        {/* Traits */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Tu hai aisa 👀</p>
          {result.traits.map((trait, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className="bg-white/5 rounded-xl p-3 text-sm text-white/90 leading-relaxed"
            >
              ✓ {trait}
            </motion.div>
          ))}
        </div>
        
        {/* Dating life */}
        <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-4 border border-pink-400/30">
          <p className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">💕 Dating Life</p>
          <p className="text-white text-sm">{result.dating}</p>
        </div>
        
        {/* Red flag */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-400/30">
          <p className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">🚩 Tera Biggest Red Flag</p>
          <p className="text-white text-sm">{result.redFlag}</p>
        </div>

        {/* Biggest L (loss) */}
        <div className="bg-gradient-to-r from-slate-500/20 to-zinc-500/20 rounded-xl p-4 border border-slate-400/30">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">💀 Tera Biggest L</p>
          <p className="text-white text-sm">{result.biggestL}</p>
        </div>

        {/* DM habit */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
          <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">📱 Tera DM Game</p>
          <p className="text-white text-sm">{result.dmHabit}</p>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon="🎯" label="Lucky Number" value={result.luckyNumber} />
          <StatCard 
            icon="🎨" 
            label="Lucky Color" 
            value={
              <span className="flex items-center gap-2 justify-center">
                <span 
                  className="w-3 h-3 rounded-full inline-block" 
                  style={{ background: result.luckyColor.hex }}
                />
                <span className="text-xs">{result.luckyColor.name}</span>
              </span>
            } 
          />
        </div>
        
        {/* Bollywood vibe */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
          <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">🎬 Tera Bollywood Vibe</p>
          <p className="text-white text-sm">{result.bollywoodVibe}</p>
        </div>
        
        {/* Secret meaning */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-400/30">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">🤫 Naam Ka Real Matlab</p>
          <p className="text-white text-sm italic">"{result.name}" — {result.secretMeaning}</p>
        </div>
        
        {/* Power & weakness */}
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-green-500/10 rounded-xl p-3 border border-green-400/20">
            <p className="text-xs font-bold text-green-300 mb-1">⚡ Tera Superpower</p>
            <p className="text-white text-sm">{result.superpower}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-400/20">
            <p className="text-xs font-bold text-orange-300 mb-1">😅 Tera Weakness</p>
            <p className="text-white text-sm">{result.weakness}</p>
          </div>
        </div>
        
        {/* Future match */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-indigo-400/30">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
            💞 Tera Future {result.gender === 'boy' ? 'Wifey' : 'Hubby'}
          </p>
          <p className="text-white text-sm">{result.futureMatch}</p>
        </div>

        {/* Compatibility */}
        {result.compatibility && result.compatibility.length > 0 && (
          <div className="bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-xl p-4 border border-pink-400/30">
            <p className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">
              🔥 Tujhe Match Kareyga
            </p>
            <div className="grid grid-cols-1 gap-2">
              {result.compatibility.map((c, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-white text-xs font-medium">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Future prediction */}
        <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl p-4 border border-violet-400/30">
          <p className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">🔮 5 Saal Baad Tu</p>
          <p className="text-white text-sm">{result.futurePrediction}</p>
        </div>
        
        {/* Watermark */}
        <p className="text-center text-white/30 text-xs pt-2 border-t border-white/10">
          🔥 Tera Naam Kya Bolta Hai? — Apna naam check kar
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={onShare}
          className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-2xl font-bold text-white text-base shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          📲 WhatsApp pe Share Kar
        </motion.button>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={onDownload}
            className="bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold text-white text-sm border border-white/20"
            whileTap={{ scale: 0.98 }}
          >
            📸 Download
          </motion.button>
          <motion.button
            onClick={onReset}
            className="bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold text-white text-sm border border-white/20"
            whileTap={{ scale: 0.98 }}
          >
            🔄 Dusra Naam
          </motion.button>
        </div>
      </div>
      
      {/* Viral CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-2xl p-4 border border-yellow-400/30 text-center"
      >
        <p className="text-white font-bold mb-1">🔥 Apne crush ka naam check kar!</p>
        <p className="text-white/70 text-sm">Friends ko bhej, full pagal ho jaayenge 😂</p>
      </motion.div>
    </motion.div>
  )
}

// ==================== STAT CARD ====================
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <div className="text-white font-bold">{value}</div>
    </div>
  )
}

// ==================== FOOTER ====================
function Footer({ shareCount }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="mt-8 text-center text-white/40 text-xs"
    >
      <p>Made with 🔥 in India</p>
      {shareCount > 0 && (
        <p className="mt-1 text-yellow-400/60">
          Tu {shareCount} {shareCount === 1 ? 'baar' : 'baar'} share kar chuka hai 😎
        </p>
      )}
    </motion.div>
  )
}

// ==================== FLOATING EMOJIS ====================
function FloatingEmojis() {
  const emojis = ['✨', '🔥', '💫', '⭐', '🌟', '💖', '🎭', '🎬']
  return (
    <div className="absolute inset-0 pointer-events-none">
      {emojis.map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-20"
          style={{
            left: `${(i * 12 + 5) % 90}%`,
            top: `${(i * 17 + 10) % 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {e}
        </motion.div>
      ))}
    </div>
  )
}

export default App
