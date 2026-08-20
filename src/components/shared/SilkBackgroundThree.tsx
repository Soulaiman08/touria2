'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main(){
    vec2 uv = vUv;
    float t = uTime;

    // Waves from all directions — random flutter
    float h = 0.0;
    // Horizontal waves
    h += sin(uv.x * 4.0 - t * 1.8) * 0.35;
    h += sin(uv.x * 7.0 + t * 1.3 + 1.0) * 0.2;
    // Vertical waves
    h += sin(uv.y * 3.5 + t * 1.5 + 2.0) * 0.35;
    h += cos(uv.y * 6.0 - t * 1.0 + 3.0) * 0.2;
    // Diagonal waves
    h += sin((uv.x + uv.y) * 5.0 - t * 1.6) * 0.25;
    h += cos((uv.x - uv.y) * 4.5 + t * 1.2 + 1.5) * 0.2;
    // Extra randomness
    h += sin(uv.x * 3.0 + uv.y * 4.0 + t * 0.8 + 5.0) * 0.15;

    // Normal from analytical derivatives
    float dx = cos(uv.x*4.0-t*1.8)*0.35*4.0
              + cos(uv.x*7.0+t*1.3+1.0)*0.2*7.0
              + cos((uv.x+uv.y)*5.0-t*1.6)*0.25*5.0
              + cos((uv.x-uv.y)*4.5+t*1.2+1.5)*0.2*4.5
              + cos(uv.x*3.0+uv.y*4.0+t*0.8+5.0)*0.15*3.0;
    float dy = cos(uv.y*3.5+t*1.5+2.0)*0.35*3.5
              + cos(uv.y*6.0-t*1.0+3.0)*0.2*6.0
              + cos((uv.x+uv.y)*5.0-t*1.6)*0.25*5.0
              - cos((uv.x-uv.y)*4.5+t*1.2+1.5)*0.2*4.5
              + cos(uv.x*3.0+uv.y*4.0+t*0.8+5.0)*0.15*4.0;
    vec3 normal = normalize(vec3(-dx, -dy, 2.0));

    // Lighting
    vec3 lightDir = normalize(vec3(0.4, 0.5, 1.0));
    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, normalize(lightDir + vec3(0,0,1))), 0.0), 16.0);

    // Colors — warm taupe silk
    float n = h * 0.8 + 0.5;
    vec3 dark   = vec3(0.20, 0.16, 0.12);
    vec3 mid    = vec3(0.50, 0.42, 0.33);
    vec3 bright = vec3(0.78, 0.70, 0.58);

    vec3 color = mix(dark, mid, smoothstep(0.15, 0.55, n));
    color = mix(color, bright, smoothstep(0.45, 0.9, n));
    color = color * (0.4 + diff * 0.6) + vec3(1.0, 0.96, 0.88) * spec * 0.45;

    gl_FragColor = vec4(color, 1.0);
  }
`

export function SilkBackgroundThree() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.innerWidth <= 768) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(1)
    renderer.setClearColor(0x1a1410)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader,
      uniforms: { uTime: { value: 0 } },
    })
    scene.add(new THREE.Mesh(geometry, material))

    const onResize = () => renderer.setSize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      material.uniforms.uTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <>
      <style>{`@media(max-width:768px){.silk-three-container{display:none!important}}`}</style>
      <div ref={containerRef} aria-hidden className="silk-three-container"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
    </>
  )
}
