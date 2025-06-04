'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { InteractiveSpotlight } from "@/components/ui/interactive-spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-screen bg-black border-0 rounded-none relative overflow-hidden">
      {/* Static spotlight for ambient lighting */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      {/* Interactive spotlight that follows mouse */}
      <InteractiveSpotlight />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Content overlay - centered on mobile, left side on desktop */}
        <div className="w-full md:w-1/2 p-8 relative z-10 flex flex-col justify-center items-center md:items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center md:text-left whitespace-nowrap">
            FPT School of Business and Technology
          </h1>
          <p className="mt-4 text-sm md:text-base text-neutral-300 max-w-lg text-center md:text-left whitespace-nowrap">
            Welcome to the AI Digital Training Lab. Your AI Leader journey starts here!
          </p>
        </div>

        {/* Background 3D scene that fills the entire card */}
        <div className="absolute inset-0 w-full h-full md:w-1/2 md:left-1/2 md:inset-y-0">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
} 