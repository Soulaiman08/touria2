'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const COLS = 60
const ROWS = 42
const VERT_COUNT = COLS * ROWS

// Pre-allocated colors for zero-GC theme transitions
// Day: rich warm Moroccan champagne silk (luminous ivory crests, toasted sandstone valleys)
const DAY_CLOTH_COLOR = new THREE.Color('#b89d7d')
const DAY_SHEEN_COLOR = new THREE.Color('#e6d2b8')
const DAY_BG_COLOR = new THREE.Color('#cfc0ac')
const DAY_HEMI_SKY = new THREE.Color('#fff5e6')
const DAY_HEMI_GROUND = new THREE.Color('#5a432e')

// Night: deep cedarwood-henna silk with antique Moroccan brass highlights
const NIGHT_CLOTH_COLOR = new THREE.Color('#3b1f13')
const NIGHT_SHEEN_COLOR = new THREE.Color('#e6b87d')
const NIGHT_BG_COLOR = new THREE.Color('#130b07')
const NIGHT_HEMI_SKY = new THREE.Color('#b87648')
const NIGHT_HEMI_GROUND = new THREE.Color('#140a06')

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2') || probe.getContext('webgl')
    if (!gl) return true
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER
    const gpu = String(gl.getParameter(param) || '')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu)
  } catch {
    return true
  }
}

// Procedural seamless fine silk twill weave normal map + subtle roughness variation
function createSilkWeaveMaps(maxAnisotropy: number): {
  normalMap: THREE.CanvasTexture
  roughnessMap: THREE.CanvasTexture
} {
  const size = 128

  const normCanvas = document.createElement('canvas')
  normCanvas.width = size
  normCanvas.height = size
  const nCtx = normCanvas.getContext('2d')

  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = size
  roughCanvas.height = size
  const rCtx = roughCanvas.getContext('2d')

  if (nCtx && rCtx) {
    const nImg = nCtx.createImageData(size, size)
    const rImg = rCtx.createImageData(size, size)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const warp = Math.sin((x + y * 0.5) * ((Math.PI * 2) / 4))
        const weft = Math.cos((y - x * 0.5) * ((Math.PI * 2) / 4))
        const nx = warp * 0.28
        const ny = weft * 0.24

        nImg.data[idx] = Math.round((nx * 0.5 + 0.5) * 255)
        nImg.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255)
        nImg.data[idx + 2] = 248
        nImg.data[idx + 3] = 255

        const rVal = Math.round(136 + warp * weft * 18)
        rImg.data[idx] = rVal
        rImg.data[idx + 1] = rVal
        rImg.data[idx + 2] = rVal
        rImg.data[idx + 3] = 255
      }
    }
    nCtx.putImageData(nImg, 0, 0)
    rCtx.putImageData(rImg, 0, 0)
  }

  const normalMap = new THREE.CanvasTexture(normCanvas)
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping
  normalMap.repeat.set(36, 26)
  normalMap.anisotropy = maxAnisotropy

  const roughnessMap = new THREE.CanvasTexture(roughCanvas)
  roughnessMap.wrapS = THREE.RepeatWrapping
  roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.repeat.set(36, 26)
  roughnessMap.anisotropy = maxAnisotropy

  return { normalMap, roughnessMap }
}

