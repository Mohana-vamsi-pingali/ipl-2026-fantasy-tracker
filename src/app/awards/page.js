'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import {
  getAllPlayerStats,
  getAllWinStreaks,
  getImprovementStats,
  getSharpshooterStats,
  getWorstLosingStreaks,
  getSlowestStarters,
  getGhostAwardStats,
  getClosestNearMiss,
  getChampionshipStandings
} from '@/lib/stats'
import { fameAwards, doomAwards, podiumAwards, thanksAwards } from '@/data/awards'

const AWARDS_ENABLED = 1  // Change to 1 to enable the awards page

// --- Compute stats ---
const stats = getAllPlayerStats()
const winStreaks = getAllWinStreaks()
const improvements = getImprovementStats()
const sharpshooters = getSharpshooterStats()
const worstLosingStreaks = getWorstLosingStreaks()
const slowestStarters = getSlowestStarters()
const ghostStats = getGhostAwardStats()
const nearMisses = getClosestNearMiss()

const getMaxPlayers = (list, field) => {
  if (!list || list.length === 0) return ''
  const maxVal = Math.max(...list.map(s => s[field]))
  return list.filter(s => s[field] === maxVal).map(s => s.player).join(', ')
}
const getMinPlayers = (list, field) => {
  if (!list || list.length === 0) return ''
  const minVal = Math.min(...list.map(s => s[field]))
  return list.filter(s => s[field] === minVal).map(s => s.player).join(', ')
}

const getTop3 = (list, field) => {
  if (!list || list.length === 0) return ''
  const sorted = [...list].sort((a, b) => b[field] - a[field]).slice(0, 3)
  return sorted.map((s, i) => `${i + 1}. ${s.player}`).join(', ')
}

const fame = fameAwards.map(aw => {
  let players = ''
  switch (aw.id) {
    case 'fame-1': players = getMaxPlayers(stats, 'totalPoints'); break;
    case 'fame-2': players = getMaxPlayers(stats, 'wins'); break;
    case 'fame-3': players = getMaxPlayers(stats, 'top3'); break;
    case 'fame-4': players = getMaxPlayers(stats, 'bestScore'); break;
    case 'fame-5': players = getMaxPlayers(winStreaks, 'streak'); break;
    case 'fame-6': players = getMaxPlayers(stats, 'gamesPlayed'); break;
    case 'fame-7': players = getMaxPlayers(stats, 'bestTop3Streak'); break;
    case 'fame-8': players = getMinPlayers(stats.filter(s => s.gamesPlayed >= 5), 'stdDev'); break;
    case 'fame-9': players = getMaxPlayers(stats.filter(s => s.gamesPlayed >= 10), 'winRate'); break;
    case 'fame-10': players = getMaxPlayers(improvements, 'improvement'); break;
    case 'fame-11': players = getMaxPlayers(sharpshooters, 'sharpshooterCount'); break;
    case 'fame-12': players = getMaxPlayers(stats, 'silverMedals'); break;
    case 'fame-13': players = getMaxPlayers(stats, 'bronzeMedals'); break;
  }
  return { ...aw, player: players }
})

const doom = doomAwards.map(aw => {
  let players = ''
  switch (aw.id) {
    case 'doom-1': players = getMaxPlayers(stats, 'lastPlaceCount'); break;
    case 'doom-2': players = getMaxPlayers(worstLosingStreaks, 'worstStreak'); break;
    case 'doom-3': players = getMaxPlayers(stats.filter(s => s.gamesPlayed >= 5), 'stdDev'); break;
    case 'doom-4': players = getMinPlayers(slowestStarters, 'earlyAvg'); break;
    case 'doom-5': players = getMaxPlayers(stats, 'skips'); break;
    case 'doom-6': players = getMaxPlayers(ghostStats, 'longestSkipStreak'); break;
    case 'doom-7': players = getMinPlayers(nearMisses, 'gapPercent'); break;
    case 'doom-8': players = 'Pranay'; break; // Hardcoded per request
    case 'doom-9': players = getMinPlayers(stats, 'worstScore'); break;
    case 'doom-10': players = getMaxPlayers(stats, 'belowAvgCount'); break;
    case 'doom-11': players = getMinPlayers(stats.filter(s => s.gamesPlayed >= 10), 'wins'); break;
    case 'doom-12': players = getMinPlayers(improvements, 'improvement'); break;
  }
  return { ...aw, player: players }
})

