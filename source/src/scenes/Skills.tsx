import React, { useEffect, useRef, useState } from 'react'
import { director, DirectorState } from '../engine/director'
import { PORTFOLIO_DATA } from '../data'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

interface SpherePoint {
  skill: string
  x: number
  y: number
  z: number
  screenX: number
  screenY: number
  depth: number
}

function computeSpherePoints(
  skills: string[],
  vw: number,
  vh: number,
  rotAngle: number,
  mouseX: number
): SpherePoint[] {
  const N = skills.length
  const R = Math.min(0.27 * vw, 0.46 * vh)
  const centerX = 0.5 * vw
  const centerY = 0.52 * vh
  const tilt = -0.28

  return skills.map((skill, i) => {
    // Fibonacci sphere distribution with half-step offset to eliminate stationary poles
    const yNorm = 1 - ((i + 0.5) / N) * 2
    // Guarantee generous horizontal radius so every skill (including Digital Archiving) actively orbits
    const radiusAtY = Math.sqrt(Math.max(0.22, 1 - yNorm * yNorm))
    const theta = i * GOLDEN_ANGLE + rotAngle + mouseX * 0.4

    const rawX = Math.cos(theta) * radiusAtY * R
    const rawZ = Math.sin(theta) * radiusAtY * R
    const rawY = yNorm * R * 0.78 // y squashed by .78

    // Tilt by -0.28 rad around X axis
    const cosT = Math.cos(tilt)
    const sinT = Math.sin(tilt)
    const tiltedY = rawY * cosT - rawZ * sinT
    const tiltedZ = rawY * sinT + rawZ * cosT

    return {
      skill,
      x: rawX,
      y: tiltedY,
      z: tiltedZ,
      screenX: centerX + rawX,
      screenY: centerY + tiltedY,
      depth: tiltedZ,
    }
  })
}

// 1. Back half of skills orbit (z < 0) inside .layer-back
export const SkillsBack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [points, setPoints] = useState<SpherePoint[]>([])
  const angleRef = useRef<number>(0)

  useEffect(() => {
    let animId: number

    const tick = () => {
      angleRef.current += 0.003
      const state = director.state
      const metrics = state.scenes['skills']
      if (metrics && metrics.vis > 0) {
        const totalAngle = angleRef.current + metrics.p * 5 * Math.PI
        const pts = computeSpherePoints(
          PORTFOLIO_DATA.skills,
          state.vw,
          state.vh,
          totalAngle,
          state.mouseX
        )
        setPoints(pts.filter((p) => p.depth <= 0))
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['skills']
      if (!metrics || !containerRef.current) return
      const { exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)
    })

    return () => {
      cancelAnimationFrame(animId)
      unsub()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      {points.map((pt) => {
        const scale = 0.75 + 0.25 * (pt.depth / 300)
        const op = Math.max(0.35, 0.75 + (pt.depth / 400))
        return (
          <div
            key={pt.skill}
            style={{
              position: 'absolute',
              left: `${pt.screenX}px`,
              top: `${pt.screenY}px`,
              transform: `translate(-50%, -50%) scale(${scale.toFixed(2)})`,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              fontWeight: 600,
              opacity: op,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(255, 31, 31, 0.1)',
            }}
          >
            {pt.skill}
          </div>
        )
      })}
    </div>
  )
}

// 2. Front half of skills orbit (z > 0) inside .layer-front
export const SkillsFront: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [points, setPoints] = useState<SpherePoint[]>([])
  const angleRef = useRef<number>(0)

  useEffect(() => {
    let animId: number

    const tick = () => {
      angleRef.current += 0.003
      const state = director.state
      const metrics = state.scenes['skills']
      if (metrics && metrics.vis > 0) {
        const totalAngle = angleRef.current + metrics.p * 5 * Math.PI
        const pts = computeSpherePoints(
          PORTFOLIO_DATA.skills,
          state.vw,
          state.vh,
          totalAngle,
          state.mouseX
        )
        setPoints(pts.filter((p) => p.depth > 0))
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['skills']
      if (!metrics || !containerRef.current) return
      const { exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)
    })

    return () => {
      cancelAnimationFrame(animId)
      unsub()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      {points.map((pt) => {
        const scale = 1.0 + 0.3 * (pt.depth / 300)
        return (
          <div
            key={pt.skill}
            style={{
              position: 'absolute',
              left: `${pt.screenX}px`,
              top: `${pt.screenY}px`,
              transform: `translate(-50%, -50%) scale(${scale.toFixed(2)})`,
              backgroundColor: 'var(--red)',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 24px rgba(255, 31, 31, 0.6), 0 8px 16px rgba(0, 0, 0, 0.15)',
            }}
          >
            {pt.skill}
          </div>
        )
      })}
    </div>
  )
}

// 3. Section inner content (Title & bottom Marquee tape)
export const Skills: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const metrics = state.scenes['skills']
      if (!metrics || !containerRef.current) return

      const { p, exit, vis } = metrics
      const op = vis * Math.max(0, 1 - exit * 2.4)
      containerRef.current.style.opacity = String(op)

      // Marquee tape moves with scroll
      if (marqueeTrackRef.current) {
        const shiftX = (p * -450) % 600
        marqueeTrackRef.current.style.transform = `translateX(${shiftX}px)`
      }
    })

    return unsub
  }, [])

  const marqueeSkills = [...PORTFOLIO_DATA.skills, ...PORTFOLIO_DATA.skills, ...PORTFOLIO_DATA.skills]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        willChange: 'transform, opacity',
      }}
    >
      {/* Title at top-left */}
      <div
        style={{
          position: 'absolute',
          left: '5vw',
          top: '12vh',
          pointerEvents: 'auto',
        }}
      >
        <div className="font-mono" style={{ fontSize: '12px', marginBottom: '1rem' }}>
          <span className="num-red">(04)</span> — TOOLKIT / CORE DISCIPLINES
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-anton)',
            fontSize: 'clamp(44px, 5.5vw, 96px)',
            lineHeight: 0.88,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
        >
          <div>EVERYTHING</div>
          <div style={{ color: 'var(--red)' }}>IN ORBIT.</div>
        </h2>
      </div>

      {/* Red marquee tape at bottom: 10vh high and rotated -2deg */}
      <div
        style={{
          position: 'absolute',
          bottom: '2vh',
          left: '-5vw',
          width: '110vw',
          height: '10vh',
          backgroundColor: 'var(--red)',
          transform: 'rotate(-2deg)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 4,
          boxShadow: '0 8px 30px rgba(255, 31, 31, 0.35)',
        }}
      >
        <div
          ref={marqueeTrackRef}
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            willChange: 'transform',
          }}
        >
          {marqueeSkills.map((sk, idx) => (
            <span
              key={idx}
              style={{
                fontFamily: 'var(--font-anton)',
                fontSize: 'clamp(28px, 3.2vh, 44px)',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: '0 1.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.2rem',
              }}
            >
              <span>{sk}</span>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
