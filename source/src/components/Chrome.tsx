import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { director, SCENES, DirectorState } from '../engine/director'
import { frameLoader } from '../engine/frames'
import { PORTFOLIO_DATA } from '../data'

interface ChromeProps {
  onIntroComplete?: () => void
}

export const Chrome: React.FC<ChromeProps> = ({ onIntroComplete }) => {
  // Preloader state
  const [preloaderDone, setPreloaderDone] = useState(false)
  const preloaderRef = useRef<HTMLDivElement | null>(null)
  const topHalfRef = useRef<HTMLDivElement | null>(null)
  const bottomHalfRef = useRef<HTMLDivElement | null>(null)
  const counterValRef = useRef<HTMLSpanElement | null>(null)
  const monoTopRef = useRef<HTMLDivElement | null>(null)
  const monoBottomRef = useRef<HTMLDivElement | null>(null)

  // HUD refs
  const logoRef = useRef<HTMLAnchorElement | null>(null)
  const navRef = useRef<HTMLDivElement | null>(null)
  const progressPercentRef = useRef<HTMLSpanElement | null>(null)
  const railBarRef = useRef<HTMLDivElement | null>(null)
  const railThumbRef = useRef<HTMLDivElement | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string>('hero')
  const [isWhiteTheme, setIsWhiteTheme] = useState<boolean>(false)

  // Cursor refs (Desktop only)
  const cursorDotRef = useRef<HTMLDivElement | null>(null)
  const cursorRingRef = useRef<HTMLDivElement | null>(null)
  const cursorLabelRef = useRef<HTMLSpanElement | null>(null)
  const cursorState = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    hoverLabel: '',
    isHovered: false,
  })

  // Preloader progress tween
  useEffect(() => {
    let currentDisplayVal = 0
    let targetProgress = 0
    let isFinished = false

    const updateDisplay = () => {
      if (counterValRef.current) {
        counterValRef.current.textContent = String(Math.round(currentDisplayVal)).padStart(3, '0')
      }
    }

    const checkAndFinish = async () => {
      if (isFinished) return
      isFinished = true

      // Wait for first quarter of frames
      await frameLoader.waitForFirstQuarter()

      // Animate 100% counter
      gsap.to(
        { val: currentDisplayVal },
        {
          val: 100,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: function () {
            currentDisplayVal = this.targets()[0].val
            updateDisplay()
          },
          onComplete: () => {
            currentDisplayVal = 100
            updateDisplay()

            // Finish animation:
            // Lines slide up, halves split apart using expo.inOut over 1.2s
            const tl = gsap.timeline({
              onComplete: () => {
                setPreloaderDone(true)
                director.finishPreloader()
                onIntroComplete?.()
              },
            })

            tl.to([monoTopRef.current, monoBottomRef.current, counterValRef.current], {
              y: -50,
              opacity: 0,
              duration: 0.5,
              ease: 'power3.in',
            })
            tl.to(
              topHalfRef.current,
              {
                yPercent: -100,
                duration: 1.2,
                ease: 'expo.inOut',
              },
              '-=0.2'
            )
            tl.to(
              bottomHalfRef.current,
              {
                yPercent: 100,
                duration: 1.2,
                ease: 'expo.inOut',
              },
              '<0'
            )
          },
        }
      )
    }

    const onProgress = (p: number) => {
      targetProgress = p * 100
      gsap.to(
        { val: currentDisplayVal },
        {
          val: targetProgress,
          duration: 0.4,
          ease: 'power1.out',
          onUpdate: function () {
            currentDisplayVal = this.targets()[0].val
            updateDisplay()
          },
        }
      )

      if (p >= 0.99) {
        checkAndFinish()
      }
    }

    frameLoader.init(onProgress)

    // Fallback timer if network is instant or mock
    const fallbackTimer = setTimeout(() => {
      checkAndFinish()
    }, 3500)

    return () => {
      clearTimeout(fallbackTimer)
    }
  }, [onIntroComplete])

  // Director subscriber for HUD updates
  useEffect(() => {
    const unsub = director.subscribe((state: DirectorState) => {
      const activeId = state.frameState.activeScene.id
      setActiveSceneId(activeId)

      // On Contact, only after the blade passes t > 0.6, the HUD turns white
      const inContact = activeId === 'contact'
      const trans = state.frameState.transition
      const whiteMode =
        (inContact && (!trans.isTransitioning || trans.t > 0.6)) ||
        (trans.isTransitioning && trans.isToContact && trans.t > 0.6)

      setIsWhiteTheme(whiteMode)

      // Update progress percent
      if (progressPercentRef.current) {
        const pct = Math.round(state.progress * 100)
        progressPercentRef.current.textContent = `${String(pct).padStart(3, '0')}%`
      }

      // Update vertical rail thumb
      if (railThumbRef.current) {
        railThumbRef.current.style.transform = `translateY(${state.progress * 74}px)`
      }
    })

    return unsub
  }, [])

  // Desktop custom cursor setup
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 820) return

    const handlePointerMove = (e: MouseEvent) => {
      cursorState.current.targetX = e.clientX
      cursorState.current.targetY = e.clientY

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`
      }

      // Check [data-cursor] target
      const target = (e.target as HTMLElement)?.closest('[data-cursor]')
      if (target) {
        const label = target.getAttribute('data-cursor') || 'Go'
        cursorState.current.hoverLabel = label
        cursorState.current.isHovered = true
      } else {
        cursorState.current.isHovered = false
        cursorState.current.hoverLabel = ''
      }
    }

    window.addEventListener('pointermove', handlePointerMove)

    // Ring smooth lerp at 0.16
    let rafId: number
    const loop = () => {
      const { targetX, targetY, isHovered, hoverLabel } = cursorState.current
      cursorState.current.x += (targetX - cursorState.current.x) * 0.16
      cursorState.current.y += (targetY - cursorState.current.y) * 0.16

      if (cursorRingRef.current) {
        const size = isHovered ? 92 : 42
        const half = size / 2
        cursorRingRef.current.style.width = `${size}px`
        cursorRingRef.current.style.height = `${size}px`
        cursorRingRef.current.style.transform = `translate3d(${cursorState.current.x - half}px, ${cursorState.current.y - half}px, 0)`

        if (isHovered) {
          cursorRingRef.current.style.backgroundColor = '#ff1f1f'
          cursorRingRef.current.style.borderColor = '#ff1f1f'
        } else {
          cursorRingRef.current.style.backgroundColor = 'transparent'
          cursorRingRef.current.style.borderColor = isWhiteTheme ? '#ffffff' : '#ff1f1f'
        }
      }

      if (cursorLabelRef.current) {
        cursorLabelRef.current.textContent = isHovered ? hoverLabel : ''
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [isWhiteTheme])

  return (
    <>
      {/* 1. PRELOADER */}
      {!preloaderDone && (
        <div ref={preloaderRef} className="preloader-layer">
          {/* Top Half */}
          <div
            ref={topHalfRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              backgroundColor: '#ff1f1f',
              zIndex: 1,
            }}
          />

          {/* Bottom Half */}
          <div
            ref={bottomHalfRef}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '50%',
              backgroundColor: '#ff1f1f',
              zIndex: 1,
            }}
          />

          {/* Center content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
              color: '#ffffff',
            }}
          >
            <div
              ref={monoTopRef}
              className="font-mono"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                marginBottom: '1rem',
                fontSize: '12px',
                letterSpacing: '0.1em',
              }}
            >
              (00) — INITIALIZING SYSTEM ARCHITECTURE
            </div>

            <div
              style={{
                fontFamily: 'var(--font-anton)',
                fontSize: 'min(26vw, 40vh)',
                lineHeight: 0.88,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
              }}
            >
              <span ref={counterValRef}>000</span>
            </div>

            <div
              ref={monoBottomRef}
              className="font-mono"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                marginTop: '1.2rem',
                fontSize: '12px',
                letterSpacing: '0.1em',
              }}
            >
              {PORTFOLIO_DATA.personal.fullName} — PORTFOLIO 2026
            </div>
          </div>
        </div>
      )}

      {/* 2. HUD LAYER */}
      <header className="hud-layer">
        {/* Left: Logo */}
        <div
          style={{
            position: 'absolute',
            top: '2.5vh',
            left: '3.5vw',
            pointerEvents: 'auto',
          }}
        >
          <a
            ref={logoRef}
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              director.scrollToTop()
            }}
            data-cursor="Top"
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              fontFamily: 'var(--font-anton)',
              fontSize: '28px',
              textTransform: 'uppercase',
              color: isWhiteTheme ? '#ffffff' : 'var(--ink)',
              letterSpacing: '-0.01em',
              transition: 'color 0.4s ease',
            }}
          >
            {PORTFOLIO_DATA.personal.firstName}
            <span
              style={{
                fontSize: '14px',
                color: 'var(--red)',
                marginLeft: '3px',
                position: 'relative',
                top: '-0.4em',
              }}
            >
              ®
            </span>
          </a>
        </div>

        {/* Right: Pill Navigation */}
        <nav
          ref={navRef}
          className="desktop-only"
          style={{
            position: 'absolute',
            top: '2.5vh',
            right: '3.5vw',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.62)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            padding: '5px',
            border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.35)' : 'rgba(13, 13, 13, 0.08)'}`,
            pointerEvents: 'auto',
            transition: 'background-color 0.4s ease, border-color 0.4s ease',
          }}
        >
          {SCENES.map((scene, idx) => {
            const isActive = activeSceneId === scene.id
            let btnBg = 'transparent'
            let btnColor = isWhiteTheme ? '#ffffff' : 'var(--mute)'

            if (isActive) {
              if (isWhiteTheme) {
                // On Contact, active pill becomes white with red text
                btnBg = '#ffffff'
                btnColor = 'var(--red)'
              } else {
                // Standard active item has red fill with white text
                btnBg = 'var(--red)'
                btnColor = '#ffffff'
              }
            }

            return (
              <button
                key={scene.id}
                onClick={() => director.scrollToScene(idx)}
                data-cursor="Go"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '34px',
                  padding: '0 16px',
                  borderRadius: '9999px',
                  backgroundColor: btnBg,
                  color: btnColor,
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {scene.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom-right: Mono progress % and 2px red vertical rail */}
        <div
          style={{
            position: 'absolute',
            bottom: '3.5vh',
            right: '3.5vw',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'none',
          }}
        >
          <span
            ref={progressPercentRef}
            className="font-mono"
            style={{
              fontSize: '12px',
              color: isWhiteTheme ? '#ffffff' : 'var(--mute)',
              transition: 'color 0.4s ease',
            }}
          >
            000%
          </span>

          <div
            ref={railBarRef}
            style={{
              position: 'relative',
              width: '2px',
              height: '80px',
              backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.25)' : 'rgba(13, 13, 13, 0.1)',
              borderRadius: '1px',
              overflow: 'hidden',
            }}
          >
            <div
              ref={railThumbRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '8px',
                backgroundColor: isWhiteTheme ? '#ffffff' : 'var(--red)',
                borderRadius: '1px',
                transition: 'background-color 0.4s ease',
              }}
            />
          </div>
        </div>
      </header>

      {/* 3. CURSOR (DESKTOP ONLY) */}
      <div className="cursor-layer desktop-only">
        {/* 8px red dot with white ring */}
        <div
          ref={cursorDotRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ff1f1f',
            border: '1.5px solid #ffffff',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            zIndex: 91,
          }}
        />

        {/* 42px ring that grows to 92px on hover */}
        <div
          ref={cursorRingRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1.5px solid #ff1f1f',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 90,
            transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease',
          }}
        >
          <span
            ref={cursorLabelRef}
            style={{
              fontFamily: 'var(--font-anton)',
              fontSize: '14px',
              color: '#ffffff',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          />
        </div>
      </div>
    </>
  )
}