const championshipStandings = getChampionshipStandings()
const podium = podiumAwards.map(aw => {
  let players = ''
  switch (aw.id) {
    case 'podium-1': players = getTop3(championshipStandings, 'championshipPoints'); break;
    case 'podium-2': players = getTop3(stats, 'wins'); break;
    case 'podium-3': players = getTop3(stats, 'totalPoints'); break;
  }
  return { ...aw, player: players }
})

const thanks = thanksAwards.map(aw => {
  return { ...aw }
})

// --- CSS Animations ---
const animationsCss = `
@keyframes spotlightSweep {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
.animate-spotlight {
  background: linear-gradient(90deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: spotlightSweep 4s linear infinite;
}

.card-perspective-wrapper {
  perspective: 1000px;
  perspective-origin: 50% 0%;
}

.reveal-card {
  opacity: 0;
  transform: rotateX(70deg) translateY(40px) scale(0.92);
  transform-origin: bottom center;
  will-change: transform, opacity;
  transition: transform 900ms cubic-bezier(0.5, 0, 0.2, 1.4), opacity 600ms ease;
}
.reveal-card.is-visible {
  opacity: 1;
  transform: rotateX(0deg) translateY(0px) scale(1);
  will-change: auto;
}

.reveal-image {
  filter: brightness(0.4);
  transition: filter 800ms ease 200ms;
}
.reveal-card.is-visible .reveal-image {
  filter: brightness(1);
}

.reveal-text {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
  transition-delay: 150ms;
}
.reveal-card.is-visible .reveal-text {
  opacity: 1;
  transform: translateY(0);
}

@keyframes flashGold {
  0% { box-shadow: inset 0 0 0 0 transparent; }
  50% { box-shadow: inset 0 0 40px 10px rgba(250, 204, 21, 0.4); }
  100% { box-shadow: inset 0 0 0 0 transparent; }
}
@keyframes flashRed {
  0% { box-shadow: inset 0 0 0 0 transparent; }
  50% { box-shadow: inset 0 0 40px 10px rgba(239, 68, 68, 0.4); }
  100% { box-shadow: inset 0 0 0 0 transparent; }
}

@keyframes pulseGlowFame {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(250, 204, 21, 0.1); }
  40%, 60% { box-shadow: 0 0 25px 8px rgba(250, 204, 21, 0.45); }
}
@keyframes pulseGlowDoom {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.1); }
  40%, 60% { box-shadow: 0 0 25px 8px rgba(220, 38, 38, 0.45); }
}

@media (max-width: 768px) {
  @keyframes pulseGlowFame {
    0%, 100% { box-shadow: 0 0 5px 1px rgba(250, 204, 21, 0.1); }
    40%, 60% { box-shadow: 0 0 15px 4px rgba(250, 204, 21, 0.25); }
  }
  @keyframes pulseGlowDoom {
    0%, 100% { box-shadow: 0 0 5px 1px rgba(220, 38, 38, 0.1); }
    40%, 60% { box-shadow: 0 0 15px 4px rgba(220, 38, 38, 0.25); }
  }
  .reveal-card.is-visible.fame-flash {
    animation: flashGold 500ms ease-out 500ms forwards, pulseGlowFame 8s ease-in-out 700ms infinite;
  }
  .reveal-card.is-visible.doom-flash {
    animation: flashRed 500ms ease-out 500ms forwards, pulseGlowDoom 8s ease-in-out 700ms infinite;
  }
}

.reveal-card.is-visible.fame-flash {
  animation: flashGold 500ms ease-out 500ms forwards, pulseGlowFame 6s ease-in-out 700ms infinite;
}
.reveal-card.is-visible.doom-flash {
  animation: flashRed 500ms ease-out 500ms forwards, pulseGlowDoom 6s ease-in-out 700ms infinite;
}

/* Hover Effects */

/* Hover Effects */
.fame-card-wrapper { transition: transform 300ms ease; }
.fame-card-wrapper:hover { transform: translateY(-6px); }
.fame-card-wrapper:hover .fame-flash { box-shadow: 0 0 35px 12px rgba(250, 204, 21, 0.6) !important; animation: none; }

@keyframes evilShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px) rotate(-0.5deg); }
  40% { transform: translateX(3px) rotate(0.5deg); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
.doom-card-wrapper:hover { animation: evilShake 400ms ease-in-out 1; }

/* Ambient Particles */
@keyframes floatUpFame {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10% { opacity: 0.6; }
  50% { transform: translateY(-50vh) translateX(20px) scale(0.8); opacity: 0.4; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-100vh) translateX(-10px) scale(0.5); opacity: 0; }
}
@keyframes floatUpDoom1 {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10% { opacity: 0.6; }
  50% { transform: translateY(-50vh) translateX(-30px) scale(0.8); opacity: 0.3; }
  75% { opacity: 0.7; }
  100% { transform: translateY(-100vh) translateX(20px) scale(0.5); opacity: 0; }
}
@keyframes floatUpDoom2 {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  25% { opacity: 0.2; }
  50% { transform: translateY(-50vh) translateX(40px) scale(0.8); opacity: 0.6; }
  100% { transform: translateY(-100vh) translateX(-20px) scale(0.5); opacity: 0; }
}

@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink { animation: blinkCursor 500ms step-end infinite; }

/* Curtain Reveal */
.curtain {
  animation: curtainRise 2000ms cubic-bezier(0.4, 0, 0.2, 1) 400ms forwards;
  background: linear-gradient(
    to bottom,
    #1a0000 0%,
    #2d0000 15%,
    #1a0000 30%,
    #2d0000 45%,
    #1a0000 60%,
    #2d0000 75%,
    #1a0000 90%,
    #FFD700 100%
  );
}
.curtain::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to right,
    rgba(0, 0, 0, 0.3) 0px,
    rgba(0, 0, 0, 0) 30px,
    rgba(255, 255, 255, 0.03) 40px,
    rgba(0, 0, 0, 0) 70px,
    rgba(0, 0, 0, 0.3) 100px
  );
}
.curtain-bottom-edge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #FFD700 80%);
  clip-path: polygon(
    0% 40%, 5% 0%, 10% 40%, 15% 10%, 20% 50%,
    25% 15%, 30% 45%, 35% 5%, 40% 40%, 45% 20%,
    50% 50%, 55% 10%, 60% 45%, 65% 0%, 70% 40%,
    75% 15%, 80% 50%, 85% 5%, 90% 40%, 95% 20%,
    100% 40%, 100% 100%, 0% 100%
  );
}
@keyframes curtainRise {
  0% { transform: translateY(0%) rotateZ(0deg); }
  100% { transform: translateY(-100%) rotateZ(0.4deg); }
}

/* Curtain Burst */
@keyframes burstUp {
  0% { transform: translateY(0) translateX(0); opacity: 1; }
  100% { transform: translateY(-30vh) translateX(calc((var(--rand) - 0.5) * 50px)); opacity: 0; }
}

/* Image Wrapper Styles */
.award-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

/* Laptop Responsive Constraints */
@media (min-width: 1024px) {
  .awards-grid {
    max-width: 960px;
    margin: 0 auto;
    gap: 24px;
  }
  .reveal-card {
    max-width: 440px;
    margin: 0 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-modal-enter {
  animation: fadeInScale 300ms cubic-bezier(0.2, 0, 0, 1) forwards;
}
`

