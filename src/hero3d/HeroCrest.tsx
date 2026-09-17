// Hero centerpiece wrapper. Renders the 2D crest instantly, and upgrades to the
// lazy-loaded 3D gold scene on capable sessions. The 2D mark is the fallback for
// reduced-motion, while the three.js chunk loads, and if WebGL ever fails — so
// the hero is never empty and first paint is never blocked.
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import RexMark from '../RexMark'

const Scene = lazy(() => import('./Scene'))

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function HeroCrest() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    // Only upgrade to 3D when motion is allowed and WebGL is available.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch { webgl = false }
    if (!reduced && webgl) setEnabled(true)
  }, [])

  const ghost = <RexMark className="hero-logo" />
  return (
    <div className="hero-mark">
      {enabled ? (
        <GLBoundary fallback={ghost}>
          <Suspense fallback={ghost}>
            <Scene />
          </Suspense>
        </GLBoundary>
      ) : (
        ghost
      )}
    </div>
  )
}
