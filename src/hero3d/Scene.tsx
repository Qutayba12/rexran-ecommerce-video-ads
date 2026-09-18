// The Rexran crest as a real 3D object: the monogram's SVG outline is extruded
// into a beveled, physically-based gold form lit like a studio shoot. Heavy
// (three.js) — this module is loaded lazily by HeroCrest so it never blocks the
// homepage's first paint. Optimized for every device: DPR is capped, and the
// render loop is paused whenever the hero is off-screen or the tab is hidden.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { R_PATH, PUPIL } from '../RexMark'

const CREST_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2442 1693">` +
  `<g transform="translate(38 1590) scale(1 -1)">` +
  `<path d="${R_PATH}"/>` +
  `<path d="${R_PATH}" transform="translate(2366 0) scale(-1 1)"/>` +
  `<path d="${PUPIL}"/>` +
  `</g></svg>`

function useCrestGeometry() {
  return useMemo(() => {
    const data = new SVGLoader().parse(CREST_SVG)
    const shapes: THREE.Shape[] = []
    for (const p of data.paths) for (const s of p.toShapes()) shapes.push(s)
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 150,
      bevelEnabled: true,
      bevelThickness: 26,
      bevelSize: 16,
      bevelSegments: 3,
      curveSegments: 12,
    })
    geo.rotateX(Math.PI) // SVG is y-down; flip upright (proper rotation keeps winding)
    geo.center()
    geo.computeVertexNormals()
    // scale so the mark is ~3 units wide in the scene
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const w = bb.max.x - bb.min.x
    geo.scale(3 / w, 3 / w, 3 / w)
    geo.computeBoundingBox()
    return geo
  }, [])
}

function Crest() {
  const geo = useCrestGeometry()
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    if (spin.current) spin.current.rotation.y += d * 0.32
    if (tilt.current) {
      tilt.current.rotation.x += (-state.pointer.y * 0.22 - tilt.current.rotation.x) * 0.06
      tilt.current.rotation.y += (state.pointer.x * 0.32 - tilt.current.rotation.y) * 0.06
    }
  })
  return (
    <group ref={tilt}>
      <group ref={spin}>
        <mesh geometry={geo} castShadow={false} receiveShadow={false}>
          <meshStandardMaterial color="#E7C766" metalness={1} roughness={0.26} envMapIntensity={1.5} />
        </mesh>
      </group>
    </group>
  )
}

function Rig() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} color="#fff4d6" />
      <pointLight position={[-5, -2, 4]} intensity={0.7} color="#ffcf7a" />
      {/* procedural studio reflections — no external HDR, CSP-clean */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[3, 3, 4]} scale={[7, 7, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.3} position={[-4, 1, 2]} scale={[5, 5, 1]} color="#ffe9b0" />
        <Lightformer form="ring" intensity={1.6} position={[0, -3, 3]} scale={[4, 4, 1]} color="#ffd07a" />
      </Environment>
    </>
  )
}

export default function Scene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let onScreen = true
    const io = new IntersectionObserver(
      ([e]) => { onScreen = e.isIntersecting; setActive(onScreen && !document.hidden) },
      { threshold: 0.05 },
    )
    io.observe(el)
    const onVis = () => setActive(onScreen && !document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return (
    <div ref={wrap} className="hero3d-canvas">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 38 }}
      >
        <Rig />
        <Crest />
      </Canvas>
    </div>
  )
}
