import React, { useEffect, useRef, useState } from 'react'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA } from '../data'
import { Odometer } from '../components/Odometer'

export const JourneyBack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [currentYear, setCurrentYear] = useState<number>(PORTFOLIO_DATA.journey.startYear)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['journey']
      if (!metrics || !containerRef.current) return

      const { p, exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)

      // Colossal outlined year rolling as an odometer from startYear to graduationYear
      const { startYear, graduationYear } = PORTFOLIO_DATA.journey
      const yearVal = Math.round(startYear + (graduationYear - startYear) * p)
      setCurrentYear(yearVal)
    })

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '25vh',
        left: '6vw',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <Odometer
        value={currentYear}
        decimals={0}
        fontSize="min(44vh, 32vw)"
        digitHeight={window.innerHeight * 0.44}
        color="var(--red)"
        stroke={true}
      />
    </div>
  )
}

export const Journey: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])
  const nodesRef = useRef<HTMLDivElement[]>([])
  const svgLineRef = useRef<SVGLineElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['journey']
      if (!metrics || !containerRef.current) return

      const { p, exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)

      // Red SVG line that draws from bottom up: pathLength=1 and dashoffset
      if (svgLineRef.current) {
        // Drawing from bottom to top: offset = 1 - p
        svgLineRef.current.style.strokeDashoffset = String(Math.max(0, 1 - p))
      }

      // Items reveal from bottom with rotateY -55deg -> 0deg
      // 3 items: bottom item is idx 2, middle is 1, top is 0
      const totalItems = PORTFOLIO_DATA.journey.items.length
      itemsRef.current.forEach((el, idx) => {
        if (!el) return
        const reverseOrder = totalItems - 1 - idx
        const itemStart = (reverseOrder / totalItems) * 0.62
        const itemProgress = Math.min(Math.max((p - itemStart) / 0.28, 0), 1)

        const rotY = (1 - itemProgress) * -55
        const transX = (1 - itemProgress) * 40
        const itemOp = itemProgress

        el.style.transform = `perspective(1000px) rotateY(${rotY}deg) translateX(${transX}px)`
        el.style.opacity = String(itemOp)

        // Active node fills red
        const nodeEl = nodesRef.current[idx]
        if (nodeEl) {
          nodeEl.style.backgroundColor = itemProgress > 0.5 ? 'var(--red)' : '#ffffff'
          nodeEl.style.borderColor = itemProgress > 0.5 ? 'var(--red)' : 'rgba(13, 13, 13, 0.2)'
        }
      })
    })

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      className="journey-front-col mobile-panel"
      style={{
        position: 'absolute',
        left: '50vw',
        right: '5vw',
        top: '16vh',
        bottom: '8vh',
        zIndex: 3,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top Header */}
      <div>
        <div className="font-mono" style={{ fontSize: '12px', marginBottom: '1rem' }}>
          <span className="num-red">(03)</span> — TIMELINE / EDUCATION & PATH
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(44px, 5.2vw, 92px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
        >
          <div>LEARNING</div>
          <div style={{ color: 'var(--red)' }}>OUT LOUD.</div>
        </h2>
      </div>

      {/* Timeline track and items */}
      <div
        style={{
          position: 'relative',
          paddingLeft: '3rem',
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
        }}
      >
        {/* Grey 1px track */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            bottom: '10px',
            left: '12px',
            width: '1px',
            backgroundColor: 'rgba(13, 13, 13, 0.15)',
          }}
        />

        {/* Red SVG line drawing bottom-up */}
        <svg
          style={{
            position: 'absolute',
            top: '10px',
            bottom: '10px',
            left: '11px',
            width: '3px',
            height: 'calc(100% - 20px)',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {/* Path from bottom (0, 1) to top (0, 0) */}
          <line
            ref={svgLineRef}
            x1="1.5"
            y1="100%"
            x2="1.5"
            y2="0%"
            stroke="var(--red)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            style={{
              strokeDasharray: '1',
              strokeDashoffset: '1',
              transition: 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>

        {/* 3 Items: newest at the top */}
        {PORTFOLIO_DATA.journey.items.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              if (el) itemsRef.current[idx] = el
            }}
            style={{
              position: 'relative',
              willChange: 'transform, opacity',
            }}
          >
            {/* Timeline node */}
            <div
              ref={(el) => {
                if (el) nodesRef.current[idx] = el
              }}
              style={{
                position: 'absolute',
                left: '-3rem',
                top: '4px',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid rgba(13, 13, 13, 0.25)',
                boxShadow: '0 0 0 4px #ffffff',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
              }}
            />

            {/* Year in mono red */}
            <div
              className="font-mono"
              style={{
                fontSize: '12px',
                color: 'var(--red)',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}
            >
              {item.year}
            </div>

            {/* Title in Anton */}
            <div
              style={{
                fontFamily: 'var(--font-anton)',
                fontSize: 'clamp(20px, 2.1vw, 32px)',
                lineHeight: 1.05,
                color: 'var(--ink)',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </div>

            {/* Organisation */}
            <div
              style={{
                fontSize: '14px',
                color: 'var(--mute)',
                marginTop: '0.3rem',
              }}
            >
              {item.org}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
