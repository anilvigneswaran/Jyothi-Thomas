import React, { useEffect, useRef, useState } from 'react'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA } from '../data'

export const ContactBack: React.FC = () => {
  const redBgRef = useRef<HTMLDivElement | null>(null)
  const giantTextRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const { vh, vw, frameState } = state
      const { activeScene, transition } = frameState
      const isContact = activeScene.id === 'contact'
      const isTransToContact = transition.isTransitioning && transition.isToContact

      if (!redBgRef.current) return

      if (isTransToContact) {
        // Blade clip-path identical to canvas transition
        const t = transition.t
        const skew = 0.2 * vh
        const e = -skew + (vw + 2 * skew) * t

        redBgRef.current.style.opacity = '1'
        redBgRef.current.style.clipPath = `polygon(0 0, ${e + skew}px 0, ${e - skew}px ${vh}px, 0 ${vh}px)`
      } else if (isContact) {
        redBgRef.current.style.opacity = '1'
        redBgRef.current.style.clipPath = 'none'
      } else {
        // Hidden before the Contact scene
        redBgRef.current.style.opacity = '0'
      }

      // Giant white LET'S TALK in Anton: fades and rises on enter
      const metrics = state.scenes['contact']
      if (metrics && giantTextRef.current) {
        const { enter } = metrics
        const transY = (1 - enter) * 70
        giantTextRef.current.style.transform = `translateY(${transY}px)`
        giantTextRef.current.style.opacity = String(enter)
      }
    })

    return unsub
  }, [])

  return (
    <div
      ref={redBgRef}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ff1f1f',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0,
        overflow: 'hidden',
        willChange: 'clip-path, opacity',
      }}
    />
  )
}

export const Contact: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [underlineWidth, setUnderlineWidth] = useState('100%')

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['contact']
      if (!metrics || !containerRef.current) return

      const { enter, vis } = metrics
      containerRef.current.style.opacity = String(vis * Math.min(enter * 1.5, 1))
    })

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      className="contact-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 5vw 4vh 5vw',
        willChange: 'opacity',
      }}
    >
      {/* Main Row: Bottom-left email and Bottom-right stacked links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '2.5rem',
          marginBottom: '3.5rem',
          pointerEvents: 'auto',
        }}
      >
        {/* Bottom-left: Heading and Email */}
        <div style={{ maxWidth: 'min(42vw, 680px)' }}>
          <div
            className="font-mono"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              letterSpacing: '0.04em',
              marginBottom: '0.8rem',
            }}
          >
            (06) — START A CONVERSATION
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-anton)',
              fontSize: 'clamp(52px, 7.2vw, 118px)',
              lineHeight: 0.88,
              textTransform: 'uppercase',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '2rem',
            }}
          >
            LET'S TALK.
          </h2>

          <a
            href={`mailto:${PORTFOLIO_DATA.personal.email}`}
            data-cursor="Write"
            onMouseEnter={() => setUnderlineWidth('0%')}
            onMouseLeave={() => setUnderlineWidth('100%')}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-anton)',
              fontSize: 'clamp(34px, 3.7vw, 74px)',
              lineHeight: 0.92,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: '#ffffff',
              position: 'relative',
              paddingBottom: '6px',
            }}
          >
            <div>{PORTFOLIO_DATA.personal.emailName}</div>
            <div className="contact-email-domain" style={{ color: 'var(--ink)' }}>
              {PORTFOLIO_DATA.personal.emailDomain}
            </div>

            {/* White underline that wipes on hover */}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: underlineWidth,
                height: '3px',
                backgroundColor: '#ffffff',
                transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </a>
        </div>

        {/* Bottom-right: Stacked links with hairline separators and rotating ↗ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '220px',
          }}
        >
          {[
            { label: 'LinkedIn', url: PORTFOLIO_DATA.personal.linkedinUrl, cursor: 'Connect' },
            { label: 'Download Résumé', url: PORTFOLIO_DATA.personal.resumeUrl, cursor: 'PDF' },
          ].map((lnk, idx) => (
            <a
              key={idx}
              href={lnk.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor={lnk.cursor}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderTop: idx === 0 ? '1px solid rgba(255, 255, 255, 0.25)' : undefined,
                borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontFamily: 'var(--font-anton)',
                fontSize: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const arrow = e.currentTarget.querySelector('.arrow-icon') as HTMLElement
                if (arrow) arrow.style.transform = 'translate(3px, -3px) rotate(45deg)'
              }}
              onMouseLeave={(e) => {
                const arrow = e.currentTarget.querySelector('.arrow-icon') as HTMLElement
                if (arrow) arrow.style.transform = 'translate(0px, 0px) rotate(0deg)'
              }}
            >
              <span>{lnk.label}</span>
              <span
                className="arrow-icon"
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontSize: '20px',
                }}
              >
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer: © year, full name, and "Back to top ↑" */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          pointerEvents: 'auto',
        }}
      >
        <div className="font-mono">
          © {PORTFOLIO_DATA.personal.copyrightYear} {PORTFOLIO_DATA.personal.fullName}. ALL RIGHTS RESERVED.
        </div>

        <button
          onClick={() => director.scrollToTop()}
          data-cursor="Top"
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Back to top ↑
        </button>
      </footer>
    </div>
  )
}
