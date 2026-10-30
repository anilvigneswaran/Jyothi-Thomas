import React, { useEffect, useRef } from 'react'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA } from '../data'

export const Awards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const counterCardsRef = useRef<HTMLDivElement[]>([])
  const cylinderContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['awards']
      if (!metrics || !containerRef.current) return

      const { enter, p, exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)

      // Four flip-in counter cards: rotateX -100 -> 0, staggered
      counterCardsRef.current.forEach((el, idx) => {
        if (!el) return
        const staggerStart = idx * 0.12
        const cardProgress = Math.min(Math.max((enter - staggerStart) / 0.4, 0), 1)
        const rotX = (1 - cardProgress) * -100
        const transY = (1 - cardProgress) * 40
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) translateY(${transY}px)`
        el.style.opacity = String(cardProgress)
      })

      // Certifications cylinder rotation:
      // container at translateZ(-360px) rotateX(-14deg) rotateY(-p * (360 - 360 / N)), perspective 1600
      if (cylinderContainerRef.current) {
        const N = PORTFOLIO_DATA.awards.certifications.length
        const rotY = -p * (360 - 360 / N)
        const isMobile = state.vw < 820
        const scale = isMobile ? 0.7 : 1.0

        cylinderContainerRef.current.style.transform = `scale(${scale}) translateZ(-360px) rotateX(-14deg) rotateY(${rotY}deg)`
      }
    })

    return unsub
  }, [])

  const N = PORTFOLIO_DATA.awards.certifications.length

  return (
    <div
      ref={containerRef}
      className="awards-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12vh 5vw 6vh 5vw',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top Header */}
      <div style={{ pointerEvents: 'auto' }}>
        <div className="font-mono" style={{ fontSize: '12px', marginBottom: '0.8rem' }}>
          <span className="num-red">(05)</span> — RECOGNITION & CERTIFICATIONS
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(40px, 4.8vw, 84px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
        >
          <div>PROVEN</div>
          <div style={{ color: 'var(--red)' }}>EXCELLENCE.</div>
        </h2>
      </div>

      {/* Middle: Four flip-in counter cards in a row */}
      <div
        className="counter-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          maxWidth: '850px',
          pointerEvents: 'auto',
          marginTop: '1.2rem',
        }}
      >
        {PORTFOLIO_DATA.awards.counters.map((c, idx) => {
          const isRed = c.accent === 'red'
          return (
            <div
              key={idx}
              ref={(el) => {
                if (el) counterCardsRef.current[idx] = el
              }}
              data-cursor="Check"
              style={{
                backgroundColor: isRed ? 'var(--red)' : 'var(--ink)',
                color: '#ffffff',
                borderRadius: '20px',
                padding: '1.4rem 1.2rem',
                transformOrigin: '50% 0%',
                willChange: 'transform, opacity',
                boxShadow: isRed
                  ? '0 12px 32px rgba(255, 31, 31, 0.25)'
                  : '0 12px 32px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  marginBottom: '0.4rem',
                }}
              >
                {c.platform}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-anton)',
                  fontSize: 'clamp(36px, 3.8vw, 56px)',
                  lineHeight: 0.9,
                  letterSpacing: '0.01em',
                }}
              >
                {c.value}
                <span style={{ fontSize: '0.7em', marginLeft: '2px', color: '#ffffff' }}>
                  {c.suffix}
                </span>
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginTop: '0.4rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {c.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom: 3D Certifications Cylinder */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          perspective: '1600px',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={cylinderContainerRef}
          style={{
            position: 'relative',
            width: '290px',
            height: '178px',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            transition: 'transform 0.1s linear',
          }}
        >
          {PORTFOLIO_DATA.awards.certifications.map((cert, i) => {
            const rotCardY = (360 / N) * i
            const isCardRed = i % 3 === 0

            return (
              <div
                key={cert.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '290px',
                  height: '178px',
                  transform: `rotateY(${rotCardY}deg) translateZ(360px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Front Face */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: isCardRed ? 'var(--red)' : '#ffffff',
                    color: isCardRed ? '#ffffff' : 'var(--ink)',
                    borderRadius: '18px',
                    border: `1.5px solid ${isCardRed ? 'var(--red)' : 'rgba(13, 13, 13, 0.1)'}`,
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.12)',
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '10px',
                        color: isCardRed ? 'rgba(255, 255, 255, 0.8)' : 'var(--mute)',
                      }}
                    >
                      CERTIFICATION // 0{i + 1}
                    </div>

                    {/* Checkmark seal */}
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isCardRed ? '#ffffff' : 'var(--red)',
                        color: isCardRed ? 'var(--red)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-anton)',
                        fontSize: '19px',
                        lineHeight: 1.05,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em',
                        marginBottom: '0.3rem',
                      }}
                    >
                      {cert.title}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: isCardRed ? 'rgba(255, 255, 255, 0.9)' : 'var(--mute)',
                      }}
                    >
                      {cert.issuer}
                    </div>
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      fontSize: '10px',
                      color: isCardRed ? 'rgba(255, 255, 255, 0.75)' : 'var(--mute)',
                    }}
                  >
                    {cert.date}
                  </div>
                </div>

                {/* Back Face (Full Ring Effect) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '18px',
                    background:
                      'linear-gradient(135deg, rgba(255, 31, 31, 0.2), rgba(255, 31, 31, 0.45))',
                    border: '1px solid rgba(255, 31, 31, 0.3)',
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
