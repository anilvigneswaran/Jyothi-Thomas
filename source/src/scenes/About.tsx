import React, { useEffect, useRef, useState } from 'react'
import { director, DirectorState, clamp } from '../engine/director'
import { TiltCard } from '../components/TiltCard'
import { Odometer } from '../components/Odometer'
import { PORTFOLIO_DATA } from '../data'

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

export const AboutBack: React.FC = () => {
  const backRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['about']
      if (!metrics || !backRef.current) return

      const { enter, vis } = metrics
      // Fades and slides in on enter
      const slideX = (1 - enter) * -120
      backRef.current.style.opacity = String(vis)
      backRef.current.style.transform = `translateX(${slideX}px)`
    })

    return unsub
  }, [])

  return (
    <div
      ref={backRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0,
        willChange: 'transform, opacity',
        background: `
          radial-gradient(60vw 90vh at 22vw 70vh, rgba(255, 31, 31, 0.30), rgba(255, 31, 31, 0.10) 55%, transparent 80%),
          linear-gradient(90deg, rgba(255, 31, 31, 0.04) 0%, transparent 60%)
        `,
      }}
    />
  )
}

export const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const [statsValues, setStatsValues] = useState<number[]>([0, 0, 0])

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['about']
      if (!metrics || !containerRef.current) return

      const { p, exit, vis } = metrics

      // Motion rules: fade out fast on exit using opacity * max(0, 1 - exit * 2.4)
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)
      containerRef.current.style.transform = `translateY(${-exit * 40}px)`

      // Reveal manifesto word by word:
      // opacity .1->1, translateY .25em->0, blur 4px->0
      const totalWords = PORTFOLIO_DATA.about.manifestoWords.length
      wordsRef.current.forEach((wordEl, idx) => {
        if (!wordEl) return
        const wordStart = (idx / totalWords) * 0.75
        const wordEnd = wordStart + 0.25
        const wp = clamp((p - wordStart) / (wordEnd - wordStart))

        const wordOpacity = 0.1 + 0.9 * wp
        const wordTransY = 0.25 * (1 - wp)
        const wordBlur = 4 * (1 - wp)

        wordEl.style.opacity = String(wordOpacity)
        wordEl.style.transform = `translateY(${wordTransY}em)`
        wordEl.style.filter = `blur(${wordBlur.toFixed(1)}px)`
      })

      // Lowest digit snaps with smoothstep .55-1, driven by scroll
      const snapFactor = smoothstep(0.55, 1.0, p)
      const newVals = PORTFOLIO_DATA.about.stats.map((stat) => {
        return stat.targetNumber * snapFactor
      })
      setStatsValues(newVals)
    })

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      className="about-front-col mobile-panel"
      style={{
        position: 'absolute',
        left: '50vw',
        right: '5vw',
        top: '15vh',
        bottom: '7vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 3,
        pointerEvents: 'auto',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top: Section Header & Manifesto */}
      <div>
        <div
          className="font-mono"
          style={{
            marginBottom: '1.2rem',
            fontSize: '12px',
          }}
        >
          <span className="num-red">(01)</span> — ABOUT ME
        </div>

        {/* Manifesto paragraph */}
        <p
          className="manifesto-text"
          style={{
            fontSize: 'clamp(26px, 2.6vw, 50px)',
            color: 'var(--ink)',
            maxWidth: '18em',
          }}
        >
          {PORTFOLIO_DATA.about.manifestoWords.map((item, idx) => (
            <span
              key={idx}
              ref={(el) => {
                if (el) wordsRef.current[idx] = el
              }}
              style={{
                display: 'inline-block',
                marginRight: '0.24em',
                color: item.highlight ? 'var(--red)' : 'var(--ink)',
                willChange: 'transform, opacity, filter',
                transition: 'color 0.2s ease',
              }}
            >
              {item.text}
            </span>
          ))}
        </p>
      </div>

      {/* Bottom: 3 Glass Stat Cards */}
      <div
        className="about-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.2rem',
          marginTop: '2rem',
        }}
      >
        {PORTFOLIO_DATA.about.stats.map((stat, idx) => (
          <TiltCard
            key={idx}
            dataCursor="Stat"
            style={{
              padding: '1.8rem 1.6rem',
              minHeight: '170px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: '11px',
                  color: 'var(--mute)',
                  marginBottom: '0.8rem',
                }}
              >
                {stat.label}
              </div>

              <div style={{ padding: '0.2rem 0', overflow: 'visible' }}>
                <Odometer
                  value={statsValues[idx]}
                  decimals={stat.decimals || 0}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  fontSize="clamp(38px, 3.8vw, 64px)"
                  color="var(--ink)"
                />
              </div>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--mute)',
                marginTop: '0.6rem',
                lineHeight: 1.35,
              }}
            >
              {stat.note}
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
