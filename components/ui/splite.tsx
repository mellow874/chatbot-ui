'use client'
import { Suspense, lazy, CSSProperties } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  style?: CSSProperties
}

export function SplineScene({ scene, className, style }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
        </div>
      }
    >
      <Spline 
        scene={scene} 
        className={className} 
        style={{ ...style, pointerEvents: 'auto' }} 
      />
    </Suspense>
  )
}