// --- Components ---

function AmbientParticles({ tab }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 30 - 10,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 8,
      isDoomVariant: Math.random() > 0.5
    }))
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-transform">
      {particles.map(p => (
        <div key={p.id}
          className={`absolute rounded-full transition-colors duration-1000 ${tab === 'fame' ? 'bg-[#FFD700]' : 'bg-[#FF4444]'}`}
          style={{
            width: '4px', height: '4px',
            left: `${p.left}%`, bottom: `${p.bottom}%`,
            animation: `${tab === 'fame' ? 'floatUpFame' : (p.isDoomVariant ? 'floatUpDoom1' : 'floatUpDoom2')} ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  )
}

function TypewriterText({ text, type }) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const parentCard = containerRef.current?.closest('.reveal-card')
    if (!parentCard) return

    const startTyping = () => {
      if (!text) {
        setDisplayed('None')
        return
      }
      setIsTyping(true)
      setShowCursor(true)

      let i = 0
      let current = ''

      setTimeout(() => {
        const typeChar = () => {
          if (i < text.length) {
            const char = text.charAt(i)
            current += char
            setDisplayed(current)
            i++
            const delay = char === ',' ? 280 : 80
            setTimeout(typeChar, delay)
          } else {
            setIsTyping(false)
            setTimeout(() => setShowCursor(false), 2000)
          }
        }
        typeChar()
      }, 300)
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mut) => {
        if (mut.type === 'attributes' && mut.attributeName === 'class') {
          if (parentCard.classList.contains('is-visible') && !isTyping && displayed === '') {
            startTyping()
          } else if (!parentCard.classList.contains('is-visible')) {
            setDisplayed('')
            setShowCursor(false)
            setIsTyping(false)
          }
        }
      })
    })

    observer.observe(parentCard, { attributes: true })
    if (parentCard.classList.contains('is-visible') && displayed === '') startTyping()

    return () => observer.disconnect()
  }, [text, isTyping, displayed])

  return (
    <p ref={containerRef} className={`text-2xl font-black mb-3 min-h-[32px] ${type === 'fame'
        ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
        : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      }`}>
      {displayed}
      <span className={`inline-block w-[3px] h-[1em] ml-1 align-middle bg-current transition-opacity duration-300 ${showCursor ? 'animate-blink' : 'opacity-0'}`} />
    </p>
  )
}

function Ticker() {
  const [fameCount, setFameCount] = useState(0)
  const [doomCount, setDoomCount] = useState(0)
  const [podiumCount, setPodiumCount] = useState(0)
  const [thanksCount, setThanksCount] = useState(0)

  useEffect(() => {
    let start = null
    const duration = 1500
    const timer = setTimeout(() => {
      const step = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 4)

        setFameCount(Math.floor(ease * 13))
        setDoomCount(Math.floor(ease * 12))
        setPodiumCount(Math.floor(ease * 3))
        setThanksCount(Math.floor(ease * 4))

        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <p className="text-xl text-gray-400 max-w-4xl mx-auto font-medium mt-4 tracking-wide flex flex-wrap items-center justify-center gap-3">
      <span className="text-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]">🏆 {podiumCount} Podium Awards</span>
      <span className="text-gray-600 hidden sm:inline">·</span>
      <span className="text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]">✨ {fameCount} Hall of Fame</span>
      <span className="text-gray-600 hidden sm:inline">·</span>
      <span className="text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]">💀 {doomCount} Hall of Doom</span>
      <span className="text-gray-600 hidden sm:inline">·</span>
      <span className="text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]">🤝 {thanksCount} Special Thanks</span>
    </p>
  )
}

export default function AwardsPage() {
  const [activeTab, setActiveTab] = useState('podium')
  const [displayedTab, setDisplayedTab] = useState('podium')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDir, setSlideDir] = useState('translate-x-0')
  const [selectedAward, setSelectedAward] = useState(null)
  const observerRef = useRef(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedAward) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedAward])

  // Curtain State
  const [showCurtain, setShowCurtain] = useState(true)

  useEffect(() => {
    const t2 = setTimeout(() => setShowCurtain(false), 2500)
    return () => clearTimeout(t2)
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observerRef.current.unobserve(entry.target)
        }
      })
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' })

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll('.reveal-card')
    cards.forEach(card => {
      card.classList.remove('is-visible')
      if (observerRef.current) observerRef.current.observe(card)
    })
  }, [displayedTab])

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setIsTransitioning(true)
    setSlideDir('-translate-x-[30px]') // slide out to left

    setTimeout(() => {
      setDisplayedTab(tab)
      setSlideDir('translate-x-[30px]') // prep slide in from right

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(false)
          setSlideDir('translate-x-0')
        })
      })
    }, 200)
  }

  const renderAwards = (awardsList, type) => (
    <div className={`mx-auto px-4 py-12 grid grid-cols-1 gap-8 awards-grid ${type === 'podium' || type === 'thanks' ? 'max-w-[700px]' : 'max-w-7xl md:max-w-[600px] lg:max-w-none lg:grid-cols-2'}`}>
      {awardsList.map((aw, index) => (
        <div key={aw.id} className={`card-perspective-wrapper cursor-pointer ${type === 'fame' || type === 'podium' || type === 'thanks' ? 'fame-card-wrapper' : 'doom-card-wrapper'}`} onClick={() => setSelectedAward(aw)}>
          <div
            className={`reveal-card flex flex-col overflow-hidden rounded-2xl border-2 bg-[#06091a] shadow-2xl ${type === 'fame' || type === 'podium'
                ? 'fame-flash border-yellow-400/40 shadow-[0_10px_30px_rgba(250,204,21,0.1)]'
                : type === 'thanks'
                ? 'fame-flash border-purple-500/40 shadow-[0_10px_30px_rgba(168,85,247,0.1)]'
                : 'doom-flash border-red-500/40 shadow-[0_10px_30px_rgba(239,68,68,0.1)]'
              }`}
            style={{ transitionDelay: index % 2 !== 0 ? '150ms' : '0ms' }}
          >
            <div className="award-image-wrapper bg-[#0a0f25] border-b border-white/10">
              <Image
                src={aw.image || "/awards/award.jpeg"}
                alt={aw.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 600px, 50vw"
                className="reveal-image rounded-t-xl"
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
                loading="lazy"
              />
            </div>
            <div className="reveal-text p-6 flex flex-col flex-grow bg-gradient-to-b from-white/5 to-transparent relative z-20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{aw.icon}</span>
                <h3 className="text-2xl font-bold text-gray-100">{aw.title}</h3>
              </div>

              <TypewriterText text={aw.player} type={type} />

              <p className="text-base text-gray-400 leading-snug mt-auto">
                {aw.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (!AWARDS_ENABLED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-3xl font-bold text-white mb-3">Awards Coming Soon</h1>
        <p className="text-gray-400 text-lg max-w-md">
          The IPL Fantasy Awards 2026 ceremony is being prepared. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#06091a] overflow-x-hidden text-white">
      <style dangerouslySetInnerHTML={{ __html: animationsCss }} />

      {/* 1. Cinematic Curtain */}
      {showCurtain && (
        <div className="fixed inset-0 z-50 curtain">
          <div className="curtain-bottom-edge" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute bottom-0 bg-[#FFD700] rounded-full"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                '--rand': Math.random(),
                animation: `burstUp ${Math.random() * 400 + 600}ms ease-out 300ms forwards`
              }} />
          ))}
        </div>
      )}

      {/* 5. Ambient Particles */}
      <AmbientParticles tab={displayedTab} />

      {/* Dynamic Background Pulse */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none transition-all duration-1000 ease-in-out ${displayedTab === 'fame'
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.06),transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.06),transparent_70%)]'
          }`}
      />

      <div className="relative z-10">
        {/* Hero Banner */}
        <div className="relative pt-16 pb-8 px-4 text-center border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-spotlight">
            🏆 IPL Fantasy Awards 2026
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Season records. Legends made. Doom earned.
          </p>
          <Ticker />
        </div>

        {/* Sticky Tabs */}
        <div className="sticky top-[61px] z-40 bg-[#06091a]/90 backdrop-blur-md border-b border-white/10 py-4">
          <div className="max-w-2xl mx-auto px-4 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => handleTabChange('podium')}
              className={`flex-1 py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 border-2 min-w-[140px] ${activeTab === 'podium'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
            >
              🏆 Podium
            </button>
            <button
              onClick={() => handleTabChange('fame')}
              className={`flex-1 py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 border-2 min-w-[140px] ${activeTab === 'fame'
                  ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                  : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
            >
              🏆 Hall of Fame
            </button>
            <button
              onClick={() => handleTabChange('doom')}
              className={`flex-1 py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 border-2 ${activeTab === 'doom'
                  ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
            >
              💀 Hall of Doom
            </button>
            <button
              onClick={() => handleTabChange('thanks')}
              className={`flex-1 py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 border-2 min-w-[160px] ${activeTab === 'thanks'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
            >
              🤝 Special Thanks
            </button>
          </div>
        </div>

        {/* Awards Grid Wrapper */}
        <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'} ${slideDir}`}>
          {displayedTab === 'podium' ? renderAwards(podium, 'podium') : displayedTab === 'fame' ? renderAwards(fame, 'fame') : displayedTab === 'thanks' ? renderAwards(thanks, 'thanks') : renderAwards(doom, 'doom')}
        </div>

        {/* Spacer for bottom */}
        <div className="h-16" />
      </div>

      {/* Full-Screen Image Modal */}
      {selectedAward && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-modal-enter" 
          onClick={() => setSelectedAward(null)}
        >
          <div className="relative w-[95vw] h-[95vh] md:w-[90vw] md:h-[90vh] max-w-6xl max-h-[90vh]">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedAward(null); }}
              className="absolute -top-10 right-0 md:-right-10 text-white/70 hover:text-white text-5xl focus:outline-none transition-colors z-50 leading-none"
            >
              &times;
            </button>
            <Image
              src={selectedAward.image || "/awards/award.jpeg"}
              alt={selectedAward.title}
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
