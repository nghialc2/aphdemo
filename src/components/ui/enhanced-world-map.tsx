"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  theme?: "light" | "dark";
}

export function EnhancedWorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  theme = "light",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] relative font-sans overflow-hidden rounded-xl">
      {/* Ocean background with animated waves */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/20 via-transparent to-blue-700/20"></div>
        {/* Animated wave pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full">
            <defs>
              <pattern id="wave" patternUnits="userSpaceOnUse" width="100" height="20">
                <path d="M0 10 Q25 0 50 10 Q75 20 100 10 V20 H0 Z" fill="rgba(255,255,255,0.1)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave)"/>
          </svg>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0"
        style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.1))" }}
      >
        <defs>
          {/* Gradients for continents */}
          <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          
          <linearGradient id="continentGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <filter id="continentShadow" x="-50%" y="-50%" width="200%" height="200%">
            <dropShadow dx="4" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.3"/>
          </filter>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* North America */}
        <motion.path
          d="M120,60 L180,50 L240,70 L280,90 L320,85 L340,110 L330,140 L300,160 L280,180 L250,190 L200,185 L150,170 L120,150 L100,120 L110,90 Z"
          fill="url(#continentGradient)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.2 }}
        />

        {/* South America */}
        <motion.path
          d="M220,200 L260,210 L280,250 L270,300 L250,340 L230,350 L210,340 L200,310 L190,280 L195,250 L210,220 Z"
          fill="url(#continentGradient)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.4 }}
        />

        {/* Europe */}
        <motion.path
          d="M360,70 L400,60 L440,80 L450,100 L440,120 L420,130 L390,125 L370,110 L355,90 Z"
          fill="url(#continentGradient2)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
        />

        {/* Africa */}
        <motion.path
          d="M370,140 L420,130 L450,150 L460,200 L450,250 L430,300 L410,320 L380,315 L360,290 L350,250 L355,200 L365,170 Z"
          fill="url(#continentGradient2)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />

        {/* Asia */}
        <motion.path
          d="M470,50 L580,60 L650,80 L680,110 L670,150 L650,180 L620,190 L580,185 L540,170 L510,150 L480,120 L475,90 Z"
          fill="url(#continentGradient)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.0 }}
        />

        {/* Australia */}
        <motion.path
          d="M580,280 L640,285 L660,300 L650,320 L620,325 L590,315 L575,300 Z"
          fill="url(#continentGradient2)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          filter="url(#continentShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.2 }}
        />

        {/* Connection paths */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="2"
                filter="url(#glow)"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 2,
                  delay: 1.5 + (0.3 * i),
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="10%" stopColor={lineColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="90%" stopColor={lineColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Connection points */}
        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <motion.circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="4"
                fill={lineColor}
                filter="url(#glow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8 + (i * 0.1), type: "spring", stiffness: 200 }}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="4"
                fill={lineColor}
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  from="4"
                  to="12"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g key={`end-${i}`}>
              <motion.circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="4"
                fill={lineColor}
                filter="url(#glow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8 + (i * 0.1), type: "spring", stiffness: 200 }}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="4"
                fill={lineColor}
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  from="4"
                  to="12"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}

        {/* Decorative elements */}
        <g opacity="0.3">
          {/* Latitude lines */}
          <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          
          {/* Longitude lines */}
          <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="600" y1="0" x2="600" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
        </g>
      </svg>
    </div>
  );
}