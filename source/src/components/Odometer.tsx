import React from 'react'

interface OdometerProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  digitHeight?: number | string
  fontSize?: string
  color?: string
  stroke?: boolean
}

export const Odometer: React.FC<OdometerProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  digitHeight,
  fontSize = '28px',
  color = 'var(--ink)',
  stroke = false,
}) => {
  const formatted = value.toFixed(decimals)
  const chars = formatted.split('')

  const useCustomHeight = typeof digitHeight === 'number' && digitHeight > 0
  const heightVal = useCustomHeight ? `${digitHeight}px` : '1.24em'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-anton)',
        fontSize,
        lineHeight: 1.24,
        color: stroke ? 'transparent' : color,
        WebkitTextStroke: stroke ? `2px ${color}` : undefined,
        overflow: 'visible',
        whiteSpace: 'nowrap',
      }}
    >
      {prefix && (
        <span style={{ marginRight: '0.1em', lineHeight: 1.24, display: 'inline-block', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {prefix}
        </span>
      )}
      {chars.map((ch, idx) => {
        if (ch === '.' || ch === ',') {
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                width: '0.28em',
                textAlign: 'center',
                lineHeight: 1.24,
                verticalAlign: 'middle',
              }}
            >
              {ch}
            </span>
          )
        }

        const digit = parseInt(ch, 10)
        const validDigit = isNaN(digit) ? 0 : digit
        const translateY = useCustomHeight
          ? `translateY(-${validDigit * (digitHeight as number)}px)`
          : `translateY(-${(validDigit * 1.24).toFixed(3)}em)`

        return (
          <span
            key={idx}
            className="odometer-digit-col"
            style={{
              height: heightVal,
              lineHeight: heightVal,
              width: '0.62em',
              textAlign: 'center',
              overflow: 'hidden',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          >
            <span
              className="odometer-digit-strip"
              style={{
                transform: translateY,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, dIdx) => (
                <span
                  key={dIdx}
                  style={{
                    height: heightVal,
                    lineHeight: heightVal,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        )
      })}
      {suffix && (
        <span
          style={{
            marginLeft: '0.12em',
            lineHeight: 1.24,
            display: 'inline-block',
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
          }}
        >
          {suffix}
        </span>
      )}
    </span>
  )
}

