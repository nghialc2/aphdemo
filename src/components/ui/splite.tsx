'use client'

import { Suspense, lazy, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

// Professional static background - optimized loading
const StaticBackground = () => (
  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30 relative overflow-hidden">
    {/* Subtle animated particles/dots */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-2000"></div>
      <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-500"></div>
    </div>
    {/* Subtle glow effects */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl"></div>
  </div>
)

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <Suspense fallback={<StaticBackground />}>
      <div className="relative w-full h-full">
        {/* Show static background until 3D scene loads */}
        {!isLoaded && (
          <div className="absolute inset-0 z-10">
            <StaticBackground />
          </div>
        )}
        <Spline
          scene={scene}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </Suspense>
  )
} 