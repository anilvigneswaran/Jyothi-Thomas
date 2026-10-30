import React, { useEffect, useRef } from 'react'
import { director, DirectorState } from '../engine/director'
import { frameLoader } from '../engine/frames'

export const Stage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastKeyRef = useRef<string>('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const render = (state: DirectorState) => {
      const { vw, vh, mouseX, frameState } = state
      const { frame, transition, x, k, shotIndex } = frameState
      const loadedCount = frameLoader.getLoadedCount()

      // Render key to avoid redundant canvas draw calls:
      // Redraw only when an input key string changes. Include the loaded-frame count in the key.
      const renderKey = `${frame.toFixed(2)}_${transition.isTransitioning ? transition.t.toFixed(3) : '0'}_${transition.isToContact ? '1' : '0'}_${vw}_${vh}_${loadedCount}_${mouseX.toFixed(2)}`
      if (renderKey === lastKeyRef.current) return
      lastKeyRef.current = renderKey

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.round(vw * dpr)
      const targetH = Math.round(vh * dpr)

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }

      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, targetW, targetH)
      ctx.scale(dpr, dpr)

      const isMobile = vw < 820
      const mouseParallaxX = mouseX * 14

      // Draw helper function for a specific shot and frame
      const drawShotFrame = (
        sIdx: number,
        fVal: number,
        sX: number,
        sK: number,
        shiftX = 0,
        alphaMultiplier = 1
      ) => {
        const { box, cx } = frameLoader.getShotBoxAndCx(sIdx)
        const [bx, by, bw, bh] = box

        let drawX = sX
        let scale = (vh * sK) / 900

        if (isMobile) {
          drawX = 0.5
          scale = Math.min((vh * 0.74) / 900, (vw * 1.05) / Math.max(bw, 1))
        }

        const offY = vh - 900 * scale
        const offX = drawX * vw - cx * 1600 * scale + mouseParallaxX + shiftX

        const destX = offX + bx * scale
        const destY = offY + by * scale
        const destW = bw * scale
        const destH = bh * scale

        const fFloor = Math.floor(fVal)
        const frac = fVal - fFloor

        const img1 = frameLoader.getFrame(fFloor, sIdx)
        if (!img1) return

        ctx.save()
        ctx.globalAlpha = alphaMultiplier

        // Silky motion: draw floor(f), then floor(f)+1 on top at globalAlpha = frac
        ctx.drawImage(img1, destX, destY, destW, destH)

        if (frac > 0.01) {
          const img2 = frameLoader.getFrame(fFloor + 1, sIdx)
          if (img2) {
            ctx.globalAlpha = alphaMultiplier * frac
            ctx.drawImage(img2, destX, destY, destW, destH)
          }
        }
        ctx.restore()
      }

      // Blade transition or standard render
      if (transition.isTransitioning && transition.outgoingScene && transition.incomingScene) {
        const { t, outgoingScene, incomingScene, isToContact } = transition
        const skew = 0.2 * vh
        const e = -skew + (vw + 2 * skew) * t

        const bladeColor = isToContact ? '#ffffff' : '#ff1f1f'

        // 1. Outgoing shot:
        // Clip to polygon right of the line from (e+skew, 0) to (e-skew, vh)
        // Alpha = 1 - 0.35t, shifted +60t px
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(e + skew, 0)
        ctx.lineTo(vw + 100, 0)
        ctx.lineTo(vw + 100, vh)
        ctx.lineTo(e - skew, vh)
        ctx.closePath()
        ctx.clip()

        drawShotFrame(
          outgoingScene.shotIndex,
          outgoingScene.to,
          outgoingScene.x,
          outgoingScene.k,
          60 * t,
          1 - 0.35 * t
        )
        ctx.restore()

        // 2. Incoming shot:
        // Clip to polygon left of that line, shifted -60(1-t) px
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(-100, 0)
        ctx.lineTo(e + skew, 0)
        ctx.lineTo(e - skew, vh)
        ctx.lineTo(-100, vh)
        ctx.closePath()
        ctx.clip()

        drawShotFrame(
          incomingScene.shotIndex,
          incomingScene.from,
          incomingScene.x,
          incomingScene.k,
          -60 * (1 - t),
          1.0
        )
        ctx.restore()

        // 3. Blade: 3px line with 24px glow and 90px gradient trail
        ctx.save()
        // Gradient trail behind the blade
        const trailGradient = ctx.createLinearGradient(e - 90, 0, e, 0)
        trailGradient.addColorStop(0, 'rgba(255, 31, 31, 0)')
        trailGradient.addColorStop(
          1,
          isToContact ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 31, 31, 0.45)'
        )

        ctx.beginPath()
        ctx.moveTo(e + skew - 90, 0)
        ctx.lineTo(e + skew, 0)
        ctx.lineTo(e - skew, vh)
        ctx.lineTo(e - skew - 90, vh)
        ctx.closePath()
        ctx.fillStyle = trailGradient
        ctx.fill()

        // 3px blade line with 24px glow
        ctx.beginPath()
        ctx.moveTo(e + skew, 0)
        ctx.lineTo(e - skew, vh)
        ctx.lineWidth = 3
        ctx.strokeStyle = bladeColor
        ctx.shadowColor = bladeColor
        ctx.shadowBlur = 24
        ctx.stroke()
        ctx.restore()
      } else {
        // Standard single shot frame
        drawShotFrame(shotIndex, frame, x, k)
      }

      ctx.restore()
    }

    const unsub = director.subscribe(render)
    return () => {
      unsub()
    }
  }, [])

  return <canvas ref={canvasRef} className="stage-canvas" />
}
