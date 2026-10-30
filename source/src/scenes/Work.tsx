import React, { useEffect, useRef, useState } from 'react'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA, Project } from '../data'

export const WorkBack: React.FC = () => {
  const gridRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['work']
      if (!metrics || !gridRef.current) return

      const { p, exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      gridRef.current.style.opacity = String(op)

      // Move grid lines with scroll
      gridRef.current.style.backgroundPositionY = `${(p * 360) % 90}px`
    })

    return unsub
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        perspective: '1000px',
      }}
    >
      <div
        ref={gridRef}
        style={{
          position: 'absolute',
          bottom: '-20vh',
          left: '-20vw',
          width: '140vw',
          height: '90vh',
          transform: 'rotateX(68deg)',
          transformOrigin: '50% 100%',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 31, 31, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 31, 31, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, transparent 80%)',
          opacity: 0,
          willChange: 'transform, opacity, background-position',
        }}
      />
    </div>
  )
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export const Work: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const deckRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0)
  const progressBarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['work']
      if (!metrics || !containerRef.current) return

      const { enter, p, exit, vis } = metrics
      const vh = state.vh

      // Fade out fast on exit
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)

      // Entry: deck comes up from below with rotateY -25deg
      if (deckRef.current) {
        const entryProgress = Math.min(enter * 1.4, 1)
        const rotY = (1 - entryProgress) * -25
        const transY = (1 - entryProgress) * 120
        deckRef.current.style.transform = `rotateY(${rotY}deg) translateY(${transY}px)`
      }

      // Scroll mapping with dwell on each card:
      // q = i + easeInOut(frac), d = q - i
      const totalCards = PORTFOLIO_DATA.projects.length // 3
      const numTransitions = totalCards - 1 // 2
      const rawPos = p * numTransitions
      const currentIdx = Math.min(numTransitions - 1, Math.floor(rawPos))
      const segmentFrac = rawPos - currentIdx

      // Dwell in the middle 50% of the scroll window
      let frac = 0
      if (segmentFrac > 0.65) {
        frac = 1
      } else if (segmentFrac > 0.25) {
        frac = (segmentFrac - 0.25) / 0.40
      }

      const q = currentIdx + easeInOut(frac)

      setActiveCardIndex(Math.min(totalCards - 1, Math.round(q)))

      // Update 140px progress bar
      if (progressBarRef.current) {
        const barWidth = Math.min(140, Math.max(0, p * 140))
        progressBarRef.current.style.width = `${barWidth}px`
      }

      cardsRef.current.forEach((cardEl, i) => {
        if (!cardEl) return
        const d = q - i

        let z = 0
        let y = 0
        let rotX = 0
        let cardOpacity = 1

        if (d < 0) {
          // Upcoming cards: z = d * 300, y = d * 3.2vh, fading
          z = d * 300
          y = d * (3.2 * vh) / 100
          rotX = 0
          cardOpacity = Math.max(0, 1 + d * 0.75)
        } else {
          // Leaving cards: z = d * 900, y = -12d vh, rotateX = 28d, opacity = 1 - 1.8d
          z = d * 900
          y = -12 * d * (vh / 100)
          rotX = 28 * d
          cardOpacity = Math.max(0, 1 - 1.8 * d)
        }

        cardEl.style.transform = `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg)`
        cardEl.style.opacity = String(Math.max(0, Math.min(1, cardOpacity)))
        cardEl.style.pointerEvents = Math.abs(d) < 0.45 ? 'auto' : 'none'
      })
    })

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          left: '5vw',
          top: '12vh',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem',
          pointerEvents: 'auto',
        }}
      >
        <div className="font-mono" style={{ fontSize: '12px' }}>
          <span className="num-red">(02)</span> — WORK / SELECTED PROJECTS
        </div>

        {/* Anton counter 01 / 03 */}
        <div
          style={{
            fontFamily: 'var(--font-anton)',
            fontSize: '22px',
            color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ color: 'var(--red)' }}>
            {String(activeCardIndex + 1).padStart(2, '0')}
          </span>{' '}
          / {String(PORTFOLIO_DATA.projects.length).padStart(2, '0')}
        </div>

        {/* 140px progress bar */}
        <div
          style={{
            width: '140px',
            height: '2px',
            backgroundColor: 'rgba(13, 13, 13, 0.12)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              width: '0px',
              height: '100%',
              backgroundColor: 'var(--red)',
              borderRadius: '1px',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* 3D Deck Container */}
      <div
        ref={deckRef}
        className="work-deck-container"
        style={{
          position: 'absolute',
          left: '5vw',
          top: '23vh',
          width: 'min(56vw, 940px)',
          height: '55vh',
          perspective: '1500px',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
      >
        {PORTFOLIO_DATA.projects.map((proj, idx) => (
          <div
            key={proj.id}
            ref={(el) => {
              if (el) cardsRef.current[idx] = el
            }}
            data-cursor="Open"
            className="work-card-grid mobile-panel"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              borderRadius: '30px',
              boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(13, 13, 13, 0.08)',
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.85fr',
              overflow: 'hidden',
              padding: '2.4rem',
              gap: '2rem',
              willChange: 'transform, opacity',
            }}
          >
            {/* Left Column */}
            <div
              style={{
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
                  <span className="num-red">{proj.number}</span> // {proj.category}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-anton)',
                    fontSize: 'clamp(36px, 3.7vw, 70px)',
                    lineHeight: 0.92,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                  }}
                >
                  {proj.title}
                </h3>

                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--mute)',
                    lineHeight: 1.45,
                    marginBottom: '1.5rem',
                  }}
                >
                  {proj.description}
                </p>

                {/* 4 tech chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {proj.chips.map((chip, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(13, 13, 13, 0.04)',
                        border: '1px solid rgba(13, 13, 13, 0.08)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* View details link */}
              <div>
                <a
                  href={PORTFOLIO_DATA.personal.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Open"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontFamily: 'var(--font-anton)',
                    fontSize: '18px',
                    color: 'var(--red)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    gap: '4px',
                  }}
                >
                  View Details ↗
                </a>
              </div>
            </div>

            {/* Right Column: Red Visual Panel with CSS Mock */}
            <div
              className="card-visual-panel"
              style={{
                backgroundColor: 'var(--red)',
                borderRadius: '20px',
                padding: '1.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                color: '#ffffff',
              }}
            >
              {renderProjectMock(proj)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderProjectMock(proj: Project) {
  if (proj.mockType === 'gauge') {
    // Animated Gauge / Speedometer dial
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <svg viewBox="0 0 100 70" style={{ width: '85%', maxWidth: '220px' }}>
          <path
            d="M 15 60 A 40 40 0 0 1 85 60"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 15 60 A 40 40 0 0 1 75 30"
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="50" cy="58" r="5" fill="#ffffff" />
          <line x1="50" y1="58" x2="72" y2="32" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: 'var(--font-anton)', fontSize: '28px', marginTop: '0.4rem' }}>
          99.4%
        </div>
        <div className="font-mono" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>
          LOGIC ENGINE ACCURACY
        </div>
      </div>
    )
  }

  if (proj.mockType === 'matrix') {
    // Heatmap grid / Matrix
    return (
      <div style={{ width: '100%', padding: '0.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '24px',
                borderRadius: '4px',
                backgroundColor: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                boxShadow: i % 3 === 0 ? '0 0 10px rgba(255,255,255,0.5)' : undefined,
              }}
            />
          ))}
        </div>
        <div
          className="font-mono"
          style={{
            marginTop: '1.2rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '10px',
          }}
        >
          REAL-TIME TELEMETRY STREAM
        </div>
      </div>
    )
  }

  // Chat bubbles
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.25)',
          padding: '10px 14px',
          borderRadius: '16px 16px 16px 4px',
          fontSize: '12px',
          maxWidth: '85%',
        }}
      >
        Analyzing recursive complexity...
      </div>
      <div
        style={{
          alignSelf: 'flex-end',
          backgroundColor: '#ffffff',
          color: 'var(--red)',
          padding: '10px 14px',
          borderRadius: '16px 16px 4px 16px',
          fontSize: '12px',
          fontWeight: 600,
          maxWidth: '85%',
        }}
      >
        Optimal O(log N) achieved! ✦
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.25)',
          padding: '10px 14px',
          borderRadius: '16px 16px 16px 4px',
          fontSize: '12px',
          maxWidth: '85%',
        }}
      >
        Verified 24 test assertions.
      </div>
    </div>
  )
}
