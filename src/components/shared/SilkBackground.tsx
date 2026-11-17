'use client'

import { useEffect, useRef } from 'react'

const GRID_W = 104
const GRID_H = 68
const FRAME_INTERVAL_MS = 34 // ~29fps smooth ceiling for low CPU/battery impact

interface SilkPalette {
  deep: [number, number, number]
  mid: [number, number, number]
  warm: [number, number, number]
  sheen: [number, number, number]
}

const DAY_PALETTE: SilkPalette = {
  deep: [229, 212, 190], // Warm sandstone silk shadow
  mid: [243, 232, 217], // Fez limestone silk fold
  warm: [224, 185, 146], // Champagne antique brass tint
  sheen: [255, 251, 245], // Ivory silk specular highlight
}

const NIGHT_PALETTE: SilkPalette = {
  deep: [20, 13, 9], // Cedar espresso shadow
  mid: [62, 34, 21], // Terracotta silk fold
  warm: [148, 72, 38], // Burnished Fez henna sheen
  sheen: [224, 186, 132], // Antique brass specular highlight
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

export function SilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Tiny offscreen buffer upscaled smoothly for silky continuous gradients
    const offscreen = document.createElement('canvas')
    offscreen.width = GRID_W
    offscreen.height = GRID_H
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    const imgData = offCtx.createImageData(GRID_W, GRID_H)
    const pixels = imgData.data

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReduced = motionQuery.matches

    let isDark = document.documentElement.classList.contains('dark')
    let rafId = 0
    let lastFrameTime = 0
    let timePhase = 0

    // Normalized pointer coordinates with gentle spring damping
    let targetPx = 0.52
    let targetPy = 0.42
    let curPx = 0.52
    let curPy = 0.42
    let targetEnergy = 0
    let curEnergy = 0

    const resizeCanvas = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Keep canvas backing buffer lightweight (never exceed 1x or small scale)
      const scale = vw <= 768 ? 0.6 : 0.75
      canvas.width = Math.max(320, Math.round(vw * scale))
      canvas.height = Math.max(320, Math.round(vh * scale))
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    const renderFrame = (t: number) => {
      // Smoothly interpolate pointer towards target
      curPx += (targetPx - curPx) * 0.06
      curPy += (targetPy - curPy) * 0.06
      curEnergy += (targetEnergy - curEnergy) * 0.05
      targetEnergy *= 0.94

      const pal = isDark ? NIGHT_PALETTE : DAY_PALETTE

      // Light vector gently influenced by pointer position
      const lx = (curPx - 0.5) * 0.85 + 0.35
      const ly = (curPy - 0.5) * 0.75 + 0.45
      const lz = 1.0
      const lLen = Math.hypot(lx, ly, lz)
      const nLx = lx / lLen
      const nLy = ly / lLen
      const nLz = lz / lLen

      // Half-vector for Blinn-Phong silk sheen
      const hx = nLx
      const hy = nLy
      const hz = nLz + 1.0
      const hLen = Math.hypot(hx, hy, hz)
      const nHx = hx / hLen
      const nHy = hy / hLen
      const nHz = hz / hLen

      let idx = 0
      for (let y = 0; y < GRID_H; y++) {
        const v = y / (GRID_H - 1)
        const dyPtr = v - curPy

        for (let x = 0; x < GRID_W; x++) {
          const u = x / (GRID_W - 1)
          const dxPtr = u - curPx

          // Distance-attenuated gentle silk drape deflection around pointer
          const distSq = dxPtr * dxPtr + dyPtr * dyPtr
          const rippleInfluence = Math.exp(-distSq * 6.5) * (0.28 + curEnergy * 0.65)
          const rippleWave = Math.sin(Math.sqrt(distSq) * 14.0 - t * 2.2) * rippleInfluence

          // Multi-directional flowing silk folds + analytical derivatives
          const w1 = u * 4.2 + v * 1.4 - t * 0.55
          const w2 = u * 2.1 - v * 4.8 + t * 0.42 + 1.1
          const w3 = (u + v) * 6.2 - t * 0.65 + 2.4
          const w4 = (u - v) * 3.4 + t * 0.36 + 0.7

          const height =
            Math.sin(w1) * 0.38 +
            Math.cos(w2) * 0.30 +
            Math.sin(w3) * 0.18 +
            Math.cos(w4) * 0.16 +
            rippleWave * 0.28

          const dhDu =
            Math.cos(w1) * 0.38 * 4.2 -
            Math.sin(w2) * 0.30 * 2.1 +
            Math.cos(w3) * 0.18 * 6.2 -
            Math.sin(w4) * 0.16 * 3.4 -
            dxPtr * rippleInfluence * 2.4

          const dhDv =
            Math.cos(w1) * 0.38 * 1.4 +
            Math.sin(w2) * 0.30 * 4.8 +
            Math.cos(w3) * 0.18 * 6.2 +
            Math.sin(w4) * 0.16 * 3.4 -
            dyPtr * rippleInfluence * 2.4

          // Surface normal
          const nx = -dhDu * 0.28
          const ny = -dhDv * 0.28
          const nz = 1.65
          const nLen = Math.hypot(nx, ny, nz)
          const snx = nx / nLen
          const sny = ny / nLen
          const snz = nz / nLen

          const diff = Math.max(0, snx * nLx + sny * nLy + snz * nLz)
          const specBase = Math.max(0, snx * nHx + sny * nHy + snz * nHz)
          const spec = Math.pow(specBase, isDark ? 10 : 7)

          // Anisotropic silk thread tint along folds
          const foldFactor = clamp01(height * 0.48 + 0.52)
          const warmBand = smoothstep(0.32, 0.86, foldFactor)

          const base = mixRgb(pal.deep, pal.mid, smoothstep(0.12, 0.78, foldFactor))
          const draped = mixRgb(base, pal.warm, warmBand * (isDark ? 0.58 : 0.42))

          const shade = (isDark ? 0.52 : 0.78) + diff * (isDark ? 0.48 : 0.22)
          const sheenBoost = spec * (isDark ? 0.38 : 0.32)

          pixels[idx] = Math.min(255, Math.round(draped[0] * shade + pal.sheen[0] * sheenBoost))
          pixels[idx + 1] = Math.min(255, Math.round(draped[1] * shade + pal.sheen[1] * sheenBoost))
          pixels[idx + 2] = Math.min(255, Math.round(draped[2] * shade + pal.sheen[2] * sheenBoost))
          pixels[idx + 3] = 255
          idx += 4
        }
      }

      offCtx.putImageData(imgData, 0, 0)
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height)
    }

    const tick = (now: number) => {
      if (document.hidden || prefersReduced) {
        rafId = 0
        return
      }

      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        const dt = lastFrameTime === 0 ? 0.032 : Math.min(0.08, (now - lastFrameTime) / 1000)
        lastFrameTime = now
        timePhase += dt * 0.95
        renderFrame(timePhase)
      }

      rafId = window.requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (prefersReduced) {
        renderFrame(timePhase || 0.4)
        return
      }
      if (!rafId && !document.hidden) {
        lastFrameTime = 0
        rafId = window.requestAnimationFrame(tick)
      }
    }

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (window.innerWidth <= 0 || window.innerHeight <= 0) return
      targetPx = clamp01(e.clientX / window.innerWidth)
      targetPy = clamp01(e.clientY / window.innerHeight)
      targetEnergy = 1
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch || window.innerWidth <= 0 || window.innerHeight <= 0) return
      targetPx = clamp01(touch.clientX / window.innerWidth)
      targetPy = clamp01(touch.clientY / window.innerHeight)
      targetEnergy = 1
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopLoop()
      } else {
        startLoop()
      }
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches
      if (prefersReduced) {
        stopLoop()
        renderFrame(0.4)
      } else {
        startLoop()
      }
    }

    const themeObserver = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains('dark')
      if (nextDark !== isDark) {
        isDark = nextDark
        if (prefersReduced) {
          renderFrame(0.4)
        }
      }
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    resizeCanvas()
    renderFrame(0.4)
    startLoop()

    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      stopLoop()
      themeObserver.disconnect()
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[var(--bg-base)]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95"
      />
      {/* Soft center vignette to ensure crisp foreground card legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, transparent 18%, var(--bg-overlay) 100%)',
        }}
      />
    </div>
  )
}