export function SilkBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReduced = motionQuery.matches
    let isDark = document.documentElement.classList.contains('dark')
    let themeBlend = isDark ? 1 : 0

    const isSoftwareGl = detectSoftwareWebGL()
    const isCompactMobile = window.innerWidth < 768
    const skipHeavyEffects = isSoftwareGl || isCompactMobile

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !skipHeavyEffects,
        alpha: false,
        powerPreference: isCompactMobile ? 'low-power' : 'high-performance',
      })
    } catch {
      return
    }

    let envTarget: THREE.WebGLRenderTarget | null = null
    let cleanupFns: (() => void) | null = null

    try {
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.02
      renderer.setPixelRatio(
        isSoftwareGl
          ? 1
          : Math.max(0.25, Math.min(window.devicePixelRatio || 1, isCompactMobile ? 1.25 : 1.75))
      )
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.shadowMap.enabled = !skipHeavyEffects
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      scene.background = (isDark ? NIGHT_BG_COLOR : DAY_BG_COLOR).clone()

      // Studio environment reflection (skipped on compact mobile / software WebGL for stability)
      if (!skipHeavyEffects) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer)
        envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04)
        scene.environment = envTarget.texture
        pmremGenerator.dispose()
      }

      const camera = new THREE.PerspectiveCamera(
        34,
        Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight),
        0.1,
        50
      )
      camera.position.set(0, 0, 7.6)

      // Calibrated raking studio lighting: crisp folds & soft self-shadows in Day and Night
      const hemiLight = new THREE.HemisphereLight(
        isDark ? NIGHT_HEMI_SKY : DAY_HEMI_SKY,
        isDark ? NIGHT_HEMI_GROUND : DAY_HEMI_GROUND,
        isDark ? 0.50 : 0.24
      )
      scene.add(hemiLight)

      const keyLight = new THREE.DirectionalLight('#fff2df', isDark ? 2.85 : 2.35)
      keyLight.position.set(6.8, 3.0, 2.5)
      if (!skipHeavyEffects) {
        keyLight.castShadow = true
        keyLight.shadow.mapSize.set(1024, 1024)
        keyLight.shadow.camera.near = 1
        keyLight.shadow.camera.far = 22
        keyLight.shadow.camera.left = -7.5
        keyLight.shadow.camera.right = 7.5
        keyLight.shadow.camera.top = 5.0
        keyLight.shadow.camera.bottom = -5.0
        keyLight.shadow.bias = -0.0008
        keyLight.shadow.normalBias = 0.035
      }
      scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(
      isDark ? '#d98a4e' : '#dfcab0',
      isDark ? 1.15 : 0.28
    )
    rimLight.position.set(-6.2, -1.6, 2.2)
    scene.add(rimLight)

    // Real 3D Verlet cloth simulation buffers (zero GC in loop)
    const clothW = 13.0
    const clothH = 7.2
    const gatherScale = 0.86

    const pos = new Float32Array(VERT_COUNT * 3)
    const prev = new Float32Array(VERT_COUNT * 3)
    const restX = new Float32Array(VERT_COUNT)
    const restY = new Float32Array(VERT_COUNT)
    const restZ = new Float32Array(VERT_COUNT)
    const pinned = new Uint8Array(VERT_COUNT)

    for (let r = 0; r < ROWS; r++) {
      const vFrac = r / (ROWS - 1)
      const y = (0.5 - vFrac) * clothH
      for (let c = 0; c < COLS; c++) {
        const uFrac = c / (COLS - 1)
        const idx = r * COLS + c
        const i3 = idx * 3

        // Diagonal-sweeping natural silk drapery folds
        const diagPhase = uFrac * Math.PI * 6.0 + vFrac * 1.15 + 0.35
        const pleatWave =
          Math.sin(diagPhase) * 0.56 +
          Math.sin(uFrac * Math.PI * 11.5 - vFrac * 0.9 + 1.2) * 0.16
        const x = (uFrac - 0.5) * clothW * gatherScale
        const z = pleatWave * (0.42 + vFrac * 0.58)

        pos[i3] = x
        pos[i3 + 1] = y
        pos[i3 + 2] = z

        prev[i3] = x
        prev[i3 + 1] = y
        prev[i3 + 2] = z

        restX[idx] = x
        restY[idx] = y
        restZ[idx] = z

        if (r === 0) {
          pinned[idx] = 1
        }
      }
    }

    // Store true 3D curved arc rest lengths so horizontal springs preserve sculpted pleats
    const horizRest = new Float32Array(VERT_COUNT)
    const vertRest = new Float32Array(VERT_COUNT)
    const diagARest = new Float32Array(VERT_COUNT)
    const diagBRest = new Float32Array(VERT_COUNT)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c
        const i3 = idx * 3
        if (c < COLS - 1) {
          const j3 = (idx + 1) * 3
          horizRest[idx] = Math.hypot(
            pos[j3] - pos[i3],
            pos[j3 + 1] - pos[i3 + 1],
            pos[j3 + 2] - pos[i3 + 2]
          )
        }
        if (r < ROWS - 1) {
          const j3 = (idx + COLS) * 3
          vertRest[idx] = Math.hypot(
            pos[j3] - pos[i3],
            pos[j3 + 1] - pos[i3 + 1],
            pos[j3 + 2] - pos[i3 + 2]
          )
        }
        if (c < COLS - 1 && r < ROWS - 1) {
          const j3 = (idx + COLS + 1) * 3
          diagARest[idx] = Math.hypot(
            pos[j3] - pos[i3],
            pos[j3 + 1] - pos[i3 + 1],
            pos[j3 + 2] - pos[i3 + 2]
          )
          const k3a = (idx + 1) * 3
          const k3b = (idx + COLS) * 3
          diagBRest[idx] = Math.hypot(
            pos[k3b] - pos[k3a],
            pos[k3b + 1] - pos[k3a + 1],
            pos[k3b + 2] - pos[k3a + 2]
          )
        }
      }
    }

    const geometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(pos, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', posAttr)

    const uvs = new Float32Array(VERT_COUNT * 2)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = (r * COLS + c) * 2
        uvs[idx] = c / (COLS - 1)
        uvs[idx + 1] = 1 - r / (ROWS - 1)
      }
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    const indices: number[] = []
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const a = r * COLS + c
        const b = a + 1
        const d = a + COLS
        const e = d + 1
        indices.push(a, d, b)
        indices.push(b, d, e)
      }
    }
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    const { normalMap, roughnessMap } = createSilkWeaveMaps(maxAniso)

    // Physical woven silk fabric material calibrated so Day mode keeps crisp shadow depth
    const material = new THREE.MeshPhysicalMaterial({
      color: (isDark ? NIGHT_CLOTH_COLOR : DAY_CLOTH_COLOR).clone(),
      roughness: isDark ? 0.58 : 0.64,
      metalness: 0.02,
      sheen: isDark ? 0.95 : 0.35,
      sheenRoughness: isDark ? 0.42 : 0.55,
      sheenColor: (isDark ? NIGHT_SHEEN_COLOR : DAY_SHEEN_COLOR).clone(),
      normalMap,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughnessMap,
      envMapIntensity: isDark ? 0.32 : 0.08,
      side: THREE.DoubleSide,
    })

    const clothMesh = new THREE.Mesh(geometry, material)
    clothMesh.castShadow = !skipHeavyEffects
    clothMesh.receiveShadow = !skipHeavyEffects
    scene.add(clothMesh)

    const raycaster = new THREE.Raycaster()
    const pointerNdc = new THREE.Vector2(0, 0)
    const clothPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const hitPoint = new THREE.Vector3()

    let hasPointer = false
    let touchWx = 0
    let touchWy = 0
    let prevTouchWx = 0
    let prevTouchWy = 0
    let brushVx = 0
    let brushVy = 0
    let touchSpeed = 0
    let isPressed = false

    const solveDistanceConstraint = (a: number, b: number, restLen: number, stiffness: number) => {
      const ia = a * 3
      const ib = b * 3
      const dx = pos[ib] - pos[ia]
      const dy = pos[ib + 1] - pos[ia + 1]
      const dz = pos[ib + 2] - pos[ia + 2]
      const dist = Math.hypot(dx, dy, dz)
      if (dist < 1e-6) return
      const diff = ((dist - restLen) / dist) * stiffness

      const pinA = pinned[a]
      const pinB = pinned[b]
      if (pinA && pinB) return

      if (pinA) {
        pos[ib] -= dx * diff
        pos[ib + 1] -= dy * diff
        pos[ib + 2] -= dz * diff
      } else if (pinB) {
        pos[ia] += dx * diff
        pos[ia + 1] += dy * diff
        pos[ia + 2] += dz * diff
      } else {
        const half = diff * 0.5
        pos[ia] += dx * half
        pos[ia + 1] += dy * half
        pos[ia + 2] += dz * half
        pos[ib] -= dx * half
        pos[ib + 1] -= dy * half
        pos[ib + 2] -= dz * half
      }
    }

    const stepClothPhysics = (dt: number, elapsed: number) => {
      const damping = 0.962
      const dtSq = dt * dt

      brushVx *= Math.exp(-dt * 7.5)
      brushVy *= Math.exp(-dt * 7.5)
      touchSpeed *= Math.exp(-dt * 5.0)

      const touchRadius = 1.55
      const touchRadiusSq = touchRadius * touchRadius

      for (let r = 0; r < ROWS; r++) {
        const vFrac = r / (ROWS - 1)
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c
          if (pinned[idx]) continue

          const i3 = idx * 3
          const x = pos[i3]
          const y = pos[i3 + 1]
          const z = pos[i3 + 2]

          const vx = (x - prev[i3]) * damping
          const vy = (y - prev[i3 + 1]) * damping
          const vz = (z - prev[i3 + 2]) * damping

          prev[i3] = x
          prev[i3 + 1] = y
          prev[i3 + 2] = z

          // Gentle breathing air draft + return spring toward sculpted rest drape
          const breezeZ =
            Math.sin(x * 0.55 + elapsed * 0.65) * 0.45 +
            Math.cos(y * 0.65 - elapsed * 0.48) * 0.32
          const anchorX = (restX[idx] - x) * 1.4
          const anchorY = (restY[idx] - y) * 0.6
          const anchorZ = (restZ[idx] - z) * 0.75

          let fx = anchorX + Math.sin(elapsed * 0.5 + y * 0.4) * 0.16
          let fy = -2.4 + anchorY
          let fz = breezeZ * (0.25 + vFrac * 0.75) + anchorZ

          // Light touch on hanging garment: softly bows inward & glides with brush direction
          if (hasPointer) {
            const dx = x - touchWx
            const dy = y - touchWy
            const d2 = dx * dx + dy * dy
            if (d2 < touchRadiusSq) {
              const w = Math.exp((-d2 / touchRadiusSq) * 3.0)
              const brushForce = w * (1.5 + Math.min(touchSpeed, 9) * 1.05)
              fx += brushVx * brushForce * 0.65
              fy += brushVy * brushForce * 0.65

              const indentStrength = (isPressed ? 9.5 : 3.2) + Math.min(touchSpeed, 7) * 1.15
              fz -= w * indentStrength
            }
          }

          pos[i3] = x + vx + fx * dtSq
          pos[i3 + 1] = y + vy + fy * dtSq
          pos[i3 + 2] = z + vz + fz * dtSq
        }
      }

      // 4 relaxation iterations with true pleated arc rest lengths
      for (let iter = 0; iter < 4; iter++) {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c
            if (c < COLS - 1) solveDistanceConstraint(idx, idx + 1, horizRest[idx], 0.90)
            if (r < ROWS - 1) solveDistanceConstraint(idx, idx + COLS, vertRest[idx], 0.95)
            if (c < COLS - 1 && r < ROWS - 1) {
              solveDistanceConstraint(idx, idx + COLS + 1, diagARest[idx], 0.40)
              solveDistanceConstraint(idx + 1, idx + COLS, diagBRest[idx], 0.40)
            }
          }
        }
      }

      posAttr.needsUpdate = true
      geometry.computeVertexNormals()
    }

    for (let i = 0; i < 20; i++) {
      stepClothPhysics(0.018, i * 0.018)
    }

    let rafId = 0
    let lastTime = 0
    let elapsed = 0.6

    const afterDraw = (cb: () => void) => {
      const rawGl = renderer.getContext() as WebGL2RenderingContext
      if (typeof rawGl.fenceSync !== 'function') {
        rafId = window.setTimeout(cb, 80)
        return
      }
      const sync = rawGl.fenceSync(rawGl.SYNC_GPU_COMMANDS_COMPLETE, 0)
      rawGl.flush()
      const poll = () => {
        const state = sync && rawGl.getSyncParameter(sync, rawGl.SYNC_STATUS)
        if (state === rawGl.UNSIGNALED) {
          rafId = window.setTimeout(poll, 5)
        } else {
          if (sync) rawGl.deleteSync(sync)
          rafId = window.setTimeout(cb, 80)
        }
      }
      rafId = window.setTimeout(poll, 5)
    }

    const updateThemePalette = (dt: number) => {
      const targetBlend = isDark ? 1 : 0
      themeBlend = THREE.MathUtils.damp(themeBlend, targetBlend, 6, dt)

      material.color.copy(DAY_CLOTH_COLOR).lerp(NIGHT_CLOTH_COLOR, themeBlend)
      material.sheenColor.copy(DAY_SHEEN_COLOR).lerp(NIGHT_SHEEN_COLOR, themeBlend)
      material.sheen = THREE.MathUtils.lerp(0.35, 0.95, themeBlend)
      material.sheenRoughness = THREE.MathUtils.lerp(0.55, 0.42, themeBlend)
      material.roughness = THREE.MathUtils.lerp(0.64, 0.58, themeBlend)
      material.envMapIntensity = THREE.MathUtils.lerp(0.08, 0.32, themeBlend)
      if (scene.background instanceof THREE.Color) {
        scene.background.copy(DAY_BG_COLOR).lerp(NIGHT_BG_COLOR, themeBlend)
      }
      hemiLight.color.copy(DAY_HEMI_SKY).lerp(NIGHT_HEMI_SKY, themeBlend)
      hemiLight.groundColor.copy(DAY_HEMI_GROUND).lerp(NIGHT_HEMI_GROUND, themeBlend)
      keyLight.intensity = THREE.MathUtils.lerp(2.35, 2.85, themeBlend)
      rimLight.intensity = THREE.MathUtils.lerp(0.28, 1.15, themeBlend)
      hemiLight.intensity = THREE.MathUtils.lerp(0.24, 0.50, themeBlend)
    }

    const tick = (now: number) => {
      if (document.hidden || prefersReduced) {
        rafId = 0
        return
      }

      try {
        const dt = lastTime === 0 ? 0.016 : Math.min(0.025, (now - lastTime) / 1000)
        lastTime = now
        elapsed += dt

        updateThemePalette(dt)
        stepClothPhysics(dt, elapsed)
        renderer.render(scene, camera)

        if (isSoftwareGl) {
          afterDraw(() => {
            tick(performance.now())
          })
        } else {
          rafId = window.requestAnimationFrame(tick)
        }
      } catch {
        rafId = 0
      }
    }

    const startLoop = () => {
      if (prefersReduced) {
        updateThemePalette(1)
        renderer.render(scene, camera)
        return
      }
      if (!rafId && !document.hidden) {
        lastTime = 0
        rafId = window.requestAnimationFrame(tick)
      }
    }

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
        window.clearTimeout(rafId)
        rafId = 0
      }
    }

    const updateWorldPointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const w = rect.width || window.innerWidth
      const h = rect.height || window.innerHeight
      if (w <= 0 || h <= 0) return

      pointerNdc.x = ((clientX - rect.left) / w) * 2 - 1
      pointerNdc.y = -((clientY - rect.top) / h) * 2 + 1

      raycaster.setFromCamera(pointerNdc, camera)
      if (raycaster.ray.intersectPlane(clothPlane, hitPoint)) {
        if (!hasPointer) {
          hasPointer = true
          touchWx = hitPoint.x
          touchWy = hitPoint.y
          prevTouchWx = hitPoint.x
          prevTouchWy = hitPoint.y
        } else {
          prevTouchWx = touchWx
          prevTouchWy = touchWy
          touchWx = hitPoint.x
          touchWy = hitPoint.y

          const dvx = THREE.MathUtils.clamp((touchWx - prevTouchWx) * 45, -18, 18)
          const dvy = THREE.MathUtils.clamp((touchWy - prevTouchWy) * 45, -18, 18)
          brushVx = THREE.MathUtils.lerp(brushVx, dvx, 0.45)
          brushVy = THREE.MathUtils.lerp(brushVy, dvy, 0.45)
          touchSpeed = Math.hypot(brushVx, brushVy)
        }
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      updateWorldPointer(e.clientX, e.clientY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateWorldPointer(e.clientX, e.clientY)
    }

    const handlePointerDown = (e: PointerEvent) => {
      updateWorldPointer(e.clientX, e.clientY)
      isPressed = true
    }

    const handlePointerUp = () => {
      isPressed = false
    }

    const handleMouseLeave = () => {
      hasPointer = false
      isPressed = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      updateWorldPointer(t.clientX, t.clientY)
      isPressed = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      updateWorldPointer(t.clientX, t.clientY)
    }

    const handleTouchEnd = () => {
      isPressed = false
      hasPointer = false
    }

    const handleResize = () => {
      const w = Math.max(1, window.innerWidth)
      const h = Math.max(1, window.innerHeight)
      camera.aspect = w / h
      // Keep full silk edge-to-edge coverage on ultrawide or zoomed-out aspect ratios
      const halfTanFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))
      const maxSafeZ = 5.05 / (halfTanFov * Math.max(0.5, camera.aspect))
      camera.position.z = Math.min(7.6, maxSafeZ)
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(
        isSoftwareGl
          ? 1
          : Math.max(0.25, Math.min(window.devicePixelRatio || 1, w < 768 ? 1.25 : 1.75))
      )
      renderer.setSize(w, h)
      if (prefersReduced) {
        renderer.render(scene, camera)
      }
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      stopLoop()
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
        updateThemePalette(1)
        renderer.render(scene, camera)
      } else {
        startLoop()
      }
    }

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark')
      if (prefersReduced) {
        updateThemePalette(1)
        renderer.render(scene, camera)
      }
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    handleResize()
    renderer.render(scene, camera)
    startLoop()

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false)
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange)
    } else {
      motionQuery.addListener(handleMotionChange)
    }

    cleanupFns = () => {
      stopLoop()
      themeObserver.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', handleMotionChange)
      } else {
        motionQuery.removeListener(handleMotionChange)
      }

      geometry.dispose()
      normalMap.dispose()
      roughnessMap.dispose()
      material.dispose()
      envTarget?.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
    } catch {
      envTarget?.dispose()
      try {
        renderer.dispose()
      } catch {
        // ignore dispose error
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      return
    }

    return () => {
      cleanupFns?.()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[var(--bg-base)]"
    />
  )
}