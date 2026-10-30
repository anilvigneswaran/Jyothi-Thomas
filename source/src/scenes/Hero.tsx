import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA } from '../data'

export const HeroBack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lettersRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    // Intro animation: letters rise from yPercent 115 / rotateX -80, stagger .07, expo.out 1.6s
    if (lettersRef.current.length > 0) {
      gsap.fromTo(
        lettersRef.current,
        {
          yPercent: 115,
          rotateX: -80,
          opacity: 0,
        },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.6,
          stagger: 0.07,
          ease: 'expo.out',
          delay: 0.2,
        }
      )
    }

    const unsub = director.subscribe((state: DirectorState) => {
      const heroMetrics = state.scenes['hero']
      if (!heroMetrics || !containerRef.current) return

      const { p, exit } = heroMetrics
      // Fade out on exit
      const opacity = Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(opacity)

      // Tiny alternating vertical parallax
      lettersRef.current.forEach((el, idx) => {
        if (!el) return
        const sign = idx % 2 === 0 ? 1 : -1
        const shiftY = p * 40 * sign
        el.style.transform = `translateY(${shiftY}px)`
      })
    })

    return unsub
  }, [])

  const nameLetters = PORTFOLIO_DATA.personal.firstName.split('')

  return (
    <div
      ref={containerRef}
      className="hero-giant-name"
      style={{
        position: 'absolute',
        top: '10.5vh',
        right: '3vw',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        perspective: '1200px',
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 'min(18.5vw, 36vh)',
          lineHeight: 0.85,
          color: 'var(--red)',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          display: 'flex',
        }}
      >
        {nameLetters.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lettersRef.current[i] = el
            }}
            style={{
              display: 'inline-block',
              transformOrigin: '50% 100%',
              willChange: 'transform, opacity',
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}

export const Hero: React.FC = () => {
  const frontRef = useRef<HTMLDivElement | null>(null)
  const line1Ref = useRef<HTMLDivElement | null>(null)
  const line2Ref = useRef<HTMLDivElement | null>(null)
  const highlighterRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    // Masked line slide-up on intro
    const tl = gsap.timeline({ delay: 0.3 })
    tl.fromTo(
      [line1Ref.current, line2Ref.current],
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12, ease: 'expo.out' }
    )

    const unsub = director.subscribe((state: DirectorState) => {
      const heroMetrics = state.scenes['hero']
      if (!heroMetrics || !frontRef.current) return

      const { p, exit } = heroMetrics

      // Fade out on exit fast
      const opacity = Math.max(0, 1 - exit * 2.4)
      const transY = -exit * 50
      frontRef.current.style.opacity = String(opacity)
      frontRef.current.style.transform = `translateY(${transY}px)`

      // Red highlighter underline grows with scroll progress (reading effect)
      if (highlighterRef.current) {
        const highlightWidth = Math.min(100, Math.max(0, p * 150))
        highlighterRef.current.style.width = `${highlightWidth}%`
      }
    })

    return unsub
  }, [])

  return (
    <div
      ref={frontRef}
      className="hero-front-col mobile-panel"
      style={{
        position: 'absolute',
        left: '5vw',
        top: '26vh',
        width: 'min(47vw, 780px)',
        zIndex: 3,
        pointerEvents: 'auto',
        willChange: 'transform, opacity',
      }}
    >
      {/* Intro label */}
      <div
        className="font-mono"
        style={{
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--mute)',
        }}
      >
        <span className="num-red">(00)</span> — Hi, I'm{' '}
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
          {PORTFOLIO_DATA.personal.fullName}
        </strong>{' '}
        —
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontFamily: 'var(--font-anton)',
          fontSize: 'clamp(56px, 7.6vw, 156px)',
          lineHeight: 0.88,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          marginBottom: '1.8rem',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div ref={line1Ref} style={{ color: 'var(--ink)' }}>
            {PORTFOLIO_DATA.personal.roleLine1}
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div ref={line2Ref} style={{ color: 'var(--red)' }}>
            {PORTFOLIO_DATA.personal.roleLine2}
          </div>
        </div>
      </h1>

      {/* 3-line description with animated red highlighter */}
      <div
        style={{
          position: 'relative',
          maxWidth: '31em',
          fontSize: 'clamp(16px, 1.35vw, 23px)',
          lineHeight: 1.45,
          color: 'var(--ink)',
          marginBottom: '2.5rem',
        }}
      >
        <span style={{ position: 'relative', display: 'inline' }}>
          {PORTFOLIO_DATA.personal.heroDescription}
          <span
            ref={highlighterRef}
            style={{
              position: 'absolute',
              bottom: '1px',
              left: 0,
              height: '3px',
              backgroundColor: 'var(--red)',
              width: '0%',
              borderRadius: '2px',
              pointerEvents: 'none',
              transition: 'width 0.1s linear',
            }}
          />
        </span>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
        <button
          className="btn-pill btn-pill-red"
          data-cursor="See"
          onClick={() => director.scrollToScene(2)}
        >
          <span className="btn-fill" />
          <span className="btn-text-roll">
            <span className="btn-text-inner">
              <span className="btn-text-line">See my work ↘</span>
              <span className="btn-text-line">See my work ↘</span>
            </span>
          </span>
        </button>

        <a
          href={PORTFOLIO_DATA.personal.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill btn-pill-outline"
          data-cursor="PDF"
        >
          <span className="btn-fill" />
          <span className="btn-text-roll">
            <span className="btn-text-inner">
              <span className="btn-text-line">Download résumé</span>
              <span className="btn-text-line">Download résumé</span>
            </span>
          </span>
        </a>
      </div>
    </div>
  )
}
