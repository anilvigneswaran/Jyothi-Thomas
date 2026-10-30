import React, { useRef, useState } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  dataCursor?: string
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  style = {},
  dataCursor,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)')
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const normX = (x / rect.width) * 2 - 1
    const normY = (y / rect.height) * 2 - 1

    // Tilt toward cursor +/- 14 degrees
    const rotX = -normY * 14
    const rotY = normX * 14

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px)`)
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.45,
    })
  }

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)')
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      className={className}
      data-cursor={dataCursor}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 20px 48px -12px rgba(255, 31, 31, 0.16)',
        transition: 'transform 0.18s ease-out, box-shadow 0.25s ease',
        transform,
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Moving radial glare */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: `radial-gradient(circle 180px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.7) 0%, transparent 80%)`,
          opacity: glarePos.opacity,
          transition: 'opacity 0.25s ease',
        }}
      />
      {children}
    </div>
  )
}
